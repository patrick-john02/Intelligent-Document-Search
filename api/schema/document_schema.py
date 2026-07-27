from pydantic import BaseModel
from typing import Optional

class DocumentSchema(BaseModel):
    id: int
    file_extension: str
    path: str
    is_deleted: bool
    created_at: str
    update_at: Optional[str] = None    