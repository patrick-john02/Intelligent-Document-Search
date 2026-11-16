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

# TODO:
# @tool("archive_activity_summary", args_schema=PeriodArgs)
# async def archive_activity_summary_tool(date_from: date, date_to: date) -> str:
#     """Summary of archiving activity in a period: total documents archived, and the
#     breakdown per category, per division and per staff member. Use for daily, weekly
#     or monthly reports ('what was archived today/this week')."""
#     f = RecordsFilters(received_from=date_from, received_to=date_to)
#     total_q = _apply_filters(_base_query(func.count(func.distinct(DocumentModel.id))), f)

#     def grouped(col):
#         total=func.count(func.distinct(DocumentModel.id)).label("total")
#         return _apply_filters(_base_query(col.label("grp"), total), f).group_by(col).order_by(total.desc())


#TODO:

