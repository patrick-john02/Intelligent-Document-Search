from __future__ import annotations

import asyncio
import logging
import httpx
from typing import Any
from celery.signals import worker_process_init, worker_process_shutdown
from sqlalchemy.exc import OperationalError, DBAPIError

from rag.worker import celery_app
from rag.extractor import extract_text, ExtractionResult
from rag.metadata import(
    fetch_document_metadata,
    build_chunk_metadata,
    update_extraction_metadata,
)
from rag.chunker import chunk_document
from rag.storage import save_document_chunks, update_document_status

logger = logging.getLogger(__name__)

TRANSIENT_EXCEPTIONS = (
    OperationalError,
    DBAPIError,
    httpx.HTTPError,
    ConnectionError,
    TimeoutError,
    asyncio.TimeoutError,
)

# Persistent event loop per Celery worker process
_worker_loop: asyncio.AbstractEventLoop | None = None


def get_worker_loop() -> asyncio.AbstractEventLoop: # mainly the interface/type that represents an asyncio event loop.
    
    """Retrieves or creates a persistent asyncio event loop for the current worker process.

    Why a persistent loop per worker process?
    - Module-level async engines (like `core.database.engine` and `PGVector._async_engine`)
      pool asyncpg connections that bind to the loop where they were first opened.
    - When `asyncio.run()` closes the loop, pooled connections retained across tasks fail on
      subsequent tasks with 'Task got Future attached to a different loop' or 'Event loop is closed'.
    - Reusing a single persistent loop across all tasks in this worker process completely prevents
      this lifecycle mismatch.
    """
    global _worker_loop
    if _worker_loop is None or _worker_loop.is_closed():
        _worker_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(_worker_loop)

    return _worker_loop


@worker_process_init.connect #when celery fires the worker_process_init signal, call this function.
def _on_worker_process_init(**kwargs: Any) -> None:
    """Initializes the persistent event loop when a child worker process is spawned."""
    logger.info("[CELERY] Initializing persistent event loop for worker process.")
    get_worker_loop()


@worker_process_shutdown.connect
def _on_worker_process_shutdown(**kwargs: Any) -> None:
    """Closes the persistent event loop when a worker process terminates."""
    global _worker_loop
    if _worker_loop is not None and not _worker_loop.is_closed():
        logger.info("[CELERY] Closing persistent event loop on worker process shutdown.")
        _worker_loop.close()
        _worker_loop = None


async def dispose_worker_engines() -> None:
    """Disposes active SQLAlchemy and vector store connection pools.
    Ensures any pooled connections are cleanly closed so no stale sockets
    or cross-task transactions persist into subsequent task runs.
    """
    try:
        from core.database import engine
        await engine.dispose()
    except Exception as e:
        logger.warning(f"[CELERY] Error disposing database engine: {e}")

    try:
        from core.dependencies import deps
        if hasattr(deps.vector_store, "_async_engine") and deps.vector_store._async_engine is not None:
            await deps.vector_store._async_engine.dispose()
    except Exception as e:
        logger.warning(f"[CELERY] Error disposing vector store engine: {e}")

#Runs the document ingestion pipeline. and Performs OCR/extraction, chunking, and storage.
async def process_uploaded_file(
    document_version_id: int, file_name: str, file_path: str
) -> None:

    try:
        await update_document_status(document_version_id, "processing")
        doc_meta = await fetch_document_metadata(document_version_id)


        #purpose: read the raw binary data of the uploaded file from the disk into memory as a Python
        #bytes object (file_bytes), and then immediately close the file.
        with open(file_path, "rb") as f: #r means Read as text and B means read as Binary bytes
            file_bytes = f.read() #so we are asking here like: Don't interpret this file as text. Give me its actual bytes of this document.
        
        #with as f, this is a python context manager
        #It guarantees that as soon as the indented block finishes (or if an error happens), the operating system file handle f is 
        #immediately closed, preventing file descriptor leaks on the server.
        
        
            
            

        extraction = await extract_text(file_bytes, file_name=file_name)
        await update_extraction_metadata(document_version_id, extraction)

        # Check if extraction produced empty text
        if not extraction.text or not extraction.text.strip():
            raise ValueError(
                f"Document version {document_version_id} ({file_name}) yielded empty extraction (0 characters)."
            )

        file_chunks = await asyncio.to_thread(chunk_document, extraction.text, doc_meta)

        # Guard: Check if chunker produced 0 chunks
        if not file_chunks or len(file_chunks) == 0:
            raise ValueError(
                f"Document version {document_version_id} ({file_name}) produced 0 chunks after chunking."
            )

        await save_document_chunks(document_version_id, file_chunks)
        print(f"[DepicDocs] Version {document_version_id} successfully indexed into vector store and database!")

    finally:
        # Guarantee connection pools are disposed at task end so no leaked sockets linger
        await dispose_worker_engines()


@celery_app.task(
    name="task.process_document",
    bind=True,
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
)
def process_document_task(self, document_version_id: int, file_name: str, file_path: str):
    """Synchronous task running the async ingestion pipeline on the worker's persistent event loop.

    Retry and Status Logic:
    - Sets status to 'processing' at task start.
    - Differentiates between transient errors (DB disconnects, HTTP/network timeouts)
      and permanent errors (missing files, invalid IDs, corrupted input).
    - Permanent errors fail immediately without wasteful retries and record 'failed: <error>'.
    - Transient errors trigger automatic retry with exponential backoff.
    - Only marks 'failed' when retries are completely exhausted or the error is permanent.
    """
    attempt = self.request.retries + 1
    print(f"[CELERY] starting ingestion for {file_name} (version ID: {document_version_id}), attempt {attempt}/{self.max_retries + 1}")

    loop = get_worker_loop()

    try:
        # Run on the persistent worker event loop rather than creating/closing a loop each task
        loop.run_until_complete(process_uploaded_file(document_version_id, file_name, file_path))
        return {"status": "success", "document_version_id": document_version_id}

    except Exception as e:
        is_transient = isinstance(e, TRANSIENT_EXCEPTIONS)
        retries_exhausted = self.request.retries >= self.max_retries

        if not is_transient or retries_exhausted:
            # Permanent error (do not retry) OR all transient retries exhausted
            failure_reason = (
                f"Retries exhausted ({attempt}/{self.max_retries + 1}): {e}"
                if (is_transient and retries_exhausted)
                else str(e)
            )
            print(f"[CELERY] Ingestion permanently failed for {file_name} (version {document_version_id}): {failure_reason}")

            # Record failure state and error message in DB and DocumentProcessingJobs
            try:
                loop.run_until_complete(
                    update_document_status(
                        document_version_id=document_version_id,
                        status="failed",
                        error_message=failure_reason,
                    )
                )
            except Exception as status_err:
                print(f"[CELERY] Warning: could not update failed status in DB: {status_err}")

            raise e
        else:
            # Transient error with remaining retries: keep 'processing' status and retry with backoff
            print(f"[CELERY] Transient error on {file_name} (version {document_version_id}): {e}. Scheduling retry with backoff...")
            raise self.retry(exc=e)