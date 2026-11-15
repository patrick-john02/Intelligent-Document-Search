import logging
from datetime import date
from typing import Optional, Literal
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy import select, func, extract, or_
from sqlalchemy.orm import selectinload
 

logger=logging.getLogger(__name__)

#imports
from api.models.document import (
    DocumentModel, DocumentVersion, DocumentCategory,
)
from api.models.users import Users
from core.database import SessionLocal
from tools.access.permissions import clearance_filter


class RecordsFilters(BaseModel):
    category: Optional[str]=Field(None, description="Document type/category, e.g. 'Clearance', 'Leave'. Use list_record_categories for valid names.")
    title_contains: Optional[str]=Field(None, description="Text in the title or file name, e.g. 'DV-2024-00128'.")
    series_year: Optional[int] = Field(None, description="Series year of the document, e.g. 2024.")
    received_from:Optional[date]=Field(None, description="Archived on or after this date (YYYY-MM-DD)")
    received_to: Optional[date] = Field(None, description="Archived on or before this date (YYYY-MM-DD).")
    division: Optional[str] = Field(None, description="Division of the staff who archived it, e.g. 'Accounting'.")
    shelf_contains:Optional[str]=Field(None, description="Text in the physical shelf location, e.g. 'Cabinet 3'.")
    uploaded_by:Optional[str]=Field(None, description="First or Last Name of the staff who archived it.")
    
class FindRecordsArgs(RecordsFilters):
    limit:int=Field(20,ge=1,le=50, description="Max rows to return (1-50).")
    
class CountRecordsArgs(RecordsFilters):
    group_by: Literal["none", "category", "series_year", "month", "division", "shelf"] = Field(
        "none", description="Break the count down by this field. 'month' = month archived."
    )
    


def _base_query(*columns):
    return (
        select(*columns)
        .select_from(DocumentModel)
        .join(DocumentVersion, (DocumentVersion.document_id == DocumentModel.id) & DocumentVersion.is_current.is_(True))
        .outerjoin(DocumentCategory, DocumentCategory.id == DocumentModel.document_category_id)
        .outerjoin(Users, Users.id == DocumentModel.created_by_id)
        .where(DocumentModel.is_deleted.is_(False), clearance_filter())
    )
    
    
def _apply_filters(query, f:RecordsFilters):
    if f.category:
        like=f"%{f.category}%"
        query=query.where(or_(DocumentCategory.name.ilike(like), DocumentVersion.doc_type.ilike(like)))
    if f.title_contains:
        like=f"%{f.title_contains}%"
        query = query.where(or_(DocumentModel.title.ilike(like), DocumentVersion.file_name.ilike(like)))
    if f.series_year:
        query = query.where(extract("year", DocumentModel.series_years) == f.series_year)
    if f.received_from:
        query = query.where(func.date(DocumentModel.created_at) >= f.received_from)
    if f.received_to:
        query = query.where(func.date(DocumentModel.created_at) <= f.received_to)
    if f.division:
        query = query.where(Users.division.ilike(f"%{f.division}%"))
    if f.shelf_contains:
        query = query.where(DocumentModel.physical_shelf_location.ilike(f"%{f.shelf_contains}%"))
    if f.uploaded_by:
        like = f"%{f.uploaded_by}%"
        query = query.where(or_(Users.first_name.ilike(like), Users.last_name.ilike(like)))
    return query


def _full_name(user)->str:
    if not user:
        return "unknown"
    
    return f"{user.first_name or ''} {user.last_name or ''}".strip() or "unknown"


#tool 1 list
@tool("find_records", args_schema=FindRecordsArgs, response_format="content_and_artifact")
async def find_records_tool(limit:int=20, **filters)->tuple[str, list[dict]]:
    """List archived documents that match exact metadata filters (type, year, dates, division, shelf, uploader, title/reference number).
    Use this 'list', 'show' or 'where is' question. Not for questions about what is written inside documents.
    """
    
    f=RecordsFilters(**filters)
    rows_q=_apply_filters(
        _base_query(
            DocumentModel.id, DocumentModel.title, DocumentModel.series_years,
            DocumentModel.physical_shelf_location, DocumentModel.created_at,
            DocumentCategory.name.label("category"),
            DocumentVersion.file_name, DocumentVersion.version_number,
        ),
        f,
    ).order_by(DocumentModel.created_at.desc()).limit(limit)
    total_q=select(func.count()).select_from(_apply_filters(_base_query(DocumentModel.id), f).subquery())
    
    
    try:
        async with SessionLocal() as session:
            total=(await session.execute(total_q)).scalar_one()
            rows = (await session.execute(rows_q)).all()
    except Exception:
        logger.exception("[Records] find_records failed: %s", f)
        return "The records lookup failed. Tell the user to try again later.",[]
    
    if not rows:
        return "No archived documents match thes filters.", []
    
    lines=[f"Found {total} matching documents(s). Showing {len(rows)}:"]
    for r in rows:
        year = r.series_years.year if r.series_years else "n/a"
        archived = r.created_at.strftime("%Y-%m-%d") if r.created_at else "n/a"
        lines.append(
            f"- #{r.id} \"{r.title}\" | type: {r.category or 'n/a'} | series {year} | "
            f"shelf: {r.physical_shelf_location or 'not recorded'} | archived {archived} | "
            f"current file: {r.file_name} (v{r.version_number})"
        )
    sources = [{"document_id": r.id, "file_name": r.file_name, "page_number": None} for r in rows]
    return "\n".join(lines), sources


# tool 2: count
GROUP_COLUMNS = {
    "category": func.coalesce(DocumentCategory.name, "Uncategorized"),
    "series_year": extract("year", DocumentModel.series_years),
    "month": func.to_char(DocumentModel.created_at, "YYYY-MM"),
    "division": func.coalesce(Users.division, "Unknown"),
    "shelf": func.coalesce(DocumentModel.physical_shelf_location, "No location"),
}

@tool("count_records", args_schema=CountRecordsArgs)
async def count_records_tool(group_by: str = "none", **filters) -> str:
    """Count archived documents that match metadata filters, optionally broken down by
    category, series_year, month archived, division or shelf. Use this for 'how many' questions."""
    f = RecordsFilters(**filters)
    if group_by == "none":
        query = _apply_filters(_base_query(func.count(func.distinct(DocumentModel.id))), f)
    else:
        col = GROUP_COLUMNS[group_by]
        total = func.count(func.distinct(DocumentModel.id)).label("total")
        query = (
            _apply_filters(_base_query(col.label("grp"), total), f)
            .group_by(col)
            .order_by(total.desc())
        )

    try:
        async with SessionLocal() as session:
            if group_by == "none":
                count = (await session.execute(query)).scalar_one()
                return f"{count} archived document(s) match these filters."
            rows = (await session.execute(query)).all()
    except Exception:
        logger.exception("[Records] count_records failed: %s", f)
        return "The records count failed. Tell the user to try again later."

    if not rows:
        return "0 archived documents match these filters."
    lines = [f"Counts by {group_by}:"]
    for r in rows:
        label = int(r.grp) if group_by == "series_year" and r.grp is not None else r.grp
        lines.append(f"- {label}: {r.total}")
    lines.append(f"Total: {sum(r.total for r in rows)}")
    return "\n".join(lines)


#toolk 3
@tool("get_record_details", response_format="content_and_artifact")
async def get_record_details_tool(reference: str) -> tuple[str, list[dict]]:
    """Get the full record of ONE document: shelf location, status, type, series year,
    who archived it, and every version (which one is current, who uploaded each).
    `reference` is a document ID (e.g. '12') or part of its title / file name / reference number."""
    
    
    
    ref = reference.strip().lstrip("#")
    if ref.isdigit():
        condition = DocumentModel.id == int(ref)
    else:
        like = f"%{ref}%"
        condition = or_(
            DocumentModel.title.ilike(like),
            DocumentModel.versions.any(DocumentVersion.file_name.ilike(like)),
        )

    query = (
        select(DocumentModel)
        .where(condition, DocumentModel.is_deleted.is_(False), clearance_filter())
        .options(selectinload(DocumentModel.versions).selectinload(DocumentVersion.uploaded_by))
        .order_by(DocumentModel.created_at.desc())
        .limit(5)
    )

    try:
        async with SessionLocal() as session:
            docs = (await session.execute(query)).scalars().all()
            if not docs:
                return f"No archived document matches '{reference}'.", []

            blocks, sources = [], []
            if len(docs) > 1:
                blocks.append(f"{len(docs)} documents match '{reference}'. Ask the user which one if unclear.")
            for d in docs:
                versions = sorted(d.versions, key=lambda v: v.version_number or 0)
                current = next((v for v in versions if v.is_current), None)
                version_lines = [
                    f"    - v{v.version_number}: {v.file_name}, uploaded by {_full_name(v.uploaded_by)}"
                    + (" (CURRENT)" if v.is_current else "")
                    for v in versions
                ]
                blocks.append(
                    f"#{d.id} \"{d.title}\"\n"
                    f"  type: {d.category.name if d.category else 'n/a'}\n"
                    f"  status: {d.status.name if d.status else 'n/a'}\n"
                    f"  series year: {d.series_years.year if d.series_years else 'n/a'}\n"
                    f"  department order: {d.department_order or 'n/a'}\n"
                    f"  physical shelf location: {d.physical_shelf_location or 'not recorded'}\n"
                    f"  archived by: {_full_name(d.created_by)} "
                    f"({d.created_by.division if d.created_by else 'n/a'}) on "
                    f"{d.created_at.strftime('%Y-%m-%d') if d.created_at else 'n/a'}\n"
                    f"  versions:\n" + "\n".join(version_lines)
                )
                sources.append({
                    "document_id": d.id,
                    "file_name": current.file_name if current else d.title,
                    "page_number": None,
                })
    except Exception:
        logger.exception("[Records] get_record_details failed: %r", reference)
        return "The records lookup failed. Tell the user to try again later.", []

    return "\n\n".join(blocks), sources
            
#tool 4 valid categories
@tool("list_record_categories")
async def list_record_categories_tool() -> str:
    """List the valid document categories/types in the archive. Call this when unsure
    what category name to use in a filter."""
    
    
    
    try:
        async with SessionLocal() as session:
            names = (await session.execute(select(DocumentCategory.name).order_by(DocumentCategory.name))).scalars().all()
    except Exception:
        logger.exception("[Records] list_record_categories failed")
        return "Could not load categories."
    return "Categories: " + (", ".join(names) if names else "none defined")

RECORDS_TOOLS = [find_records_tool, count_records_tool, get_record_details_tool, list_record_categories_tool]
          
    
