from fastapi import UploadFile, FastAPI, File, Query, Depends, HTTPException, APIRouter

from typing import Annotated
from fastapi_pagination import Page, add_pagination, paginate
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv
from zoneinfo import ZoneInfo
from datetime import datetime
import os
from pathlib import Path


#models
from api.models.document import DocumentModel

#schema 
from api.schema.document_schema import DocumentSchema

#dependency
from core.dependencies import get_db

load_dotenv()

document_path = Path(os.getenv("DOCUMENT_PATH", "./documents/"))

manila_tz = ZoneInfo("Asia/Manila")
manila_time = datetime.now()

# app = FastAPI()
app = APIRouter(prefix='/documents')
add_pagination(app)



    
allowed_extensions = {
    'pdf', 'doc', 'docx', 'ppt', 'xlsx', 'xls', 'txt',
    'csv'
}


@app.get("/lists/", response_model=list[DocumentSchema])
async def document_list(
    file_extension: str,
    db: AsyncSession = Depends(get_db),
    created_at: str = Query(default="created_at", description="Field to sort by")
)->Page[DocumentSchema]:
    
    if not hasattr(DocumentModel, created_at):
        raise ValueError(f"Invalid sort field: {created_at}")
    
    created_at_order = getattr(DocumentModel,created_at)
    
    
    document_query = select(DocumentModel).where(
        DocumentModel.is_deleted == False,
    ).order_by(created_at_order)

    if file_extension:
        document_query = document_query.where(
            DocumentModel.file_extension == file_extension.lower()
        )

    result = await db.execute(document_query)
    return result.scalars().all()



@app.post("/uploadfile/", response_model=DocumentSchema)
async def create_upload_file(
    db:AsyncSession = Depends(get_db),
    file:UploadFile = File(...),
):
    file_name = file.filename
    extension = file_name.lower().split('.')[-1]

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, detail="File not allowed to upload"
        )


    new_doc = DocumentModel(
        file_name=file_name,
        file_extension=extension,
        is_deleted=False,
        created_at = manila_time
    )

    db.add(new_doc)
    await db.flush()

    save_directory = document_path / extension / str(new_doc.id)
    save_directory.mkdir(parents=True, exist_ok=True)

    full_file_path = save_directory / file_name
    with open(full_file_path, "wb") as f:
        f.write(await file.read())
    
    await db.commit()
    await db.refresh(new_doc)

    return new_doc