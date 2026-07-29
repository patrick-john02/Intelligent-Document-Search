from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentSchema(BaseModel):
    id: int
    file_extension: str
    is_deleted: bool
    created_at: datetime
    update_at: Optional[datetime] = None    