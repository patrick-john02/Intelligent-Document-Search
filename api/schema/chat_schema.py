from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

from api.models.enums.conv import TaskType
from api.models.enums.conv import ReportType

class ChatMessagesResponse(BaseModel):
    id: int
    sender_type: str
    content: str
    is_helpful: Optional[bool] = None
    task_type: Optional[TaskType] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ConversationsResponse(BaseModel):
    id: int
    title: str
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSchema(BaseModel):
    content: str
    conversation_id: Optional[int] = None
    title: Optional[str] = None
    attachment_ids: list[int] = []

class MentionableDocumentOut(BaseModel):
    """A document the user can target with @ in chat (small: only what the dropdown shows)."""
    id: int                          # document id -> sent back as attachment_ids
    version_id: int
    title: str
    file_name: str
    doc_type: Optional[str] = None
    series_year: Optional[int] = None
    shelf_location: Optional[str] = None
    clearance: str


class ConvSchema(BaseModel):
    title:str
    
class ChatRating(BaseModel):
    user_rating: Optional[int]=None
    is_helpful: Optional[bool] = None

    
    
    


#generated reports
class ReportCreateSchema(BaseModel):
    title:str
    report_type:Optional[ReportType]=None
    report_content:str
    
class ReportResponseSchema(BaseModel):
    id:int
    title:str
    report_type: Optional[ReportType]=None
    report_content:str
    conversation_id: int
    created_by_id:int
    
    
    model_config=ConfigDict(from_attributes=True)

