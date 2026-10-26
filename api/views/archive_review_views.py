from fastapi import(
    HTTPException, status, APIRouter, Depends
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select



from api.models.users import Users
from core.dependencies import get_db
from core.security import get_current_active_user, get_user_permissions
from tools.access.permissions import get_user_clearance_levels, clearance_filter

from api.models.document import (
    DocumentVersion, DocumentModel, 
)
from api.models.document import ArchiveProposal as ArchiveProposalRow
from api.schema.archive_review_schema import ArchiveProposalResponse

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


if __name__ == "__main__":
    import asyncio
    from core.dependencies import SessionLocal

    async def main():
        async with SessionLocal() as db:
            user = await db.get(Users, 1)
            print(f"{user.username=}")

            conditions = _visible_document(user)
            print(f"{len(conditions)=}")
            for c in conditions:
                print(" -", c)

            result = await get_proposal(proposal_id=1, db=db, current_user=user)
            print(f"{result=}")

    asyncio.run(main())




@router.get("/{proposal_id}", response_model=ArchiveProposalResponse)
async def archive_review(
    proposal_id: int,
    db:AsyncSession=Depends(get_db),
    current_user: Users=Depends(get_current_active_user)
):
    query = select(ArchiveProposalRow).where(
        ArchiveProposalRow.id == proposal_id
    )
    proposal = (await db.execute(query)).scalar_one_or_none()

    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found"
        )

    return proposal