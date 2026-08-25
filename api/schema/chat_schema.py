from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

from api.models.enums.conv import TaskType

class ChatMessagesResponse(BaseModel):
    id: int
    content: str
    tasks_type: Optional[TaskType] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationsResponse(BaseModel):
    id: int
    title: str
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSchema(BaseModel):
    content: str

class ConvSchema(BaseModel):
    title:str



