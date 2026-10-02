from __future__ import annotations


from dataclasses import dataclass
from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import selectinload


from core.dependencies import SessionLocal
from api.models.document import DocumentVersion
from rag.extractor import ExtractionResult

#this will hold the metadata fetched on the database
@dataclass
class DocumentMetadata:
    document_id: int 
    document_version_id: int
    version_number: int
    clearance_level: str
    file_name: str
    is_current: bool = True
    title: str | None = None



async def fetch_document_metadata(document_version_id: int)->DocumentMetadata:
    async with SessionLocal() as db_session:
        query = (
            select(DocumentVersion)
            .where(DocumentVersion.id == document_version_id)
            .options(selectinload(DocumentVersion.document))
        )
        result = await db_session.execute(query)
        version = result.scalar_one_or_none()

    if not version or not version.document:
        raise ValueError(f"Document Version {document_version_id} or parent Document not found")

    clearance_level = (
        version.document.clearance_level.value
        if hasattr(version.document.clearance_level, "value")
        else str(version.document.clearance_level)
    )

    return DocumentMetadata(
        document_id=version.document_id,
        document_version_id=version.id,
        version_number=version.version_number,
        clearance_level=clearance_level.lower(),
        file_name=version.file_name,
        is_current=version.is_current,
        title=version.document.title,
    )

#Standardizes metadata across Vector Store (Qdrant and PGVector) and PostgreSQL.
def build_chunk_metadata(
        doc_meta: DocumentMetadata,
        chunk_id: str | int,
)->dict[str, Any]:
    return{
        "document_id": doc_meta.document_id,
        "document_version_id": doc_meta.document_version_id,
        "version_number": doc_meta.version_number,
        "clearance_level": doc_meta.clearance_level.lower(),
        "is_current": doc_meta.is_current,
        "file_name": doc_meta.file_name,
        "chunk_id": str(chunk_id),
    }


#saves OCR acciracy and scanned PDF FLAGS to doc versions
async def update_extraction_metadata(
        document_version_id: int,
        extraction:ExtractionResult, 
)->None:
    async with SessionLocal() as db_session:
        version = await db_session.get(DocumentVersion, document_version_id)
        if version:
            version.ocr_accuracy_score = extraction.ocr_score
            version.is_scanned_pdf =  extraction.is_scanned
            await db_session.commit()



