import logging
from pathlib import Path
from typing import Tuple
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

#imports
from api.models.document import DocumentModel, DocumentVersion
from core.database import SessionLocal
from tools.access.permissions import clearance_filter

logger=logging.getLogger(__name__)
NOT_FOUND: Tuple[str, str] = ("", "")

def _active_version_text(doc: DocumentModel) -> str:
    active = next((v for v in doc.versions if v.is_current), doc.versions[-1] if doc.versions else None)
    if not active:
        return ""
    if active.chunks:
        chunks = sorted(active.chunks, key=lambda c: c.chunk_index)
        text = "\n\n".join(c.content for c in chunks if c.content)
        if text.strip():
            return text
    if active.storage_path and Path(active.storage_path).is_file():
        return Path(active.storage_path).read_text(encoding="utf-8", errors="ignore")
    return ""

#this will be a content resolver (using database id , title , and raw text)
#will be using the table DocumentModel and DocumentChunks
# title and filename lookup in the database
# then raw text string passed here directly
async def resolve_document_content(doc_ref: str) -> Tuple[str, str]:
    trimmed = str(doc_ref).strip()

    # Long / multi-line input is raw text the agent passed in directly.
    if len(trimmed) >= 100 or "\n" in trimmed:
        return "Provided Document", trimmed

    if trimmed.isdigit():
        condition = DocumentModel.id == int(trimmed)
    else:
        condition = or_(
            DocumentModel.title.ilike(trimmed),
            DocumentModel.versions.any(DocumentVersion.file_name.ilike(trimmed)),
        )

    query = (
        select(DocumentModel)
        .where(condition, DocumentModel.is_deleted.is_(False), clearance_filter())
        .options(selectinload(DocumentModel.versions).selectinload(DocumentVersion.chunks))
        .limit(1)
    )

    try:
        async with SessionLocal() as session:
            doc = (await session.execute(query)).scalars().first()
            if not doc:
                return NOT_FOUND          # same answer for "missing" and "no access" — don't leak existence
            text = _active_version_text(doc)
            return (doc.title or f"Document #{doc.id}", text) if text.strip() else NOT_FOUND
    except Exception:
        logger.exception("[Fetch] Failed to resolve document %r", trimmed)
        return NOT_FOUND