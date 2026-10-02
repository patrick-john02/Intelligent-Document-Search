# rag/storage.py: Vector store & PostgreSQL chunk persistence with parent-child support
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Sequence
import logging

from sqlalchemy import delete, text
from core.dependencies import SessionLocal, deps
from langchain_core.documents import Document
from api.models.document import DocumentVersion, DocumentChunks, DocumentParentChunks
from rag.chunker import FileChunk, ParentChunk, ChunkingResult

logger = logging.getLogger(__name__)




async def save_chunks_to_vector_store(
    file_chunks: Sequence[FileChunk],
    document_version_id: int | None = None,
) -> None:



    if not file_chunks:
        return





    if document_version_id is None and len(file_chunks) > 0:
        document_version_id = getattr(file_chunks[0], "document_version_id", None)
        if document_version_id is None and hasattr(file_chunks[0], "metadata"):
            document_version_id = file_chunks[0].metadata.get("document_version_id")

    docs = [
        Document(page_content=c.content, metadata=c.metadata)
        for c in file_chunks
    ]
    ids = [
        str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{c.document_version_id}_chunk_{c.chunk_id}"))
        for c in file_chunks
    ]



    if document_version_id is not None:
        try:
            async with SessionLocal() as db_session:
                await db_session.execute(
                    text("DELETE FROM langchain_pg_embedding WHERE cmetadata->>'document_version_id' = :v_id"),
                    {"v_id": str(document_version_id)},
                )
                await db_session.commit()
        except Exception as e:
            logger.warning(f"[Storage] Pre-delete by document_version_id failed ({e}), attempting adelete by IDs...")
            try:
                await deps.vector_store.adelete(ids=ids)
            except Exception as del_err:
                logger.warning(f"[Storage] Fallback adelete also failed ({del_err})")
    else:
        try:
            await deps.vector_store.adelete(ids=ids)
        except Exception:
            pass



    await deps.vector_store.aadd_documents(documents=docs, ids=ids)







async def save_chunks_to_database(
    document_version_id: int,
    file_chunks: Sequence[FileChunk],
    parent_chunks: Sequence[ParentChunk] | None = None,
) -> None:



    async with SessionLocal() as db_session:


        await db_session.execute(
            delete(DocumentChunks).where(DocumentChunks.document_version_id == document_version_id)
        )
        await db_session.execute(
            delete(DocumentParentChunks).where(DocumentParentChunks.document_version_id == document_version_id)
        )






        if parent_chunks:
            for p in parent_chunks:
                db_parent = DocumentParentChunks(
                    document_version_id=document_version_id,
                    parent_id=p.parent_id,
                    section_title=p.section_title,
                    content=p.content,
                    page_number=p.page_number,
                    token_count=p.token_count,
                    chunk_metadata=p.metadata,
                    created_at=datetime.now(),
                )
                db_session.add(db_parent)





        for i, c in enumerate(file_chunks):
            db_chunk = DocumentChunks(
                document_version_id=document_version_id,
                start_char_idx=0,
                chunk_index=c.chunk_index,
                content=c.content,
                page_number=c.page_number,
                token_count=c.token_count,
                parent_chunk_id=c.parent_chunk_id,
                vector_id=i,
                chunk_metadata=c.metadata,
                created_at=datetime.now(),
            )
            db_session.add(db_chunk)




        version = await db_session.get(DocumentVersion, document_version_id)
        if version:
            version.status = "indexed"
        await db_session.commit()




async def update_document_status(document_version_id: int, status: str) -> None:



    async with SessionLocal() as db_session:
        version = await db_session.get(DocumentVersion, document_version_id)
        if version:
            version.status = status
            await db_session.commit()


async def save_document_chunks(
    document_version_id: int,
    file_chunks: Sequence[FileChunk] | ChunkingResult,
) -> None:




    if isinstance(file_chunks, ChunkingResult):
        children = file_chunks.chunks
        parents = file_chunks.parents
    else:
        children = list(file_chunks)
        parents = []


    await save_chunks_to_vector_store(children, document_version_id=document_version_id)
    await save_chunks_to_database(document_version_id, children, parents)