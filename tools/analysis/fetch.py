from pathlib import Path
from typing import(
    Tuple,
)
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

#imports
from api.models.document import DocumentModel, DocumentVersion
from core.database import SessionLocal


#this will be a content resolver (using database id , title , and raw text)
#will be using the table DocumentModel and DocumentChunks
# title and filename lookup in the database
# then raw text string passed here directly
async def resolve_document_content(doc_ref: str)->Tuple[str,str]:
    trimmed = str(doc_ref).strip()

    if trimmed.isdigit():
        doc_id=int(trimmed)
        try:
            async with SessionLocal() as session:
                query = (
                    select(DocumentModel)
                    .where(DocumentModel.id == doc_id, DocumentModel.is_deleted.is_(False))
                    .options(
                        selectinload(DocumentModel.versions).selectinload(DocumentVersion.chunks)
                    )
                )
                result = await session.execute(query)
                doc = result.scalar_one_or_none()
                if doc: 
                    active_version = next(
                        (v for v in doc.versions if v.is_current),
                        doc.versions[-1] if doc.versions else None
                    )

                    if active_version and active_version.chunks:
                        sorted_chunk = sorted(active_version.chunks, key=lambda c: c.chunk_index)
                        text = "\n\n".join(c.content for c in sorted_chunk if c.content)
                        if text.strip():
                            return doc.title or f"Document #{doc.id}", text

                    if active_version and active_version.storage_path:
                        path = Path(active_version.storage_path)
                        if path.exists() and path.is_file():
                            text = path.read_text(encoding="utf-8", errors = "ignore")
                            if text.strip():
                                return doc.title or f"Document #{doc.id}", text
        except Exception:
            pass

    if len(trimmed) < 100 and "\n" not in trimmed:
        try:
            async with SessionLocal() as session:
                query = (
                    select(DocumentModel)
                    .where(
                        or_(
                            DocumentModel.title.ilike(trimmed),
                            DocumentModel.versions.any(DocumentVersion.file_name.ilike(trimmed))
                        ),
                        DocumentModel.is_deleted.is_(False)
                    )
                    .options(
                        selectinload(DocumentModel.versions).selectinload(DocumentVersion.chunks)
                    )
                )

                result = await session.execute(query)
                doc = result.scalar_one_or_none()
                if doc: 
                    active_version = next(
                        (v for v in doc.versions if v.is_current),
                        doc.versions[-1] if doc.versions else None
                    )

                    if active_version and active_version.chunks:
                        sorted_chunks = sorted(active_version.chunks, key=lambda c: c.chunk_index)
                        text = "\n\n".join(c.content for c in sorted_chunks if c.content)
                        if text.strip():
                            return doc.title or trimmed, text
        except Exception:
            pass

    return "Provided Document", trimmed