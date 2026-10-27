from fastapi import(
    HTTPException, status, APIRouter, Depends, Query
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime, date



from api.models.users import Users
from core.dependencies import get_db
from core.security import get_current_active_user, get_user_permissions, get_user
from tools.access.permissions import get_user_clearance_levels, clearance_filter
from api.models.enums.docs import ProposalStatus
from rag.classification.labels import DOC_TYPES
from rag.classification.store import confirm_classification
from rag.pipeline import reindex_from_checkpoint, archive_review_task

from api.models.document import (
    DocumentVersion, DocumentModel, 
)
from api.models.document import ArchiveProposal as ArchiveProposalRow
from api.schema.archive_review_schema import (
    ArchiveProposalResponse, RejectProposalSchema, AcceptProposalSchema, CurrentValues,
)

router = APIRouter(prefix="/archive", tags=["Archive Reviews"])


def _visible_document(user: Users)->list:
    permissions = get_user_permissions(user)
    is_admin = "*" in permissions or "document:write" in permissions

    levels = [lvl.lower() for lvl in get_user_clearance_levels(user)]
    conditions = [
        DocumentModel.is_deleted.is_(False), #not soft-deleted
        clearance_filter(levels), #within the user's clearance
    ]

    if not is_admin:
        conditions.append(DocumentModel.created_by_id == user.id)
    return conditions

async def _get_proposal(
    db:AsyncSession, 
    proposal_id: int, 
    user:Users, 
    for_update:bool=False
)->ArchiveProposalRow:
    query=(
        select(ArchiveProposalRow)
        .join(DocumentVersion, ArchiveProposalRow.document_version_id == DocumentVersion.id)
        .join(DocumentModel, DocumentVersion.document_id == DocumentModel.id)
        .where(ArchiveProposalRow.id == proposal_id, *_visible_document(user))
        .options(selectinload(ArchiveProposalRow.document_version).selectinload(DocumentVersion.document))
    )
    if for_update:
        query = query.with_for_update(of=ArchiveProposalRow) #lock only the proposal row

    proposal = (await db.execute(query)).scalar_one_or_none()
    if proposal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")

    return proposal


def _with_year(existing: date | None, year: int) -> date:
    """series_years is a DATE: change only the year, keep month/day when possible."""
    if existing is None:
        return date(year, 1, 1)
    try:
        return existing.replace(year=year)
    except ValueError:  # Feb 29 -> non-leap year
        return date(year, 1, 1)


def _to_response(proposal: ArchiveProposalRow) -> ArchiveProposalResponse:
    """Build the response by hand: `current` lives two relationships away
    (proposal -> version -> document) and the year needs converting, so from_attributes can't do it.
    Needs document_version + document loaded (selectinload) before calling."""
    version = proposal.document_version
    document = version.document
    return ArchiveProposalResponse(
        id=proposal.id,
        document_version_id=version.id,
        document_id=document.id,
        file_name=version.file_name,
        current=CurrentValues(
            title=document.title,
            document_type=version.doc_type,
            series_year=document.series_years.year if document.series_years else None,
            department_order=document.department_order,
            physical_shelf_location=document.physical_shelf_location,
        ),
        status=proposal.status,
        proposal=proposal.proposal,
        final_values=proposal.final_values,
        needs_human_review=proposal.needs_human_review,
        model_name=proposal.model_name,
        error_message=proposal.error_message,
        created_at=proposal.created_at,
        reviewed_by_id=proposal.reviewed_by_id,
        reviewed_at=proposal.reviewed_at,
        review_note=proposal.review_note,
    )


# NOTE: fixed paths ("/queue") must come BEFORE "/{proposal_id}",
# otherwise FastAPI reads "queue" as a proposal_id and returns 422.
@router.get("/queue", response_model=list[ArchiveProposalResponse])
async def archive_review_queue(
    status_filter: ProposalStatus =  Query(ProposalStatus.PENDING, alias="status"),
    limit: int=Query(50, ge=1, le=200),
    db:AsyncSession=Depends(get_db),
    current_user: Users=Depends(get_current_active_user)
):
    query=(
        select(ArchiveProposalRow)
        .join(DocumentVersion, ArchiveProposalRow.document_version_id == DocumentVersion.id)
        .join(DocumentModel, DocumentVersion.document_id == DocumentModel.id)
        .where(
            ArchiveProposalRow.status == status_filter.value,
            *_visible_document(current_user),
        )
        .options(
            selectinload(ArchiveProposalRow.document_version)
            .selectinload(DocumentVersion.document)
        )
    )

    if status_filter == ProposalStatus.PENDING:
        query = query.where(DocumentVersion.is_current.is_(True))


    query = query.order_by(
        ArchiveProposalRow.needs_human_review.desc(),
        ArchiveProposalRow.created_at.desc(),
    ).limit(limit)


    rows = (await db.execute(query)).scalars().all()
    return [_to_response(row) for row in rows]


@router.get("/document-types", response_model=list[str])
async def document_types(current_user: Users = Depends(get_current_active_user)):
    """Allowed document types, for the reviewer's type dropdown (single source of truth: DOC_TYPES)."""
    return DOC_TYPES


@router.get("/version/{version_id}/latest", response_model=ArchiveProposalResponse)
async def latest_proposal_for_version(
    version_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_active_user),
):
    """Newest non-superseded proposal for one version (for the document details page)."""
    query = (
        select(ArchiveProposalRow)
        .join(DocumentVersion, ArchiveProposalRow.document_version_id == DocumentVersion.id)
        .join(DocumentModel, DocumentVersion.document_id == DocumentModel.id)
        .where(
            ArchiveProposalRow.document_version_id == version_id,
            ArchiveProposalRow.status != ProposalStatus.SUPERSEDED.value,  # skip replaced runs
            *_visible_document(current_user),
        )
        .options(selectinload(ArchiveProposalRow.document_version).selectinload(DocumentVersion.document))
        .order_by(ArchiveProposalRow.created_at.desc())
        .limit(1)
    )
    proposal = (await db.execute(query)).scalar_one_or_none()
    if proposal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No proposal for this version yet")
    return _to_response(proposal)


@router.post("/version/{version_id}/rerun", status_code=status.HTTP_202_ACCEPTED)
async def rerun_alon(
    version_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_active_user),
):
    """Queue Alon again for this version (e.g. after a failed or rate-limited run)."""
    # the user must be allowed to see this version (same visibility rules, starting from the version)
    visible = (await db.execute(
        select(DocumentVersion.id)
        .join(DocumentModel, DocumentVersion.document_id == DocumentModel.id)
        .where(DocumentVersion.id == version_id, *_visible_document(current_user))
    )).scalar_one_or_none()
    if visible is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document version not found")

    archive_review_task.delay(version_id)   # runs in Celery; a new pending proposal replaces the old one
    return {"version_id": version_id, "queued": True}   # 202 = queued, not finished


@router.get("/{proposal_id}", response_model=ArchiveProposalResponse)
async def archive_review(
    proposal_id: int,
    db:AsyncSession=Depends(get_db),
    current_user: Users=Depends(get_current_active_user)
):
    proposal = await _get_proposal(db, proposal_id, current_user)   # 404 + visibility handled by the helper
    return _to_response(proposal)


@router.post("/{proposal_id}/reject")
async def reject_proposal(
    proposal_id: int,
    payload: RejectProposalSchema,                       
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_active_user),
):
    proposal = await _get_proposal(db, proposal_id, current_user, for_update=True)   # 404 + lock

    if proposal.status != ProposalStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Proposal is already {proposal.status}",
        )

    now = datetime.now()
    proposal.status = ProposalStatus.REJECTED.value
    proposal.reviewed_by_id = current_user.id
    proposal.reviewed_at = now
    proposal.review_note = payload.review_note
    proposal.updated_at = now

    await db.commit()

    return {"proposal_id": proposal.id, "status": proposal.status}


@router.post("/{proposal_id}/accept")
async def accept_proposal(
    proposal_id: int,
    payload: AcceptProposalSchema,
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user),
):
    proposal = await _get_proposal(db, proposal_id, current_user, for_update=True)  #404 + lock

    if proposal.status != ProposalStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Proposal is already {proposal.status}",
        )

    version = proposal.document_version
    document = version.document
    old_title, old_type = document.title, version.doc_type   # to know later if we must re-index

    # Alon's values (his JSON uses 'suggested_shelf_location', so map it to our field name)
    alon_json = proposal.proposal or {}   # None when Alon failed
    alon = {
        "title": alon_json.get("title"),
        "document_type": alon_json.get("document_type"),
        "series_year": alon_json.get("series_year"),
        "department_order": alon_json.get("department_order"),
        "physical_shelf_location": alon_json.get("suggested_shelf_location"),
    }

    # only the fields the reviewer actually sent
    overrides = payload.model_dump(exclude={"review_note"}, exclude_none=True)

    # final value = reviewer override, else Alon's value, else the document's current value
    current_year = document.series_years.year if document.series_years else None
    final = {
        "title": overrides.get("title") or alon["title"] or document.title,
        "document_type": overrides.get("document_type") or alon["document_type"] or version.doc_type,
        "series_year": overrides.get("series_year") or alon["series_year"] or current_year,
        "department_order": overrides.get("department_order") or alon["department_order"] or document.department_order,
        "physical_shelf_location": overrides.get("physical_shelf_location") or alon["physical_shelf_location"]
                                   or document.physical_shelf_location,
    }

    # business rule: the type must be one we know (400 = valid JSON, but not an allowed value)
    if final["document_type"] not in DOC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown document type '{final['document_type']}'. Allowed: {DOC_TYPES}",
        )

    # apply to the DOCUMENT instance (doc_type is set by confirm_classification below)
    now = datetime.now()
    document.title = final["title"][:255]
    document.department_order = (final["department_order"] or "")[:255]
    document.physical_shelf_location = (final["physical_shelf_location"] or "")[:255]
    if final["series_year"]:
        document.series_years = _with_year(document.series_years, int(final["series_year"]))
    document.updated_at = now

    # 'edited' if the reviewer changed any of Alon's values (edit-rate metric for the thesis)
    edited = any(alon.get(field) != value for field, value in overrides.items())

    proposal.status = (ProposalStatus.EDITED if edited else ProposalStatus.ACCEPTED).value
    proposal.final_values = final          # what was actually applied
    proposal.reviewed_by_id = current_user.id
    proposal.reviewed_at = now
    proposal.review_note = payload.review_note
    proposal.updated_at = now

    await db.commit()   # saves document + proposal together, releases the lock

    # side effects AFTER commit: they use their own session / Celery, so they must see committed data
    await confirm_classification(version.id, final["document_type"], current_user.id)   # human-verified type

    reindex = final["document_type"] != old_type or final["title"] != old_title
    if reindex:
        reindex_from_checkpoint(version.id)   # title/type live in chunk metadata -> re-chunk + re-embed

    return {
        "proposal_id": proposal.id,
        "status": proposal.status,
        "final_values": final,
        "reindex_queued": reindex,
    }




# if __name__ == "__main__":
#     import asyncio
#     from core.dependencies import SessionLocal

#     async def main():
#         async with SessionLocal() as db:
#             user = await get_user(db,"admin")
#             print(f"{user.username=}")

#             conditions = _visible_document(user)
#             print(f"{len(conditions)=}")
#             for c in conditions:
#                 print(" -", c)

#             result = await archive_review(proposal_id=1, db=db, current_user=user)
#             print(f"{result=}")

#     asyncio.run(main())
