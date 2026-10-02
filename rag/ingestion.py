from __future__ import annotations

import asyncio
from rag.worker import celery_app

from rag.extractor import extract_text, ExtractionResult
from rag.metadata import(
    fetch_document_metadata,
    build_chunk_metadata,
    update_extraction_metadata,
)
from rag.chunker import chunk_document
from rag.storage import save_document_chunks, update_document_status

async def process_uploaded_file(
    document_version_id: int, file_name: str, file_path: str
) -> None:
    try:
        doc_meta = await fetch_document_metadata(document_version_id)

        with open(file_path, "rb") as f:
            file_bytes = f.read()

        extraction = await extract_text(file_bytes, file_name=file_name)
        await update_extraction_metadata(document_version_id, extraction)

        file_chunks = await asyncio.to_thread(chunk_document, extraction.text, doc_meta)

        await save_document_chunks(document_version_id, file_chunks)
        print(f"[DepicDocs] Version {document_version_id} successfully indexed into vector store and database!")

    except Exception as e:
        print(f"Ingestion Failed for version {document_version_id} : {str(e)}")
        await update_document_status(document_version_id, "failed")
        raise
    


@celery_app.task(name="task.process_document", bind=True, max_retries=3)
def process_document_task(self, document_version_id: int, file_name: str, file_path:str):
    #synchronous tasks that spins up an event loop to run the async ingestion layer
    print(f"[CELERY] starting ingestion for {file_name} (version ID: {document_version_id})")

    try:
        #run the async ingestion pipeline in the celery worker
        asyncio.run(process_uploaded_file(document_version_id, file_name, file_path))
        return {"status":"success", "document_version_id": document_version_id}

    except Exception as e:
        print(f"[CELERY] Task failed: {e}")
        raise self.retry(exc=e, countdown=60)