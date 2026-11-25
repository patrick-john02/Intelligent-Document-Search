"""Alon's tools & deterministic pre-fetch dossier builder (archiving agent).

Every tool works on ONE document version: the one currently being archived.
The runner sets `current_archive_version_id` before running Alon, so the LLM
never chooses which document to read. It can't wander into other documents by ID,
and it can't make mistakes about which version it's archiving.

Clearance: tools that look at OTHER documents (similar / duplicates) respect
`current_allowed_clearance`, which the runner sets to the UPLOADER's levels.

Hybrid Pre-Fetch + Targeted ReAct design:
- `build_archive_dossier()` pre-fetches the 5 mandatory read-only lookups in Python
  (overview, ML classification votes from TF-IDF & SetFit, initial page text,
  duplicates, and similar archived shelf locations) for 0 LLM tokens.
- `TARGETED_ARCHIVE_TOOLS` exposes only genuine investigative actions (`read_pages`
  and `find_similar_archived`) so Alon invokes tools only when Page 1 or the initial
  similar-document lookup is not enough.
"""
from __future__ import annotations

import logging
from collections import Counter
from contextvars import ContextVar
from dataclasses import dataclass, field
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

# Set by the runner: the document version Alon is archiving right now
current_archive_version_id: ContextVar[Optional[int]] = ContextVar("current_archive_version_id", default=None)

MAX_PAGES_PER_CALL = 3          # read_pages limit, keeps Groq token usage small
MAX_CHARS_PER_CALL = 6000
LOW_OCR_THRESHOLD = 0.80        # below this, flag the OCR quality as an issue
SPARSE_PAGE1_CHARS = 200        # if page 1 has fewer chars than this, also pre-fetch page 2


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


def _format_overview(v: Optional[DocumentVersion]) -> str:
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


def _format_pages(ex, start_page: int = 1, end_page: int = 1) -> str:
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


async def _fetch_classification_data(vid: int) -> dict:
    async with SessionLocal() as session:
        rows = (await session.execute(
            select(DocumentClassifications)
            .where(DocumentClassifications.document_version_id == vid)
            .order_by(DocumentClassifications.created_at)
        )).scalars().all()

    if not rows:
        return {
            "text": "The classifier has not produced a result for this document.",
            "human_verified_label": None,
            "ml_label": None,
            "ml_confidence": 0.0,
            "ml_status": None,
            "tier_votes": [],
        }

    human = next((r for r in rows if r.source == "human"), None)
    if human:
        return {
            "text": (
                f"HUMAN-VERIFIED type: {human.label}. "
                "Do not propose a different document type; use this one."
            ),
            "human_verified_label": human.label,
            "ml_label": human.label,
            "ml_confidence": 1.0,
            "ml_status": "verified",
            "tier_votes": [f"human: {human.label} (1.00)"],
        }

    final = next((r for r in rows if r.source == "ensemble"), None)
    tiers = [r for r in rows if r.source not in ("ensemble", "human")]
    tier_votes = [
        f"{r.source} ({r.model_version}): {r.label} ({r.confidence:.2f})"
        for r in tiers
    ]

    lines = ["## Classifier result"]
    if final:
        top = sorted((final.probabilities or {}).items(), key=lambda kv: kv[1], reverse=True)[:3]
        lines += [
            f"- Final label: {final.label} | confidence {final.confidence:.2f} | status: {final.status}",
            "- Top alternatives: " + (", ".join(f"{k} {p:.2f}" for k, p in top) or "none"),
        ]
    if tier_votes:
        lines.append("## Votes per tier")
        lines += [f"- {vote}" for vote in tier_votes]

    return {
        "text": "\n".join(lines),
        "human_verified_label": None,
        "ml_label": final.label if final else None,
        "ml_confidence": float(final.confidence) if final else 0.0,
        "ml_status": final.status if final else None,
        "tier_votes": tier_votes,
    }


async def _fetch_similar_archived_data(vid: int, v: Optional[DocumentVersion], limit: int = 5) -> dict:
    limit = max(1, min(limit, 10))
    if not v or not v.extraction:
        return {
            "text": "No extracted text, so similar documents cannot be searched.",
            "top_shelf_location": None,
            "top_shelf_count": 0,
        }

    async with SessionLocal() as session:
        own_version_ids = set((await session.execute(
            select(DocumentVersion.id).where(DocumentVersion.document_id == v.document_id)
        )).scalars().all())

    allowed = [i for i in await resolve_authorized_version_ids(active_clearance_levels())
               if i not in own_version_ids]
    if not allowed:
        return {
            "text": "There are no other archived documents to compare with yet.",
            "top_shelf_location": None,
            "top_shelf_count": 0,
        }

    query = build_classification_text(v.extraction.full_text, v.extraction.pages)[:1500]
    try:
        results = await deps.vector_store.asimilarity_search_with_score(
            query=query, k=limit * 4,
            filter={"document_version_id": {"$in": allowed}},
        )
    except Exception:
        logger.exception("[Alon] similar-document search failed (version %s)", vid)
        return {
            "text": "Similar-document search is temporarily unavailable.",
            "top_shelf_location": None,
            "top_shelf_count": 0,
        }

    best: dict[int, float] = {}
    for doc, distance in results:
        ver_id = doc.metadata.get("document_version_id")
        if ver_id is None:
            continue
        similarity = max(0.0, 1.0 - distance) if distance <= 1.0 else distance
        best[ver_id] = max(best.get(ver_id, 0.0), similarity)

    if not best:
        return {
            "text": "No similar archived documents were found.",
            "top_shelf_location": None,
            "top_shelf_count": 0,
        }

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

    top_shelf_location, top_shelf_count = None, 0
    if shelves:
        top_shelf_location, top_shelf_count = shelves.most_common(1)[0]
        lines.append("\n## Shelf locations used by these similar documents")
        lines += [f"- {loc}: {n} document(s)" for loc, n in shelves.most_common()]

    return {
        "text": "\n".join(lines),
        "top_shelf_location": top_shelf_location,
        "top_shelf_count": top_shelf_count,
    }


async def _fetch_duplicates_data(vid: int, v: Optional[DocumentVersion]) -> dict:
    if not v or not v.extraction or not (v.extraction.full_text or "").strip():
        return {
            "text": "No extracted text, so duplicates cannot be checked.",
            "duplicates": [],
            "skipped": ["duplicate check (no extracted text)"],
        }

    text, doc_id = v.extraction.full_text, v.document_id
    matches, skipped = [], []

    try:
        matches += await check_hash_duplicates(
            checksum=v.checksum, exclude_version_id=vid, exclude_document_id=doc_id)
        matches += await check_algorithmic_duplicates(
            text=text, threshold=0.85, exclude_document_id=doc_id)
    except Exception:
        logger.exception("[Alon] hash/algorithmic duplicate check failed (version %s)", vid)
        skipped.append("exact/near-identical duplicate check")

    # the semantic check swallows its own errors, so verify the embedding service first
    try:
        await deps.vector_store.embeddings.aembed_query("ping")
        matches += await check_semantic_duplicates(
            text=text, threshold=0.90, exclude_document_id=doc_id)
    except Exception:
        logger.warning("[Alon] embedding service unavailable; semantic duplicate check skipped (version %s)", vid)
        skipped.append("semantic duplicate check (embedding service unavailable)")

    seen, unique = set(), []
    for m in matches:                      # strongest evidence first (hash > algorithmic > semantic)
        if m.document_id and m.document_id not in seen:
            seen.add(m.document_id)
            unique.append(m)

    duplicates = [
        {
            "document_id": int(m.document_id),
            "title": str(m.document_title or m.file_name or f"Document #{m.document_id}"),
            "match_type": str(m.match_type),
            "similarity": max(0.0, min(1.0, float(m.similarity_score))),
        }
        for m in unique
    ]

    note = f"\nNOTE: skipped {', '.join(skipped)}. Report this as an issue." if skipped else ""
    if not unique:
        if skipped:
            msg = "No duplicates found by the checks that ran, so the result is incomplete." + note
        else:
            msg = "No duplicates found. The document appears to be new to the archive."
        return {"text": msg, "duplicates": [], "skipped": skipped}

    lines = [f"## Possible duplicates ({len(unique)})"]
    lines += [
        f"- Document #{m.document_id} \"{m.document_title}\" ({m.file_name}) | "
        f"{m.match_type} | {m.similarity_score:.0%} | {m.reason}"
        for m in unique
    ]
    return {"text": "\n".join(lines) + note, "duplicates": duplicates, "skipped": skipped}


# ---------------------------------------------------------------- pre-fetch dossier

@dataclass
class ArchiveDossier:
    """All deterministic evidence gathered for one document version before Alon runs."""
    document_version_id: int
    overview_text: str
    classification_text: str
    initial_pages_text: str
    duplicates_text: str
    similar_text: str

    upload_title: str = ""
    upload_department_order: Optional[str] = None
    upload_series_year: Optional[int] = None
    upload_shelf_location: Optional[str] = None
    file_name: str = ""

    has_extraction: bool = False
    ocr_score: Optional[float] = None
    page_count: int = 0
    pages_prefetched: int = 0

    human_verified_label: Optional[str] = None
    ml_label: Optional[str] = None
    ml_confidence: float = 0.0
    ml_status: Optional[str] = None
    ml_tier_votes: list[str] = field(default_factory=list)

    duplicates: list[dict] = field(default_factory=list)
    skipped_checks: list[str] = field(default_factory=list)
    top_shelf_location: Optional[str] = None
    top_shelf_count: int = 0

    def to_prompt_text(self) -> str:
        allowed = ", ".join(DOC_TYPES)
        more_pages_note = (
            f"Only page(s) 1..{self.pages_prefetched} of {self.page_count} are shown below. "
            "Call `read_pages` ONLY if these pages are not enough to identify the document or key fields."
            if self.page_count > self.pages_prefetched
            else f"All {self.page_count} page(s) are already shown below; do not call `read_pages`."
        )
        return "\n\n".join([
            f"# Archive Review Dossier (Document Version {self.document_version_id})",
            f"Allowed document types: {allowed} (never propose '{UNKNOWN_LABEL}').",
            self.overview_text,
            self.classification_text,
            self.duplicates_text,
            self.similar_text,
            f"## Extracted Pages\n{more_pages_note}\n\n{self.initial_pages_text}",
        ])


async def build_archive_dossier(version_id: int) -> ArchiveDossier:
    """Pre-fetch all mandatory archiving evidence in Python (0 LLM tokens)."""
    async with SessionLocal() as session:
        v = await _load_version(session, version_id)

    overview_text = _format_overview(v)
    cls_data = await _fetch_classification_data(version_id)
    dup_data = await _fetch_duplicates_data(version_id, v)
    sim_data = await _fetch_similar_archived_data(version_id, v, limit=5)

    ex = v.extraction if v else None
    page_count = len(ex.pages) if (ex and ex.pages) else 0
    pages_to_include = 0
    if page_count >= 1:
        page1_len = len((ex.pages[0].get("text") or "").strip())
        pages_to_include = 2 if (page_count > 1 and page1_len < SPARSE_PAGE1_CHARS) else 1
    initial_pages_text = _format_pages(ex, start_page=1, end_page=max(1, pages_to_include))

    d = v.document if v else None
    return ArchiveDossier(
        document_version_id=version_id,
        overview_text=overview_text,
        classification_text=cls_data["text"],
        initial_pages_text=initial_pages_text,
        duplicates_text=dup_data["text"],
        similar_text=sim_data["text"],
        upload_title=(d.title if d and d.title else ""),
        upload_department_order=(d.department_order if d else None),
        upload_series_year=(d.series_years.year if d and d.series_years else None),
        upload_shelf_location=(d.physical_shelf_location if d else None),
        file_name=(v.file_name if v else ""),
        has_extraction=bool(ex and (ex.full_text or "").strip()),
        ocr_score=(float(ex.ocr_score) if ex and ex.ocr_score is not None else (1.0 if ex else None)),
        page_count=page_count,
        pages_prefetched=pages_to_include,
        human_verified_label=cls_data["human_verified_label"],
        ml_label=cls_data["ml_label"],
        ml_confidence=cls_data["ml_confidence"],
        ml_status=cls_data["ml_status"],
        ml_tier_votes=cls_data["tier_votes"],
        duplicates=dup_data["duplicates"],
        skipped_checks=dup_data["skipped"],
        top_shelf_location=sim_data["top_shelf_location"],
        top_shelf_count=sim_data["top_shelf_count"],
    )


# ---------------------------------------------------------------- tools

@tool("get_document_overview")
async def get_document_overview() -> str:
    """Get what the USER entered at upload (title, department/order, series year,
    physical shelf location, category, clearance) plus file info and OCR quality
    for the document being archived."""
    async with SessionLocal() as session:
        v = await _load_version(session, _version_id())
        return _format_overview(v)


@tool("get_classification")
async def get_classification() -> str:
    """Get the ML classifier's result for this document: the final ensemble label,
    confidence and status (auto_assigned / needs_review / unknown), the top alternatives,
    and how each tier (rules, tfidf, setfit, embedding, transformer) voted.
    Also says whether a HUMAN already verified the type (never override that)."""
    data = await _fetch_classification_data(_version_id())
    return data["text"]


@tool("read_pages")
async def read_pages(start_page: int = 1, end_page: int = 1) -> str:
    """Read additional extracted pages (1-based, inclusive) of the document being archived.
    Call this ONLY when the pre-fetched page(s) in the dossier are a cover sheet, blank,
    or do not clearly identify the document type and key fields. At most 3 pages per call."""
    async with SessionLocal() as session:
        v = await _load_version(session, _version_id())
    return _format_pages(v.extraction if v else None, start_page=start_page, end_page=end_page)


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
async def find_similar_archived(limit: int = 10) -> str:
    """Search more already-archived documents (up to 10) to find physical shelf locations
    and check consistency. Call this ONLY if the pre-fetched top 5 similar documents in the
    dossier did not provide enough shelf-location evidence."""
    vid = _version_id()
    async with SessionLocal() as session:
        v = await _load_version(session, vid)
    data = await _fetch_similar_archived_data(vid, v, limit=limit)
    return data["text"]


@tool("check_duplicates")
async def check_duplicates() -> str:
    """Check whether this document is already archived: exact file match (checksum),
    near-identical text (MinHash / token similarity) and semantic similarity.
    Only documents the uploader is allowed to see are checked."""
    vid = _version_id()
    async with SessionLocal() as session:
        v = await _load_version(session, vid)
    data = await _fetch_duplicates_data(vid, v)
    return data["text"]


# Investigative tools only (used by Alon's Targeted ReAct agent after Python pre-fetch)
TARGETED_ARCHIVE_TOOLS = [
    read_pages,
    find_similar_archived,
]

# Full tool list kept for backwards compatibility / debugging
ARCHIVE_TOOLS = [
    get_document_overview,
    get_classification,
    read_pages,
    list_document_types,
    find_similar_archived,
    check_duplicates,
]
