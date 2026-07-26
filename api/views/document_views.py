from fastapi import UploadFile, FastAPI, File, Query
from typing import Annotated
from sqlalchemy import select, desc

#models
from models.document import DocumentModel

#schema 
from schema.document_schema import DocumentSchema

app = FastAPI()


@app.post("/file/")
async def create_file(file:Annotated[bytes,File()]):
    return {"file_size": len(file)}

@app.get("/document-lists/", response_model=list[DocumentSchema])
async def document_list(
    created_at: str = Query(default="created_at", description="Field to sort by")
):
    
    if not hasattr(DocumentModel, created_at):
        raise ValueError(f"Invalid sort field: {created_at}")
    
    created_at_order = getattr(DocumentModel,created_at)
    
    
    document_query = select(DocumentModel.where(
        DocumentModel.is_deleted == False,
    )).order_by(created_at_order)
    
    # result =     

# @app.post("/uploadfile/", response_model=DocumentSchema)
# async def create_upload_file(file:UploadFile):
    