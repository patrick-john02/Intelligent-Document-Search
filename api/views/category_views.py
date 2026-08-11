from fastapi import(
    APIRouter, Depends, HTTPExceptio, status
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from core.dependencies import get_db

#import
from api.schema.document_schema import(
    CategorySchema, 
)

from api.models.users import Users
from api.models.document import DocumentCategory
from core.security import(
    get_current_active_user,
    get_user_permissions
)




app = APIRouter(prefix='/categories')


@app.get("/list", status_code=status.HTTP_200_OK, response_model=list[CategorySchema])
async def category_list(
    db:AsyncSession=Depends(get_db), 
    current_user: Users = Depends(get_current_active_user)
):
    permission=get_user_permissions(current_user)
    
    query = select(DocumentCategory).order_by(DocumentCategory.created_at.desc())