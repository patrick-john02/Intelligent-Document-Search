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

# ============================================================================
# FEATURE 1: VECTOR STORE PERSISTENCE (Indexes ONLY Child Chunks)
# Vector search indexes ONLY child chunks (C001, C002, ...) ~400 tokens each.
# Children give precise semantic retrieval and avoid diluting vector similarity.
#
# IDEMPOTENCY & CELERY RETRY HANDLING:
# When a Celery task fails mid-way and retries, duplicate vector records must NOT
# be created in pgvector. We guarantee vector store idempotency via two mechanisms:
# 1. Deterministic vector ID: uuid5(NAMESPACE_DNS, f"{version_id}_chunk_{chunk_id}")
#    ensures the same logical chunk produces the identical persistent UUID.
# 2. Pre-deletion: Any previous vector embeddings belonging to this
#    document_version_id are purged from langchain_pg_embedding before inserting
#    fresh vectors.
# ============================================================================

async def save_chunks_to_vector_store(
    file_chunks: Sequence[FileChunk],
    document_version_id: int | None = None,
) -> None:
    """Creates LangChain Documents for child retrieval chunks and inserts into the vector store.
    
    Guarantees idempotency on Celery retries by:
    1. Using deterministic UUIDv5 identifiers: uuid5(NAMESPACE_DNS, f"{version_id}_chunk_{chunk_id}")
    2. Purging preexisting vectors for this document_version_id prior to insertion.
    """
    if not file_chunks:
        return

    # Derive document_version_id from chunk metadata or model if not explicitly provided
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

    # Idempotent cleanup: Purge any prior vector embeddings for this version before inserting
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

    # Insert fresh vectors with deterministic UUIDs
    await deps.vector_store.aadd_documents(documents=docs, ids=ids)


# ============================================================================
# FEATURE 2: POSTGRESQL PARENT & CHILD PERSISTENCE
# 1. Child Chunks (document_chunks): Indexed for lexical search and exact lookups.
#    Has explicit parent_chunk_id foreign reference.
# 2. Parent Chunks (document_parent_chunks): Full ~1,200 token sections stored
#    for on-demand agent contextual expansion.
#
# IDEMPOTENCY & CELERY RETRY HANDLING:
# Ingestion tasks may fail and retry at any point. To ensure the relational
# database remains in a consistent state without duplicate chunk rows:
# 1. Transactional Pre-deletion: Existing records in document_chunks and
#    document_parent_chunks matching document_version_id are deleted in the
#    same transaction before new ones are inserted.
# 2. Database Constraints: UniqueConstraint("document_version_id", "chunk_index")
#    and UniqueConstraint("document_version_id", "parent_id") physically prevent
#    duplicate rows at the PostgreSQL storage engine level.
# ============================================================================

async def save_chunks_to_database(
    document_version_id: int,
    file_chunks: Sequence[FileChunk],
    parent_chunks: Sequence[ParentChunk] | None = None,
) -> None:
    """Persists child chunks and parent representations into PostgreSQL with atomic replacement."""
    async with SessionLocal() as db_session:
        # 1. Purge any preexisting chunks and parents for this version to ensure idempotency
        await db_session.execute(
            delete(DocumentChunks).where(DocumentChunks.document_version_id == document_version_id)
        )
        await db_session.execute(
            delete(DocumentParentChunks).where(DocumentParentChunks.document_version_id == document_version_id)
        )

        # 2. Save Parent representations (~1,200 tokens each)
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

        # 3. Save Child retrieval chunks (~400 tokens each)
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

        # 4. Mark DocumentVersion as indexed
        version = await db_session.get(DocumentVersion, document_version_id)
        if version:
            version.status = "indexed"
        await db_session.commit()


# ============================================================================
# FEATURE 3: STATUS MANAGEMENT & COMPOSITE PERSISTENCE
# Handles lifecycle status transitions and coordinates idempotent persistence
# across both PGVector and relational PostgreSQL.
# ============================================================================

async def update_document_status(document_version_id: int, status: str) -> None:
    """Updates the status of a DocumentVersion (e.g. 'failed' or 'indexed')."""
    async with SessionLocal() as db_session:
        version = await db_session.get(DocumentVersion, document_version_id)
        if version:
            version.status = status
            await db_session.commit()


async def save_document_chunks(
    document_version_id: int,
    file_chunks: Sequence[FileChunk] | ChunkingResult,
) -> None:
    """
    Composite helper orchestrating idempotent persistence:
    1. Indexes Child chunks in Vector Store (dense search) with pre-deletion.
    2. Persists Child chunks in PostgreSQL (lexical search + FTS) with atomic replacement.
    3. Persists Parent chunks in PostgreSQL (Document Analysis Agent context expansion).
    """
    if isinstance(file_chunks, ChunkingResult):
        children = file_chunks.chunks
        parents = file_chunks.parents
    else:
        children = list(file_chunks)
        parents = []

    # 1. Vector store indexes ONLY the children (with idempotent pre-deletion)
    await save_chunks_to_vector_store(children, document_version_id=document_version_id)
    # 2. Database stores both children and parents (within an atomic replacement transaction)
    await save_chunks_to_database(document_version_id, children, parents)