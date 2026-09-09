from fastapi import (
    APIRouter, status, HTTPException, Depends
)
from sqlalchemy.ext.asyncio import AsyncSession


from api.models.users import Users
from core.dependencies import get_db
from core.security import get_current_active_user

app = APIRouter(prefix="/super_admin", tags=["Super Admin Analytics"])


# app.get("/dashboard_analytics", status_code=status.HTTP_200_OK, response_model=list[])
# async def dashboard(
#     db:AsyncSession=Depends(get_db),
#     current_user: Users=Depends(get_current_active_user),
# ):
    