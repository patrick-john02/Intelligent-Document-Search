from fastapi import(
    status, Depends, HTTPException, APIRouter, Query
)
from fastapi_pagination import Page, add_pagination, paginate
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime
from zoneinfo import ZoneInfo
from typing import Annotated


#models
from api.models.document import (
    DocumentModel, DocumentVersion,
)
from api.models.enums.docs import ClearanceLevel
from api.models.users import Users
#schema 
from api.schema.document_schema import (
    DocumentSchema, 
)

#dependency
from core.dependencies import get_db

#security
from core.security import(
    get_current_active_user, get_user_permissions
)



manila_tz = ZoneInfo("Asia/Manila")

# app = FastAPI()
app = APIRouter(prefix='/documents')

add_pagination(app)


@app.get("/document/search", status_code=status.HTTP_200_OK, response_model=list[DocumentSchema])
async def search_document(
    q: Annotated[
        str | None,
        Query(
            title = "Query String",
            description="Query String for the items to search in the database",
            min_length=3,
        ),
    ] = None,
    db:AsyncSession = Depends(get_db),
    current_user: Users=Depends(get_current_active_user),
):
    permission = get_user_permissions(current_user)
    
    query = select(DocumentModel).where(DocumentModel.is_deleted.is_(False))
    
    is_admin = "*" in permission or "documents:read_all" in permission
    is_owner = "documents:read_public" in permission
    
    if not is_admin:
        if is_owner:
            query = query.where(
                or_(
                    DocumentModel.created_by_id == current_user.id,
                    DocumentModel.clearance_level == ClearanceLevel.PUBLIC
                )
            )
        else:
            query=query.where(DocumentModel.created_by_id == current_user.id)
    
    if q:
        query=query.where(
            or_(
                DocumentModel.title.ilike(f"%{q}%"),
                DocumentModel.department_order.ilike(f"%{q}%"),
                DocumentModel.series_years.ilike(f"%{q}%"),
                DocumentModel.versions.ilike(f"%{q}%"),
                
            )
        )
    
    
    doc_query = query.options(
        selectinload(DocumentModel.versions),
        selectinload(DocumentModel.created_by),
        selectinload(DocumentModel.category),
    ).order_by(DocumentModel.created_at.desc())
    
    
    result = await db.execute(doc_query)
    return result.scalars().all()



    
    
    
    
    
    
    