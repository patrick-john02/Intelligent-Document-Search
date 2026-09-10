from fastapi import(
    APIRouter, status, HTTPException, Depends
)
from sqlalchemy.ext.asyncio import AsyncSession


#imports
from core.dependencies import get_db
from core.security import get_current_active_user

from api.models.users import Users


app = APIRouter(prefix="/search", tags=["Staff Search"])

@app.post("/docs", status_code=status.HTTP_200_OK)
async def search_documents(
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user)
):

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your are not Authorize"
        )


    