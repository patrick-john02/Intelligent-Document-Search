"""ArchiveProposal: Alon's structured output.

Purpose: Alon must return the SAME machine-readable shape every time, so the pipeline can
save it to archive_proposals and the review UI can show it field by field.
Why validators: LLM output is never fully trusted. Values are normalized (lowercase type,
confidence clamped to 0-1) and an invalid document type becomes 'other' instead of crashing
the run.
"""
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from rag.classification.labels import DOC_TYPES


class KeyField(BaseModel):
    """One important value read from the document (e.g. DV number, payee, amount, date)."""
    name: str = Field(description="Field name in snake_case, e.g. 'dv_number', 'payee', 'amount', 'date', 'author'.")
    value: str = Field(description="The value exactly as written in the document.")
    page: Optional[int] = Field(default=None, description="Page where the value was found, if known.")


class DuplicateWarning(BaseModel):
    """An already-archived document that may be the same as this one."""
    document_id: int
    title: str
    match_type: str = Field(description="EXACT_HASH, MINHASH_JACCARD, TOKEN_DISTANCE or SEMANTIC_SIMILARITY.")
    similarity: float = Field(description="0.0 to 1.0")


class ArchiveProposal(BaseModel):
    """Proposed archive metadata for one uploaded document. A human reviews it before it is applied."""

    title: str = Field(description="Clear, specific archive title based on the content, "
                                   "e.g. 'Disbursement Voucher DV-2024-00128 - ABC Trading'.")

    document_type: str = Field(description="One of the allowed document types from list_document_types. "
                                           "Use 'other' if none fits. Never 'unknown'.")
    document_type_confidence: float = Field(description="Your confidence in document_type, 0.0 to 1.0.")
    document_type_reason: str = Field(description="One or two sentences: the evidence for the type.")
    agrees_with_classifier: bool = Field(description="True if document_type equals the classifier's final label.")
    suggested_new_type: Optional[str] = Field(
        default=None, description="Only when document_type is 'other': a snake_case name for a new type, "
                                  "e.g. 'thesis_manuscript'.")

    series_year: Optional[int] = Field(default=None, description="Year the document belongs to, from its content.")
    department_order: Optional[str] = Field(default=None, description="Issuing department/office or order, from the content.")

    key_fields: list[KeyField] = Field(default_factory=list, description="Important values found in the document.")

    suggested_shelf_location: Optional[str] = Field(
        default=None, description="Where the paper copy should be stored, ONLY based on similar archived "
                                  "documents. Null if there is no evidence.")
    shelf_location_reason: Optional[str] = Field(default=None, description="Why this shelf location.")

    duplicates: list[DuplicateWarning] = Field(default_factory=list)

    summary: str = Field(description="2 to 3 sentence summary of what the document is.")
    issues: list[str] = Field(default_factory=list,
                              description="Problems a reviewer must know about: placeholder or mismatched "
                                          "upload values, low OCR quality, possible duplicates, checks that "
                                          "could not run.")
    needs_human_review: bool = Field(description="True if anything is uncertain, mismatched, duplicated or unchecked.")

    # ---- validators: never trust LLM output blindly ----

    @field_validator("document_type")
    @classmethod
    def _valid_type(cls, v: str) -> str:
        v = (v or "").strip().lower().replace(" ", "_").replace("-", "_")
        return v if v in DOC_TYPES else "other"

    @field_validator("document_type_confidence")
    @classmethod
    def _clamp_confidence(cls, v: float) -> float:
        return max(0.0, min(1.0, float(v)))

    @field_validator("suggested_new_type")
    @classmethod
    def _snake_case(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().lower().replace(" ", "_").replace("-", "_") if v else None

    @field_validator("series_year")
    @classmethod
    def _plausible_year(cls, v: Optional[int]) -> Optional[int]:
        return v if v is None or 1900 <= v <= 2100 else None