"""Alon's tools (archiving agent).

Every tool works on ONE document version: the one currently being archived.
The pipeline stage sets `current_archive_version_id` before running Alon, so the LLM
never chooses which document to read. It can't wander into other documents by ID,
and it can't make mistakes about which version it's archiving.

Clearance: tools that look at OTHER documents (similar / duplicates) respect
`current_allowed_clearance`, which the stage sets to the UPLOADER's levels.

Why these tools run on the extraction (not chunks): Alon runs before chunking/embedding,
so the new document only has its OCR text (document_extractions) and file checksum.
"""
import logging
from collections import Counter
from contextvars import ContextVar
from typing import Optional

from langchain.tools import tool
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from api.models.document import DocumentModel, DocumentVersion, DocumentClassifications
from core.dependencies import SessionLocal, deps
from rag.classification.labels import DOC_TYPES, UNKNOWN_LABEL
from rag.classification.text import build_classification_text
from tools.access.permissions import active_clearance_levels
from tools.documents.search import resolve_authorized_version_ids
from tools.analysis.detect_duplicates import (
    check_hash_duplicates,
    check_algorithmic_duplicates,
    check_semantic_duplicates,
)

logger = logging.getLogger(__name__)

# Set by the pipeline stage: the document version Alon is archiving right now
current_archive_version_id: ContextVar[Optional[int]] = ContextVar("current_archive_version_id", default=None)

MAX_PAGES_PER_CALL = 3        # read_pages limit, keeps Groq token usage small
MAX_CHARS_PER_CALL = 6000
LOW_OCR_THRESHOLD = 0.80      # below this, flag the OCR quality as an issue


# ---------------------------------------------------------------- helpers

def _version_id() -> int:
    vid = current_archive_version_id.get()
    if vid is None:
        raise RuntimeError("Alon's tools were called without a document version in context.")
    return vid


async def _load_version(session, version_id: int) -> Optional[DocumentVersion]:
    """Version + its document (with category) + its OCR extraction, in one query."""
    return (await session.execute(
        select(DocumentVersion)
        .where(DocumentVersion.id == version_id)
        .options(
            selectinload(DocumentVersion.document).selectinload(DocumentModel.category),
            selectinload(DocumentVersion.extraction),
        )
    )).scalar_one_or_none()


def _year(d) -> str:
    return str(d.year) if d else "not set"


# ---------------------------------------------------------------- tools

@tool("get_document_overview")
async def get_document_overview() -> str:
    """Get what the USER entered at upload (title, department/order, series year,
    physical shelf location, category, clearance) plus file info and OCR quality
    for the document being archived. Call this FIRST."""
    async with SessionLocal() as session:
        v = await _load_version(session, _version_id())
        if not v or not v.document:
            return "Document version not found."

        d, ex = v.document, v.extraction
        lines = [
            "## What the user entered at upload",
            f"- Title: {d.title}",
            f"- Department / order: {d.department_order}",
            f"- Series year: {_year(d.series_years)}",
            f"- Physical shelf location: {d.physical_shelf_location}",
            f"- Category: {d.category.name if d.category else 'not set'}",
            f"- Clearance: {getattr(d.clearance_level, 'value', d.clearance_level)}",
            "",
            "## File",
            f"- File name: {v.file_name} (version {v.version_number})",
            f"- Document ID: {d.id} | Version ID: {v.id}",
        ]

        if ex:
            score = ex.ocr_score if ex.ocr_score is not None else 1.0
            quality = "LOW, flag as an issue" if score < LOW_OCR_THRESHOLD else "ok"
            lines += [
                "",
                "## Extraction",
                f"- Pages: {ex.page_count} | Characters: {ex.char_count}",
                f"- Scanned: {'yes' if ex.is_scanned else 'no'} | OCR confidence: {score:.2f} ({quality})",
            ]
        else:
            lines += ["", "## Extraction", "- No extracted text found. Flag this as an issue."]

        return "\n".join(lines)


@tool("get_classification")
async def get_classification() -> str:
    """Get the ML classifier's result for this document: the final ensemble label,
    confidence and status (auto_assigned / needs_review / unknown), the top alternatives,
    and how each tier (rules, tfidf, embedding, transformer) voted.
    Also says whether a HUMAN already verified the type (never override that)."""
    vid = _version_id()
    async with SessionLocal() as session:
        rows = (await session.execute(
            select(DocumentClassifications)
            .where(DocumentClassifications.document_version_id == vid)
            .order_by(DocumentClassifications.created_at)
        )).scalars().all()

    if not rows:
        return "The classifier has not produced a result for this document."

    human = next((r for r in rows if r.source == "human"), None)
    if human:
        return (f"HUMAN-VERIFIED type: {human.label}. "
                "Do not propose a different document type; use this one.")

    final = next((r for r in rows if r.source == "ensemble"), None)
    tiers = [r for r in rows if r.source not in ("ensemble", "human")]

    lines = ["## Classifier result"]
    if final:
        top = sorted((final.probabilities or {}).items(), key=lambda kv: kv[1], reverse=True)[:3]
        lines += [
            f"- Final label: {final.label} | confidence {final.confidence:.2f} | status: {final.status}",
            "- Top alternatives: " + (", ".join(f"{k} {p:.2f}" for k, p in top) or "none"),
        ]
    if tiers:
        lines.append("## Votes per tier")
        lines += [f"- {r.source}: {r.label} ({r.confidence:.2f})" for r in tiers]
    return "\n".join(lines)


@tool("read_pages")
async def read_pages(start_page: int = 1, end_page: int = 1) -> str:
    """Read the extracted text of specific pages (1-based, inclusive) of the document
    being archived. Usually page 1 is enough to identify the document type, number,
    date, payee and amount. At most 3 pages per call."""
    async with SessionLocal() as session:
        v = await _load_version(session, _version_id())
    ex = v.extraction if v else None
    if not ex or not ex.pages:
        return "No extracted text is available for this document."

    total = len(ex.pages)
    start = max(1, start_page)
    end = min(total, end_page, start + MAX_PAGES_PER_CALL - 1)
    if start > total:
        return f"The document only has {total} page(s)."

    parts, used = [], 0
    for i in range(start - 1, end):
        text = (ex.pages[i].get("text") or "").strip()
        room = MAX_CHARS_PER_CALL - used
        if room <= 0:
            break
        if len(text) > room:
            text = text[:room] + "\n[...page truncated]"
        used += len(text)
        parts.append(f"--- Page {i + 1} of {total} ---\n{text or '[no text on this page]'}")

    return "\n\n".join(parts)


@tool("list_document_types")
async def list_document_types() -> str:
    """List the document types this office uses. The proposed document type MUST be
    one of these. If none fits, use 'other' and suggest a new type name."""
    return (
        "Allowed document types:\n"
        + "\n".join(f"- {t}" for t in DOC_TYPES)
        + f"\n\n('{UNKNOWN_LABEL}' means the classifier could not decide; never propose it yourself.)"
    )


@tool("find_similar_archived")
async def find_similar_archived(limit: int = 5) -> str:
    """Find already-archived documents that look similar to this one, with their type,
    series year, department and PHYSICAL SHELF LOCATION. Use it to suggest where the paper
    copy should be stored and to check that the type and year are consistent with
    similar records. Only documents the uploader is allowed to see are searched."""
    limit = max(1, min(limit, 10))
    vid = _version_id()

    async with SessionLocal() as session:
        v = await _load_version(session, vid)
        if not v or not v.extraction:
            return "No extracted text, so similar documents cannot be searched."

        # exclude every version of THIS document (e.g. its earlier versions)
        own_version_ids = set((await session.execute(
            select(DocumentVersion.id).where(DocumentVersion.document_id == v.document_id)
        )).scalars().all())

    allowed = [i for i in await resolve_authorized_version_ids(active_clearance_levels())
               if i not in own_version_ids]
    if not allowed:
        return "There are no other archived documents to compare with yet."

    query = build_classification_text(v.extraction.full_text, v.extraction.pages)[:1500]
    try:
        results = await deps.vector_store.asimilarity_search_with_score(
            query=query, k=limit * 4,
            filter={"document_version_id": {"$in": allowed}},
        )
    except Exception:
        logger.exception("[Alon] similar-document search failed (version %s)", vid)
        return "Similar-document search is temporarily unavailable."

    # best similarity per document version (one doc has many chunks)
    best: dict[int, float] = {}
    for doc, distance in results:
        ver_id = doc.metadata.get("document_version_id")
        if ver_id is None:
            continue
        similarity = max(0.0, 1.0 - distance) if distance <= 1.0 else distance
        best[ver_id] = max(best.get(ver_id, 0.0), similarity)

    if not best:
        return "No similar archived documents were found."

    top_ids = sorted(best, key=best.get, reverse=True)[:limit]
    async with SessionLocal() as session:
        versions = (await session.execute(
            select(DocumentVersion)
            .where(DocumentVersion.id.in_(top_ids))
            .options(selectinload(DocumentVersion.document))
        )).scalars().all()
    by_id = {x.id: x for x in versions}

    lines, shelves = ["## Similar archived documents (most similar first)"], Counter()
    for ver_id in top_ids:
        sv = by_id.get(ver_id)
        if not sv or not sv.document:
            continue
        d = sv.document
        lines.append(
            f"- Document #{d.id} \"{d.title}\" | type: {sv.doc_type or 'unknown'} | "
            f"year: {_year(d.series_years)} | dept: {d.department_order} | "
            f"shelf: {d.physical_shelf_location} | similarity {best[ver_id]:.0%}"
        )
        if d.physical_shelf_location:
            shelves[d.physical_shelf_location] += 1

    if shelves:
        lines.append("\n## Shelf locations used by these similar documents")
        lines += [f"- {loc}: {n} document(s)" for loc, n in shelves.most_common()]
    return "\n".join(lines)


@tool("check_duplicates")
async def check_duplicates() -> str:
    """Check whether this document is already archived: exact file match (checksum),
    near-identical text (MinHash / token similarity) and semantic similarity.
    Only documents the uploader is allowed to see are checked."""
    vid = _version_id()
    async with SessionLocal() as session:
        v = await _load_version(session, vid)
    if not v or not v.extraction or not (v.extraction.full_text or "").strip():
        return "No extracted text, so duplicates cannot be checked."

    text, doc_id = v.extraction.full_text, v.document_id
    matches, skipped = [], []

    try:
        matches += await check_hash_duplicates(
            checksum=v.checksum, exclude_version_id=vid, exclude_document_id=doc_id)
        matches += await check_algorithmic_duplicates(
            text=text, threshold=0.85, exclude_document_id=doc_id)
    except Exception:
        logger.exception("[Alon] hash/algorithmic duplicate check failed (version %s)", vid)
        skipped.append("exact/near-identical check")

    # the semantic check swallows its own errors, so verify the embedding service first
    try:
        await deps.vector_store.embeddings.aembed_query("ping")
        matches += await check_semantic_duplicates(
            text=text, threshold=0.90, exclude_document_id=doc_id)
    except Exception:
        logger.warning("[Alon] embedding service unavailable; semantic duplicate check skipped (version %s)", vid)
        skipped.append("semantic check (embedding service unavailable)")

    seen, unique = set(), []
    for m in matches:                      # strongest evidence first (hash > algorithmic > semantic)
        if m.document_id and m.document_id not in seen:
            seen.add(m.document_id)
            unique.append(m)

    note = f"\nNOTE: skipped {', '.join(skipped)}. Report this as an issue." if skipped else ""

    if not unique:
        if skipped:
            return "No duplicates found by the checks that ran, so the result is incomplete." + note
        return "No duplicates found. The document appears to be new to the archive."

    lines = [f"## Possible duplicates ({len(unique)})"]
    lines += [
        f"- Document #{m.document_id} \"{m.document_title}\" ({m.file_name}) | "
        f"{m.match_type} | {m.similarity_score:.0%} | {m.reason}"
        for m in unique
    ]
    return "\n".join(lines) + note


ARCHIVE_TOOLS = [
    get_document_overview,
    get_classification,
    read_pages,
    list_document_types,
    find_similar_archived,
    check_duplicates,
]