from __future__ import annotations

import asyncio
import logging

from celery import chain

from rag.worker import celery_app
from rag.ingestion import get_worker_loop, dispose_worker_engines, TRANSIENT_EXCEPTIONS
from rag.extractor import extract_text
from rag.metadata import fetch_document_metadata, update_extraction_metadata
from rag.classification.ensemble import classify_extraction
from rag.classification.store import has_verified_label, save_classification, get_doc_type
from rag.chunker import chunk_document
from rag.storage import (
    update_document_status,
    version_exists,
    save_extraction,
    get_extraction,
    save_chunks_to_database,
    index_chunks_from_database,
)
from agents.archiving_agent.runner import run_alon
from rag.archive_store import get_uploader_clearance, save_alon_result


logger = logging.getLogger(__name__)

OCR_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "tiff", "bmp", "webp"}

TASK_OPTIONS = dict(bind=True, max_retries=3, acks_late=True)


# ---------- shared runner ----------

async def _with_cleanup(coro):
    try:
        return await coro
    finally:
        await dispose_worker_engines()


def _run_stage(task, stage: str, document_version_id: int, coro):
    """Runs one async stage. Transient errors retry ONLY this stage; permanent ones fail the chain."""
    loop = get_worker_loop()
    attempt = task.request.retries + 1
    logger.info(f"[{stage}] version {document_version_id} attempt {attempt}/{task.max_retries + 1}")

    try:
        return loop.run_until_complete(_with_cleanup(coro))
    except Exception as e:
        is_transient = isinstance(e, TRANSIENT_EXCEPTIONS)
        exhausted = task.request.retries >= task.max_retries

        if is_transient and not exhausted:
            countdown = min(600, 10 * 2 ** task.request.retries)  # 10s, 20s, 40s...
            logger.warning(f"[{stage}] transient error: {e}. Retrying in {countdown}s")
            raise task.retry(exc=e, countdown=countdown)

        reason = f"[{stage}] {e}"
        try:
            loop.run_until_complete(
                update_document_status(document_version_id, "failed", error_message=reason)
            )
        except Exception as status_err:
            logger.warning(f"[{stage}] could not save failed status: {status_err}")
        raise


# ---------- stage logic (async) ----------

async def _extract(document_version_id: int, file_name: str, file_path: str, force: bool) -> int:
    if not force and await get_extraction(document_version_id) is not None:
        logger.info(f"[extract] checkpoint found for {document_version_id}, skipping OCR")
        return document_version_id

    if not await version_exists(document_version_id):
        raise ValueError(
            f"Document version {document_version_id} does not exist in the database "
            f"(stale task or wrong DATABASE_URL). Skipping."
        )

    await update_document_status(document_version_id, "extracting")

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    extraction = await extract_text(file_bytes, file_name=file_name)
    if not extraction.text or not extraction.text.strip():
        raise ValueError(f"{file_name} yielded empty extraction.")

    await save_extraction(document_version_id, extraction)
    await update_extraction_metadata(document_version_id, extraction)
    return document_version_id


async def _load_extraction_or_fail(document_version_id: int):
    extraction = await get_extraction(document_version_id)
    if extraction is None:
        raise ValueError(f"No extraction checkpoint for version {document_version_id}.")
    return extraction


# async def _classify(document_version_id: int) -> int:
#     await update_document_status(document_version_id, "classifying")
#     extraction = await _load_extraction_or_fail(document_version_id)
#     return document_version_id


async def _classify(document_version_id: int) -> int:
    await update_document_status(document_version_id, "classifying")

    if await has_verified_label(document_version_id):
        return document_version_id # a human already decided; don't overwrite

    extraction = await _load_extraction_or_fail(document_version_id)
    decision = await classify_extraction(extraction)
    await save_classification(document_version_id, decision)
    return document_version_id



#archiving agent reviews the indexed document and saves a proposal for a human.
#Runs LAST, after indexing, so the document is already searchable while Alon works (~1 min).
#Never fails the pipeline and never changes version.status (search needs it to stay 'indexed').
async def _archive_review(document_version_id: int)->int:
    try:
        levels = await get_uploader_clearance(document_version_id)
        result = await run_alon(document_version_id, levels)
        proposal_id = save_alon_result(document_version_id, result)
        logger.info(
            f"[archive_review] version {document_version_id}:proposal {proposal_id}"
            f'{{"pending" if result.proposal else "failed"}} in {result.elapsed_ms / 1000:.1f}s'   
        )
    except Exception:
        logger.exception(f"[archive_review] Alon could not run/save for version {document_version_id}; continuing")

    return document_version_id




async def _chunk(document_version_id: int) -> int:
    await update_document_status(document_version_id, "chunking")
    extraction = await _load_extraction_or_fail(document_version_id)
    doc_meta = await fetch_document_metadata(document_version_id)

    result = await asyncio.to_thread(chunk_document, extraction.full_text, doc_meta)
    if not result.chunks:
        raise ValueError(f"Version {document_version_id} produced 0 chunks.")

    await save_chunks_to_database(document_version_id, result.chunks, result.parents)
    return document_version_id


async def _embed_and_index(document_version_id: int) -> int:
    await update_document_status(document_version_id, "embedding")
    count = await index_chunks_from_database(document_version_id)
    await update_document_status(document_version_id, "indexed")
    logger.info(f"[index] version {document_version_id}: {count} chunks indexed")
    return document_version_id


# ---------- celery tasks (each returns the id for the next stage) ----------

@celery_app.task(name="ingestion.extract", **TASK_OPTIONS)
def extract_task(self, document_version_id: int, file_name: str, file_path: str, force: bool = False):
    return _run_stage(self, "extract", document_version_id,
                      _extract(document_version_id, file_name, file_path, force))


@celery_app.task(name="ingestion.classify", **TASK_OPTIONS)
def classify_task(self, document_version_id: int):
    return _run_stage(self, "classify", document_version_id, _classify(document_version_id))


# @celery_app.task(name="ingestion.extract_metadata", **TASK_OPTIONS)
# def extract_metadata_task(self, document_version_id: int):
#     return _run_stage(self, "extract_metadata", document_version_id,
#                       _extract_metadata(document_version_id))


@celery_app.task(name="ingestion.archive_review", **TASK_OPTIONS)
def archive_review_task(self, document_version_id: int):
    return _run_stage(self, "archive_review", document_version_id,
                      _archive_review(document_version_id))


@celery_app.task(name="ingestion.chunk", **TASK_OPTIONS)
def chunk_task(self, document_version_id: int):
    return _run_stage(self, "chunk", document_version_id, _chunk(document_version_id))


@celery_app.task(name="ingestion.embed_index", **TASK_OPTIONS)
def embed_index_task(self, document_version_id: int):
    return _run_stage(self, "embed_index", document_version_id,
                      _embed_and_index(document_version_id))


# ---------- entry points ----------

def start_ingestion_pipeline(document_version_id: int, file_name: str, file_path: str,
                             force_reextract: bool = False):
    ext = file_name.lower().rsplit(".", 1)[-1] if "." in file_name else ""
    extract_queue = "ocr" if ext in OCR_EXTENSIONS else "default"

    workflow = chain(
        extract_task.s(document_version_id, file_name, file_path, force_reextract).set(queue=extract_queue),
        classify_task.s(),
        # extract_metadata_task.s(),

        chunk_task.s(),
        embed_index_task.s(),
        archive_review_task.s(), #lasty, after the document is searchable.

    )
    return workflow.apply_async()


def reindex_from_checkpoint(document_version_id: int):
    """Re-chunk + re-embed using saved text. No OCR. Use after changing chunker/embeddings."""
    return chain(chunk_task.s(document_version_id), embed_index_task.s()).apply_async()