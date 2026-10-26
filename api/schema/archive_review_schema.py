from pydantic import BaseModel, ConfigDict
from typing import Any
from datetime import datetime


class ArchiveProposalResponse(BaseModel):
    id: int
    document_version_id: int
    status: str
    proposal: dict[str, Any] | None = None
    final_values: dict[str, Any] | None = None
    needs_human_review: bool
    model_name: str | None = None
    error_message: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
    