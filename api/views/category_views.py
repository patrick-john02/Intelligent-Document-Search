from fastapi import(
    APIRouter, Depends, HTTPException, status, Form
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from core.dependencies import get_db
from zoneinfo import ZoneInfo

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


manila_tz = ZoneInfo("Asia/Manila")

app = APIRouter(prefix='/categories')



@app.get("/list", status_code=status.HTTP_200_OK, response_model=list[CategorySchema])
async def category_list(
    db:AsyncSession=Depends(get_db), 
    current_user: Users = Depends(get_current_active_user)
):
    
    query = select(DocumentCategory).order_by(DocumentCategory.created_at.desc())
    
    
    results = await db.execute(query)
    return results.scalars().all()


@app.post("/create", status_code=status.HTTP_201_CREATED, response_model=CategorySchema)
async def create_category(
    name: str = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: Users=Depends(get_current_active_user)
):
    query = select(DocumentCategory).where(DocumentCategory.name==name)
    
    result = await db.execute(query)
    if result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category with this name already exists")
    
    category = DocumentCategory(
        name=name,
        created_at=datetime.now(manila_tz)
    )
    
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    return category

    
@app.patch("/{category_id}/update", status_code=status.HTTP_200_OK, response_model=CategorySchema)
async def update_category(
    category_id: int,
    name: str = Form(...),
    db:AsyncSession=Depends(get_db),
    current_user: Users = Depends(get_current_active_user)
):
    query = select(DocumentCategory).where(
        DocumentCategory.id == category_id,
        DocumentCategory.name == name,
    )

    
    result = await db.execute(query)
    update_category = result.scalar_one_or_none()
    
    if not update_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category Not Found!")
    
    