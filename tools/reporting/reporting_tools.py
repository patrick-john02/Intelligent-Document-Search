import logging
from datetime import date, datetime
from typing import Literal


from langchain_core.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy import select, func, or_

from api.models.document import(
    DocumentModel, DocumentVersion, DocumentCategory, ArchiveProposal
)
from api.models.enums.docs import ProposalStatus, ClassificationStatus
from api.models.users import Users
from core.database import SessionLocal
from tools.access.permissions import clearance_filter
from tools.records.lookup import RecordsFilters, _base_query, _apply_filters

logger=logging.getLogger(__name__)

LOW_OCR_THRESHOLD=0.75 #ocr_accuracy_score


AttentionKind = Literal["pending_review", "failed_archiving", "classification_review", "low_ocr", "missing_shelf"]


ATTENTION_LABELS = {
    "pending_review": "Archive proposals waiting for human review",
    "failed_archiving": "Archiving runs that failed (can be re-run)",
    "classification_review": "Documents whose type needs review (classifier unsure)",
    "low_ocr": f"Scanned documents with low OCR quality (< {LOW_OCR_THRESHOLD})",
    "missing_shelf": "Documents with no physical shelf location",
}

#Schemas
class PeriodArgs(BaseModel):
    date_from: date = Field(description="Start of the period (YYYY-MM-DD), inclusive.")
    date_to: date = Field(description="End of the period (YYYY-MM-DD), inclusive.")
    
class AttentionArgs(BaseModel):
    kind: AttentionKind = Field(description="Which problem list to return.")
    limit: int = Field(20, ge=1, le=50, description="Max rows to return (1-50).")
    

#shared backlog query
def _attention_query(kind: str, *columns):
    query = (
        select(*columns)
        .select_from(DocumentModel)
        .join(DocumentVersion, DocumentVersion.document_id == DocumentModel.id)
        .where(DocumentModel.is_deleted.is_(False), clearance_filter())
    )
    if kind in ("pending_review", "failed_archiving"):
        status = ProposalStatus.PENDING if kind == "pending_review" else ProposalStatus.FAILED
        return query.join(ArchiveProposal, ArchiveProposal.document_version_id == DocumentVersion.id).where(
            ArchiveProposal.status == status.value
        )

    query = query.where(DocumentVersion.is_current.is_(True))
    if kind == "classification_review":
        return query.where(DocumentVersion.classification_status.in_(
            [ClassificationStatus.NEEDS_REVIEW.value, ClassificationStatus.UNKNOWN.value]
        ))
    if kind == "low_ocr":
        return query.where(DocumentVersion.ocr_accuracy_score < LOW_OCR_THRESHOLD)
    # missing_shelf
    return query.where(or_(
        DocumentModel.physical_shelf_location.is_(None),
        func.trim(DocumentModel.physical_shelf_location) == "",
    ))


async def _count_attention(session, kind: str) -> int:
    sub = _attention_query(kind, DocumentModel.id).distinct().subquery()
    return (await session.execute(select(func.count()).select_from(sub))).scalar_one()


@tool("archive_activity_summary", args_schema=PeriodArgs)
async def archive_activity_summary_tool(date_from: date, date_to: date) -> str:
    """Summary of archiving activity in a period: total documents archived, and the
    breakdown per category, per division and per staff member. Use for daily, weekly
    or monthly reports ('what was archived today/this week')."""
    f = RecordsFilters(received_from=date_from, received_to=date_to)
    total_q = _apply_filters(_base_query(func.count(func.distinct(DocumentModel.id))), f)

    def grouped(col):
        total=func.count(func.distinct(DocumentModel.id)).label("total")
        return _apply_filters(_base_query(col.label("grp"), total), f).group_by(col).order_by(total.desc())
    
    sections = {
        "Per category": grouped(func.coalesce(DocumentCategory.name, "Uncategorized")),
        "Per division": grouped(func.coalesce(Users.division, "Unknown")),
        "Per staff" : grouped(func.concat(Users.first_name, " ", Users.last_name)),
    }
    
    try:
        async with SessionLocal() as session:
            total=(await session.execute(total_q)).scalar_one()
            results={name:(await session.execute(q)).all() for name, q in sections.items()}
            
    except Exception:
        logger.exception("[Reporting] activity summary failed")
        return "The activity summary failed. Tell the user to try again later."
    
    
    lines = [f"Archiving activity from {date_from} to {date_to}: {total} document(s) archived."]
    if total:
        for name, rows in results.items():
            lines.append(f"\n{name}")
            lines += [f"-{r.grp or 'Unknown'}: {r.total}" for r in rows]
    return "\n".join(lines)


#tool 2 backlog counts
@tool("review_queue_status")
async def review_queue_status_tool()->str:
    """Current backlog that needs staff attention: pending archive reviews, failed archiving
    runs, documents whose type needs review, low OCR quality, and missing shelf locations.
    Use for 'what needs my attention' or the backlog part of a daily report."""
    
    try:
        async with SessionLocal() as session:
            counts={kind:await _count_attention(session, kind) for kind in ATTENTION_LABELS}
            oldest=(await session.execute(
                _attention_query("pending_review", func.min(ArchiveProposal.created_at))
            )).scalar_one()
    except Exception:
        logger.exception("[Report] review queue status failed")
        return "The review queue check failed. Tell the user to try again later."
    
    
    lines = ["Current backlog:"]
    lines += [f"- {ATTENTION_LABELS[k]}: {n}" for k, n in counts.items()]
    
    if oldest:
        days = (datetime.now() - oldest).days
        lines.append(f"Oldest pending review is {days} day(s) old (since {oldest:%Y-%m-%d}).")
    return "\n".join(lines)


#tool 3 backlog items
@tool("list_attention_items", args_schema=AttentionArgs, response_format="content_and_artifact")
async def list_attention_items_tool(kind: str, limit: int = 20) -> tuple[str, list[dict]]:
    """List the actual documents in one backlog category (oldest first), so staff can act on them.
    kind: pending_review | failed_archiving | classification_review | low_ocr | missing_shelf."""
    
    
    query = (
        _attention_query(
            kind,
            DocumentModel.id, DocumentModel.title, DocumentModel.created_at,
            DocumentVersion.file_name, DocumentVersion.classification_status,
            DocumentVersion.ocr_accuracy_score,
        )
        .distinct()
        .order_by(DocumentModel.created_at.asc())
        .limit(limit)
    )
    
    
    try:
        async with SessionLocal() as session:
            total = await _count_attention(session, kind)
            rows = (await session.execute(query)).all()
    except Exception:
        logger.exception("[Reporting] list_attention_items failed: %s", kind)
        return "The backlog list failed. Tell the user to try again later.", []

    if not rows:
        return f"Nothing in '{ATTENTION_LABELS[kind]}'.", []
    
    
    lines = [f"{ATTENTION_LABELS[kind]}: {total} total. Showing {len(rows)} (oldest first):"]
    for r in rows:
        extra = []
        if kind == "classification_review":
            extra.append(f"classifier status: {r.classification_status}")
        if kind == "low_ocr" and r.ocr_accuracy_score is not None:
            extra.append(f"OCR score: {r.ocr_accuracy_score:.2f}")
        archived = r.created_at.strftime("%Y-%m-%d") if r.created_at else "n/a"
        lines.append(f"- #{r.id} \"{r.title}\" ({r.file_name}) | since {archived}"
                     + (f" | {', '.join(extra)}" if extra else ""))

    sources = [{"document_id": r.id, "file_name": r.file_name, "page_number": None} for r in rows]
    return "\n".join(lines), sources


REPORTING_TOOLS=[archive_activity_summary_tool, review_queue_status_tool, list_attention_items_tool]

