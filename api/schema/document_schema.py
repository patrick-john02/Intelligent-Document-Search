from pydantic import BaseModel

class DocumentSchema(BaseModel):
    id: int
    path: str
    is_deleted: bool
    created_at: str
    update_at: str
    
    