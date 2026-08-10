from fastapi import (
    UploadFile, FastAPI, File, Query, Depends, HTTPException, APIRouter, status,
    Request, BackgroundTasks, Form
)

from fastapi_pagination import Page, add_pagination, paginate
from sqlalchemy import select, desc, func, update, or_
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import FileResponse
from sqlalchemy.orm import selectinload
from datetime import datetime, date
from dotenv import load_dotenv
from zoneinfo import ZoneInfo
from typing import Annotated
from pathlib import Path
import hashlib
import os


#models
from api.models.document import (
    DocumentModel, DocumentVersion,
)
from api.models.enums.docs import ClearanceLevel
from api.models.users import Users
#schema 
from api.schema.document_schema import (
    DocumentSchema, DocumentUpdateSchema,
    DocumentDeleteSchema, DocumentRetrieveSchema,
)


#dependency
from core.dependencies import get_db

#security
from core.security import(
    get_current_active_user, get_user_permissions
)

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

#fetch all documents
@app.get("/all",status_code=status.HTTP_200_OK, response_model=DocumentSchema)
async def get_all_documents(
    db:AsyncSession=Depends(get_db),
    current_user: Users = Depends(get_current_active_user),
):
    permission = get_user_permissions(current_user)

    
    document_query = select(DocumentModel).where(
        DocumentModel.is_deleted.is_(False),
    )

    if "*" in permission or "document.read_all" in permission:
        pass

    elif "documents:read_public" in permission:
        query=document_query.where(
            or_(
                DocumentModel.created_by_id == current_user.id,
                DocumentModel.clearance_level == ClearanceLevel.PUBLIC
            )
        )

    else:
        query = document_query.where(DocumentModel.created_by_id == current_user.id)

    result = await db.execute(query.options(selectinload(DocumentModel.versions)))

    return result.scalars().all()

#fetch speficific owned documents
@app.get("/{document_id}", status_code=status.HTTP_200_OK, response_model=DocumentSchema)
async def get_document(
    document_id: int,
    db:AsyncSession=Depends(get_db),
    current_user: Users = Depends(get_current_active_user),
):
    permission = get_user_permissions(current_user)

    document_query = select(DocumentModel).where(
        DocumentModel.id == document_id,
        DocumentModel.is_deleted.is_(False), 
    )

    if "*" in permission or "documents.read_all" in permission:
        pass

    elif "document:read_public" in permission:
        query=document_query.where(
            or_(
                
                DocumentModel.created_by_id == current_user.id,
                DocumentModel.clearance_level == ClearanceLevel.PUBLIC
            )
        )
    else:

        query = -document_query.where(DocumentModel.created_by_id == current_user.id)

    result = await db.execute(query.options(selectinload(DocumentModel.versions)))

    doc = result.scalar_one_or_none()

    if not doc:
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or accces denied")
    

@app.get("/version/{version_id}/download", status_code=status.HTTP_200_OK)
async def download_document_version(
    version_id: int,
    db:AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_active_user)
):
    permission = get_user_permissions(current_user)

    query = (
        select(DocumentVersion).where(
            DocumentVersion.id ==version_id,
        ).options(selectinload(DocumentVersion.document))
    )
    result = await db.execute(query)
    version = result.scalar_one_or_none()

    if not version or not version.document or version.document.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document Version not Found"
        )

    document = version.document
    is_admin = "*" in permission or "documents:read_all" in permission
    is_public = "document:read_public" in permission and document.clearance_level == ClearanceLevel.PUBLIC
    is_owner = document.created_by_id == current_user.id

    if not(is_admin or is_public or is_owner):
        raise HTTPException(
            status=status.HTTP_401_UNAUTHORIZED, detail="You don't have permission to view or download this file"
        )

    file_path= Path(version.storage_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Physical file missing on server storage"
        )

    return FileResponse(
        path=str(file_path),
        filename=version.file_name,
        media_type=version.mime_type
    )


#Endpoint for patch
@app.patch ("/{document_id}/update", status_code=status.HTTP_200_OK, response_model=DocumentUpdateSchema)
async def update_document(
    document_id: int,
    payload: DocumentUpdateSchema,
    db:AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_active_user)
):

    permission = get_user_permissions(current_user)

    query = select(DocumentModel).where(
        DocumentModel.id == document_id,
        DocumentModel.is_deleted.is_(False),
    ).options(selectinload(DocumentModel.versions))

    result = await db.execute(query)
    document = result.scalar_on_or_none()

    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document Not Found!!")

    is_admin = "*" in permission or "document:write" in permission
    is_owner = document.created_by_id == current_user.id


    if not (is_admin or is_owner):
        raise HTTPException( 
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have perission to update this document"
        )


    update_date = payload.model_dump(exclude_unset=True) #  this will exclude fields send in JSON


    for field, value in update_date.items():
        setattr(document, field, value)

    document.updated_at = datetime.now(manila_tz)

    await db.commit()
    await db.refresh(document)

    return document



#delete document
@app.delete("/{document_id}/delete", status_code=status.HTTP_200_OK, response_model=DocumentDeleteSchema)
async def delete_document(
    document_id: int,
    title: str,
    db:AsyncSession=Depends(get_db),
    current_user: Users=Depends(get_current_active_user),
):
    permission = get_user_permissions(current_user)

    query = select(DocumentModel).where(
        DocumentModel.id == document_id,
        DocumentModel.is_deleted.is_(False)
    ).options(selectinload(DocumentModel.versions))

    results = await db.execute(query)
    doc = results.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or already deleted")
    

    is_admin = "*" in permission or "document:write" in permission
    is_owner = doc.created_by_id == current_user.id

    if not(is_admin or is_owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to delete this document only owner")


    doc.is_deleted = True
    doc.updated_at = datetime.now(manila_tz)


    await db.commit()


    return {"message": f"Document {title} deleted successfully", "id": document_id}







    

    


#upload a document
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
    
#upload a document version
@app.post("/{document_id}/new-version", status_code=status.HTTP_201_CREATED, response_model=DocumentVersion)
async def upload_new_version(
    document_id: int,
    file: UploadFile = File(...),
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
    final_file_path = save_path / f"v{version_number}_{filename}"
    
    
    def write_file():
        with open(final_file_path, "wb") as f:
            f.write(file_bytes)
        
    
    document_version = DocumentVersion(
        document_id=document_id,
        storage_path=str(final_file_path),
        file_name=filename,
        file_extension=extension,
        mime_type=file.content_type,
        file_size=file_size,
        checksum=checksum,
        version_number=version_number,
        status="uploaded",
        uploaded_by_id=current_user.id,
    )

    document = await db.get(DocumentModel, document_id)
    if document:
        document.updated_at = now_utc
    else:
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document Not Found!")

    await db.execute(
        update(DocumentVersion)
        .where(DocumentVersion.document_id == document_id)
        .values(is_crrent=False)
    )
    
    await run_in_threadpool(write_file)
    db.add(document_version)
    db.add(document)
    await db.commit()
    
    
    return{
        "id": document_version.id,
        "document": document,
        "filename": filename,
        "checksum": checksum,
        "version_number": version_number
    }



#RETRIEVE
@app.get("/deleted-records", status_code=status.HTTP_200_OK, response_model=DocumentRetrieveSchema)
async def get_all_deleted_records(
    document_id:int,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_active_user)
):
    permission = get_user_permissions(current_user)

    query = select(DocumentModel).where(
        DocumentModel.is_deleted.is_(True),
    )

    results = await db.execute(query)
    document=  results.scalars().all()
    

    is_admin = "*" in permission or "document:write" in permission
    is_owner = document.created_by_id == current_user.id

    if not(is_admin or is_owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to delete this document only owner")

    return document
    


@app.post("/{document_id}/deleted-records", status_code=status.HTTP_200_OK, response_model=DocumentSchema)
async def deleted_records_lists(
    document_id,
    title: str,
    db:AsyncSession=Depends(get_db),
    current_user: Users = Depends(get_current_active_user)
):
    permission=get_user_permissions(current_user)

    query = select(DocumentModel).where(
        DocumentModel.is_deleted.is_(True),
        DocumentModel.created_by == current_user.id
    )

    result = await db.execute(query)
    document = result.scalars().all()

    if not document:
        raise HTTPException( status_code=status.HTTP_404_NOT_FOUND, detail="Document not Found")

    is_admin = "*" or "document:write" in permission
    is_owner = document.created_by_id == current_user.id

    if not (is_admin or is_owner):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="You are not allowed to retrieve this document"
        )

    document.is_deleted = False
    document.updated_at = datetime.now(manila_tz)

    await db.commit()
    return {"message": f"Document {title} retrieved successfully", "id": document_id}


