from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date

#import 
from api.models.enums.docs import ClearanceLevel


class CreatedBySchema(BaseModel):
    username: str
    first_name: str
    middle_name: str
    last_name: str
    position: str
    office: str 
    division: str

class DocumentVersionSchema(BaseModel):
    id: int
    document_id: int
    storage_path: str
    file_name: str
    file_extension: str
    file_size: int
    version_number: int
    status: str 
    is_current: bool
    uploaded_by: Optional[CreatedBySchema] = None
    
    
    
    
    model_config=ConfigDict(from_attributes=True)
    
    
    

class DocumentStatusSchema(BaseModel):
    name: str
    

class DocumentCategorySchema(BaseModel):
    name: str
    
    
class DocumentTagSchema(BaseModel):
    name: str
    color_code: str

class DocTagAssignmentSchema(BaseModel):
    confidence_score: float
    document_tag: DocumentTagSchema
    

    
    
    

class DocumentSchema(BaseModel):
    id: int
    title: str
    department_order: str
    series_years: date
    physical_shelf_location: str
    versions: list[DocumentVersionSchema]
    status: Optional[DocumentStatusSchema] = None
    is_deleted: bool
    document_tag_assignments: list[DocTagAssignmentSchema]
    category: Optional[DocumentCategorySchema] = None
    created_by: Optional[CreatedBySchema] = None
    clearance_level: ClearanceLevel

    created_at: datetime
    updated_at: Optional[datetime] = None    
    
    model_config=ConfigDict(from_attributes=True)



#update
class DocumentUpdateSchema(BaseModel):
    title: str
    department_order: int
    physical_shelf_location: str
    status: DocumentStatusSchema
    category: DocumentCategorySchema
    clearance_level: ClearanceLevel
    update_at: datetime

    model_config = ConfigDict(from_attributes=True)


#delete part as a soft delete
class DocumentDeleteSchema(BaseModel):
    is_delete: bool
    title: str
    updated_at: datetime


#for retrieving the deleted document
class DocumentRetrieveSchema(BaseModel):
    is_deleted: bool
    updated_at: datetime
    

#for searching
class DocumentSearchSchema(BaseModel):
    title: Optional[str]=None
    department_order: Optional[str]=None
    series_years: Optional[date]=None
    physical_shelf_location: Optional[str]=None
    status: Optional[DocumentStatusSchema] = None
    category: Optional[DocumentCategorySchema]=None
    created_by: Optional[CreatedBySchema]=None
    clearance_level: Optional[ClearanceLevel] = None
    created_at: Optional[datetime]=None
    
    model_config=ConfigDict(from_attributes=True)
    