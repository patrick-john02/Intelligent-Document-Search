from fastapi import HTTPException, status, APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from core.dependencies import get_db
from core.security import get_current_active_user
from api.models.document import DocumentModel
from api.models.users import Users

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])
app = router

@router.get("/dashboard", status_code=status.HTTP_200_OK)
async def admin_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_active_user)
):
    if not current_user.is_superuser and current_user.system_role_id != 3:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this!"
        )

    user_counts = select(func.count(Users.id)).where(
        Users.is_active.is_(True)
    )
    result = await db.execute(user_counts)
    total_users = result.scalar_one()

    document_counts = select(func.count(DocumentModel.id)).where(
        DocumentModel.is_deleted.is_(False)
    )
    result = await db.execute(document_counts)
    total_document = result.scalar_one()

    return {
        "total_users": total_users,
        "total_documents": total_document,
    }
