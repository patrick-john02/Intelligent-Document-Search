from pydantic import BaseModel, ConfigDict, Field
from typing import Any
from datetime import datetime


class CurrentValues(BaseModel):
    """The document's values right now (what the user typed), shown next to Alon's proposal."""
    title: str
    document_type: str | None = None        # from the version (doc_type)
    series_year: int | None = None          # documents.series_years is a DATE -> we send only the year
    department_order: str | None = None
    physical_shelf_location: str | None = None


class ArchiveProposalResponse(BaseModel):
    id: int
    document_version_id: int
    document_id: int                        # so the UI can link to the document
    file_name: str
    current: CurrentValues                  # side-by-side with `proposal`
    status: str
    proposal: dict[str, Any] | None = None
    final_values: dict[str, Any] | None = None
    needs_human_review: bool
    model_name: str | None = None
    error_message: str | None = None
    created_at: datetime
    reviewed_by_id: int | None = None
    reviewed_at: datetime | None = None
    review_note: str | None = None


class RejectProposalSchema(BaseModel):
    review_note: str = Field(min_length=3, description="Why the proposal is rejected")


class AcceptProposalSchema(BaseModel):
    """All fields optional: leave a field out to keep Alon's value, send it to override."""
    title: str | None = Field(default=None, max_length=255)
    document_type: str | None = None
    series_year: int | None = Field(default=None, ge=1900, le=2100)
    department_order: str | None = Field(default=None, max_length=255)
    physical_shelf_location: str | None = Field(default=None, max_length=255)
    review_note: str | None = None
