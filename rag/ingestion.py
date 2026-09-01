from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass, field
from typing import Any

import anydoc
from api.models.document import DocumentVersion
from core.dependencies import Deps, SessionLocal, deps
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from api.models.document import DocumentVersion, DocumentChunks

from depicdoc import linearize_document


@dataclass
class FileChunk:
    document_version_id: int
    file_name: str
    chunk_id: str
    content: str
    metadata: dict[str, Any] = field(default_factory=dict)


async def extract_text(file_bytes: bytes) -> str:
    markdown = anydoc.to_markdown_bytes(file_bytes)
    return markdown


def chunk_text(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 200,
) -> list[str]:
    if not text:
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", " ", ""],
    )
    return splitter.split_text(text)


async def insert_file_chunk(
    sem: asyncio.Semaphore,
    deps: Deps,
    chunk: FileChunk,
) -> None:
    async with sem:
        unique_string = f"{chunk.document_version_id}_chunk_{chunk.chunk_id}"
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, unique_string))

        try:
            document = Document(
                page_content=chunk.content,
                metadata={
                    **chunk.metadata,
                    "document_version_id": chunk.document_version_id,
                    "file_name": chunk.file_name,
                    "chunk_id": chunk.chunk_id,
                },
            )

            await deps.vector_store.aadd_documents(
                documents=[document],
                ids=[point_id],
            )

        except Exception:
            raise


async def process_uploaded_file(
    document_version_id: int, file_name: str, file_path: str
) -> None:
    try:
        # print(f"Extracting Text from {document_version_id}")

        async with SessionLocal() as db_session:
            query = (
                select(DocumentVersion)
                .where(DocumentVersion.id == document_version_id)
                .options(selectinload(DocumentVersion.document))
            )
            result = await db_session.execute(query)
            version = result.scalar_one_or_none()

        if not version or not version.document:
            raise ValueError(
                f"DocumentVersion {document_version_id} or parent Document not found"
            )

        document_id = version.document_id
        version_number = version.version_number
        clearance_level = (
            version.document.clearance_level.value
            if hasattr(version.document.clearance_level, "value")
            else str(version.document.clearance_level)
        )

        with open(file_path, "rb") as f:
            file_bytes = f.read()

        markdown = await extract_text(file_bytes)
        linearized_markdown = linearize_document(markdown)
        text_chunk = chunk_text(linearized_markdown)

        table_chunks = [c for c in text_chunk if "[Columns:" in c or " | " in c]


        # print(
        #     f"[DepicDocs] Version {document_version_id}: Generated {len(text_chunk)} chunks "
        #     f"({len(table_chunks)} table chunks detected)"
        # )


        for idx, t_chunk in enumerate(table_chunks[:2]):
            print(f"[DepicDocs] Table Sample #{idx+1}:\n{t_chunk[:200]}...")

        file_chunks = [
            FileChunk(
                document_version_id=document_version_id,
                file_name=file_name,
                chunk_id=str(i),
                content=chunk,
                metadata={
                    "document_id": document_id,
                    "version_number": version_number,
                    "clearance_level": clearance_level,
                },
            )
            for i, chunk in enumerate(text_chunk)
        ]

        sem = asyncio.Semaphore(5)
        task = [insert_file_chunk(sem, deps, chunk) for chunk in file_chunks]
        await asyncio.gather(*task)

        async with SessionLocal() as db_session:
            version = await db_session.get(DocumentVersion, document_version_id)
            if version:
                version.status = "indexed"
                await db_session.commit()

        print(f"[DepicDocs] Version {document_version_id} successfully indexed into vector store!")

    except Exception as e:
        print(f"Ingestion Failed for version {document_version_id}: {e}")
        async with SessionLocal() as db_session:
            for i, chunk_content in enumerate(text_chunk):
                db_chunk = DocumentChunks(
                    start_char_idx=0,
                    chunk_index=1,
                    content=chunk_content,
                    page_number=None,
                    token_count=len(chunk_content.split()),
                    vector_id=i,
                    chunk_metadata={
                        "document_id": document_id,
                        "version_number": version_number,
                        "clearance_level": clearance_level,
                    },
                    created_at=datetime.now(),
                )
                db_session.add(db_chunk)

            version = await db_session.get(DocumentVersion, document_version_id)
            if version:
                version.status = "indexed"
            await db_session.commit()



            # version = await db_session.get(DocumentVersion, document_version_id)
            # if version:
            #     version.status = "failed"
            #     await db_session.commit()
