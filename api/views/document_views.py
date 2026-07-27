from fastapi import UploadFile, FastAPI, File, Query, Depends, HTTPException

from typing import Annotated
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv
from zoneinfo import ZoneInfo
from datetime import datetime
import os

load_dotenv()

document_path = os.getenv("DOCUMENT_PATH", "./documents/")

#models
from models.document import DocumentModel

#schema 
from schema.document_schema import DocumentSchema

#dependency
from core.dependencies import get_db

manila_tz = ZoneInfo("Asia/Manila")
manila_time = datetime.now()

app = FastAPI()

    
allowed_extensions = {
    'pdf', 'doc', 'docx', 'ppt', 'xlsx', 'xls', 'txt',
    'csv', 'jpg', 'png'
}

@app.post("/file/")
async def create_file(file:Annotated[bytes,File()]):
    return {"file_size": len(file)}

@app.get("/document-lists/", response_model=list[DocumentSchema])
async def document_list(
    db: AsyncSession = Depends(get_db),
    created_at: str = Query(default="created_at", description="Field to sort by")
):
    
    if not hasattr(DocumentModel, created_at):
        raise ValueError(f"Invalid sort field: {created_at}")
    
    created_at_order = getattr(DocumentModel,created_at)

    
    document_query = select(DocumentModel).where(
        DocumentModel.is_deleted == False,
    ).order_by(created_at_order)
    
    result = await db.execute(document_query)
    return result.scalars().all()

@app.post("/uploadfile/", response_model=DocumentSchema)
async def create_upload_file(
    id: int,
    db:AsyncSession = Depends(get_db),
    file:UploadFile = File(...),
):
    file_name = file.filename
    extension = file_name.lower().split('.')[-1]

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, detail="File not allowed to upload"
        )

    save_directory = document_path / extension / str(id)
    save_directory.mkdir(parents=True, exist_ok=True)
    full_file_path = save_directory / file_name

    with open(full_file_path, "wb") as f:
        f.write(await file.read())

    new_doc = DocumentModel(
        file_name=file_name,
        file_extension=extension,
        path=str(full_file_path),
        is_deleted=False,
        created_at = manila_time
    )

    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)

    return new_doc
        

        
    
    
    

    

    

