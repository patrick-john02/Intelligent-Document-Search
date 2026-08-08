from fastapi import (
    UploadFile, FastAPI, File, Query, Depends, HTTPException, APIRouter, status,
    Request, BackgroundTasks, Form
)

from typing import Annotated
from fastapi_pagination import Page, add_pagination, paginate
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv
from zoneinfo import ZoneInfo
from datetime import datetime, date
from pathlib import Path
from fastapi.concurrency import run_in_threadpool

import os
import hashlib


#models
from api.models.document import (
    DocumentModel, DocumentVersion,
)
from api.models.enums.docs import ClearanceLevel
from api.models.users import Users
#schema 
from api.schema.document_schema import DocumentSchema

#dependency
from core.dependencies import get_db

#security
from core.security import(
    get_current_active_user)

load_dotenv()

document_path = Path(os.getenv("DOCUMENT_PATH", "./documents/"))

manila_tz = ZoneInfo("Asia/Manila")

# app = FastAPI()
app = APIRouter(prefix='/documents')
add_pagination(app)



STORAGE_DIRECTORY = Path(os.getenv("DOCUMENT_PATH", "./documents"))
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'ppt', 'xlsx', 'xls', 'txt',
    'csv'
}


@app.post("/upload", status_code=status.HTTP_201_CREATED, response_model=DocumentSchema)
async def created_document_file(
    file: UploadFile = File(...),
    title: str = Form(...),
    control_number: str = Form(...),
    series_years: date = Form(...),
    physical_shelf_locations: str = Form(...),
    document_category_id: int = Form(...),
    clearance_level: ClearanceLevel = Form(default=ClearanceLevel.PUBLIC),
    db:AsyncSession=Depends(get_db),
    current_user: Users = Depends(get_current_active_user),
):
    
    
    filename = file.filename
    extension = filename.lower().split(".")[-1]
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid Format {extension} is no allowed only {ALLOWED_EXTENSIONS}"
        )
    
    
    #read bytes
    file_bytes = await file.read()
    file_size = len(file_bytes)
    checksum = hashlib.sha256(file_bytes).hexdigest()
    now_utc = datetime.now(manila_tz)
    
    #save file through async
    save_path = STORAGE_DIRECTORY / extension / checksum
    save_path.mkdir(parents=True, exist_ok=True)
    final_file_path = save_path / filename
    
    # async with aiofiles.open(final_file_path, "wb") as f:
    #     await f.write(file_bytes)
    
    def write_file():
        with open(final_file_path, "wb") as f:
            f.write(file_bytes)
        
    #metadata of the document
    document = DocumentModel(
        title=title,
        control_number=control_number,
        series_years=series_years,
        physical_shelf_locations=physical_shelf_locations,
        document_category_id=document_category_id,
        clearance_level=clearance_level,
        created_by_id=current_user.id,
        created_at=manila_tz,
    )
    
    db.add(document)
    await db.flush()
    
    document_version = DocumentModel(
        document_id=document.id,
        storage_path=str(final_file_path),
        file_name=filename,
        file_extension=extension,
        mime_type=file.content_type,
        file_size=file_size,
        checksum=checksum,
        version_number=1,
        status="uploaded",
        uploaded_by_id=current_user.id,
        
    )
    
    await run_in_threadpool(write_file)
    db.add(document_version)
    await db.commit()
    await db.refresh(document)
    
    
    return{
        "id": document.id,
        "filename": filename,
        "checksum": checksum
    }
    

@app.post("/upload/new-version", status_code=status.HTTP_201_CREATED, response_model=DocumentVersion)
async def upload_new_version(
    document_id: int,
    file: UploadFile = File(...),
    title: str = Form(...),
    control_number: str = Form(...),
    series_years: date = Form(...),
    physical_shelf_locations: str = Form(...),
    document_category_id: int = Form(...),
    clearance_level: ClearanceLevel = Form(default=ClearanceLevel.PUBLIC), 
    db:AsyncSession=Depends(get_db),
    current_user: Users = Depends(get_current_active_user),
    
):
    filename = file.filename
    extension = filename.lower().split(".")[-1]
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid Format {extension} is no allowed only {ALLOWED_EXTENSIONS}"
        )
    
    
    #read bytes
    file_bytes = await file.read()
    file_size = len(file_bytes)
    checksum = hashlib.sha256(file_bytes).hexdigest()
    now_utc = datetime.now(manila_tz)
    
    versioning = select(func.max(DocumentVersion.version_number)).where(
        DocumentVersion.document_id == document_id
    )
    
    latest_version = await db.scalar(versioning)
    version_number = (latest_version or 0) + 1 

    
    #save file through async
    save_path = STORAGE_DIRECTORY / extension / checksum
    save_path.mkdir(parents=True, exist_ok=True)
    final_file_path = save_path / filename / version_number
    
    # async with aiofiles.open(final_file_path, "wb") as f:
    #     await f.write(file_bytes)
    
    def write_file():
        with open(final_file_path, "wb") as f:
            f.write(file_bytes)
        
    #metadata of the document
    document = DocumentModel(
        title=title,
        control_number=control_number,
        series_years=series_years,
        physical_shelf_locations=physical_shelf_locations,
        document_category_id=document_category_id,
        clearance_level=clearance_level,
        created_by_id=current_user.id,
        created_at=manila_tz,
    )
    
    db.add(document)
    await db.flush()
    
    document_version = DocumentVersion(
        document_id=document.id,
        storage_path=str(final_file_path),
        file_name=filename,
        file_extension=extension,
        mime_type=file.content_type,
        file_size=file_size,
        checksum=checksum,
        version_number=1,
        status="uploaded",
        uploaded_by_id=current_user.id,
        
    )
    
    await run_in_threadpool(write_file)
    db.add(document_version)
    await db.commit()
    await db.refresh(document)
    
    
    return{
        "id": document.id,
        "filename": filename,
        "checksum": checksum,
        "version_number": version_number
        
    }
    
    
