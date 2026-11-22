"""Researcher-facing search tools.

- search_documents : excerpt search (thin wrapper over the hybrid engine; behaviour unchanged)
- find_documents   : document-level search - one row per document with its best excerpt and pages hit
- lookup_reference : exact reference-number lookup (DV/OBR/PR/PO/JEV numbers, "AO No. 14", account codes)

The retrieval engine (clearance scoping, dense + lexical, RRF, reranking) stays in
tools/documents/search.py. This module only shapes results for the agent.
"""
from __future__ import annotations

import logging
import re
from typing import Any, Optional

from langchain.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy import text

from core.dependencies import SessionLocal
from tools.access.permissions import current_allowed_clearance, get_user_clearance_levels
from tools.analysis.fetch import UNVERIFIED_NOTE
from tools.documents.search import (
    current_user_context,
    get_unverified_version_ids,
    normalize_doc_type,
    resolve_authorized_version_ids,
    search_document_tool,
    search_documents as hybrid_search,
)

logger = logging.getLogger(__name__)


# ============================================================================
# 1. search_documents - thin wrapper
# ============================================================================
# Same tool name and schema the agent already knows; the engine is unchanged.
search_documents = search_document_tool


# ============================================================================
# shared helpers
# ============================================================================

FIND_CANDIDATES = 30        # chunks pulled before grouping (capped by RERANKER_CANDIDATE_POOL)
MAX_DOCS = 20
SNIPPET_CHARS = 300
LOOKUP_MAX_ROWS = 200

DOC_TYPE_HELP = (
    "Optional document type filter. One of: clearance, disbursement_voucher, obligation_request, "
    "budget_utilization_request, purchase_request, purchase_order, payroll, liquidation_report, "
    "official_receipt, journal_entry_voucher, other. Use only when the user names a type."
)


def _version_id(item: dict) -> int | None:
    try:
        return int(item.get("document_version_id"))
    except (TypeError, ValueError):
        return None


def _page(item: dict) -> int | None:
    try:
        return int(item.get("page_number"))
    except (TypeError, ValueError):
        return None


def _score(item: dict) -> float:
    try:
        return float(item.get("rerank_score", item.get("relevance_score", 0.0)))
    except (TypeError, ValueError):
        return 0.0


def _flatten(content: str | None) -> str:
    return " ".join((content or "").split())


def _snippet(content: str, span: tuple[int, int] | None = None) -> str:
    """Short excerpt; centred on `span` when given (content must already be flattened)."""
    if span is None:
        return content[:SNIPPET_CHARS] + ("…" if len(content) > SNIPPET_CHARS else "")
    start, end = span
    pad = max(40, (SNIPPET_CHARS - (end - start)) // 2)
    a, b = max(0, start - pad), min(len(content), end + pad)
    return ("…" if a > 0 else "") + content[a:b] + ("…" if b < len(content) else "")


def _effective_clearances() -> list[str]:
    """Same resolution order as the hybrid engine: request context -> user -> public."""
    levels = current_allowed_clearance.get()
    if not levels:
        levels = get_user_clearance_levels(current_user_context.get())
    return levels or ["public"]


async def _fetch_version_info(version_ids: list[int]) -> dict[int, dict[str, Any]]:
    """Document-level facts from the DB (chunk metadata can be stale, e.g. doc_type)."""
    if not version_ids:
        return {}
    sql = text("""
        SELECT dv.id AS version_id, dv.document_id, dv.file_name, dv.version_number,
               dv.is_current, dv.doc_type, dv.classification_status,
               d.title, d.series_years
        FROM document_version dv
        JOIN documents d ON d.id = dv.document_id
        WHERE dv.id = ANY(:ids)
    """)
    try:
        async with SessionLocal() as session:
            rows = (await session.execute(sql, {"ids": version_ids})).mappings().all()
        return {r["version_id"]: dict(r) for r in rows}
    except Exception as e:
        logger.warning(f"[Researcher] could not load version info: {e}")
        return {}


def _doc_header(idx: int, info: dict[str, Any], fallback_file: str | None) -> str:
    title = info.get("title") or fallback_file or "Untitled"
    year = info["series_years"].year if info.get("series_years") else "n/a"
    status = "Current" if info.get("is_current", True) else "Historical"
    doc_type = info.get("doc_type") or "unknown"
    if info.get("classification_status") == "needs_review":
        doc_type += " (unconfirmed)"
    return (
        f"[{idx}] Document #{info.get('document_id')}: {title}\n"
        f"    File: {info.get('file_name') or fallback_file or 'n/a'} | Type: {doc_type} | "
        f"Year: {year} | v{info.get('version_number', 1)} ({status})"
    )


def _pages_text(pages: set[int]) -> str:
    return ", ".join(str(p) for p in sorted(pages)) if pages else "n/a"


# ============================================================================
# 2. find_documents - one row per document
# ============================================================================

class FindDocumentsInput(BaseModel):
    query: str = Field(
        description="What the documents are about, e.g. 'travel order of Juan Dela Cruz' or "
                    "'liquidation of cash advance for the 2025 seminar'."
    )
    doc_type: Optional[str] = Field(default=None, description=DOC_TYPE_HELP)
    year: Optional[int] = Field(default=None, description="Optional 4-digit year. Use only when the user names a year.")
    document_ids: Optional[list[int]] = Field(default=None, description="Optional list of document IDs to search within.")
    include_historical: bool = Field(default=False, description="Also include older versions. Default False.")
    limit: int = Field(default=10, description="Maximum documents to return (1-20). Default 10.")


@tool(
    "find_documents",
    description=(
        "Find WHICH documents match a topic, person, office or purpose. Returns one row per document "
        "(ID, title, type, year, version, pages that matched, best excerpt). Use this for 'find/list "
        "documents about...' requests. Use search_documents instead when you need the passages that "
        "answer a specific question, and lookup_reference for an exact reference number."
    ),
    args_schema=FindDocumentsInput,
    response_format="content_and_artifact",
)
async def find_documents_tool(
    query: str,
    doc_type: Optional[str] = None,
    year: Optional[int] = None,
    document_ids: Optional[list[int]] = None,
    include_historical: bool = False,
    limit: int = 10,
) -> tuple[str, list[dict]]:
    limit = max(1, min(int(limit or 10), MAX_DOCS))

    hits = await hybrid_search(
        query=query,
        top_k=FIND_CANDIDATES,
        include_historical=include_historical,
        document_ids=document_ids,
        doc_type=doc_type,
        year=year,
        expand_parents=False,           # snippets only; keeps the agent's context small
    )
    if not hits:
        return f"No documents found for '{query}'.", []

    # Group chunks by version. Hits arrive best-first, so the first hit's position is the
    # document's rank (safer than comparing scores, which can mix rerank and RRF scales).
    groups: dict[int, dict[str, Any]] = {}
    for rank, item in enumerate(hits):
        vid = _version_id(item)
        if vid is None or item.get("document_id") is None:
            continue
        g = groups.get(vid)
        if g is None:
            g = groups[vid] = {
                "version_id": vid,
                "document_id": item.get("document_id"),
                "file_name": item.get("file_name"),
                "rank": rank,
                "best": item,
                "pages": set(),
                "hits": 0,
            }
        g["hits"] += 1
        if (p := _page(item)) is not None:
            g["pages"].add(p)

    ranked = sorted(groups.values(), key=lambda g: g["rank"])[:limit]
    version_ids = [g["version_id"] for g in ranked]
    info = await _fetch_version_info(version_ids)
    unverified = await get_unverified_version_ids(version_ids)

    lines, sources = [], []
    for idx, g in enumerate(ranked, 1):
        meta = info.get(g["version_id"], {"document_id": g["document_id"]})
        best = g["best"]
        best_page = _page(best)
        warning = f"    {UNVERIFIED_NOTE}\n" if g["version_id"] in unverified else ""
        lines.append(
            _doc_header(idx, meta, g["file_name"]) + "\n"
            f"    Matching excerpts: {g['hits']} | Pages: {_pages_text(g['pages'])} | Score: {_score(best):.3f}\n"
            f"{warning}"
            f"    Best match{f' (p. {best_page})' if best_page else ''}: {_snippet(_flatten(best.get('content')))}"
        )
        sources.append({
            "document_id": meta.get("document_id", g["document_id"]),
            "document_version_id": g["version_id"],
            "file_name": meta.get("file_name") or g["file_name"],
            "page_number": best_page,
            "chunk_id": best.get("chunk_id"),
            "score": _score(best),
        })

    header = f"Found {len(ranked)} document(s) for '{query}':\n\n"
    return header + "\n\n".join(lines), sources


# ============================================================================
# 3. lookup_reference - exact reference numbers
# ============================================================================

# Separators people and OCR put inside codes: space, dash, underscore, slash, dot.
_SEP_PY = r"[\s_/.\-]*"
_SEP_PG = r"[[:space:]_/.-]*"

# Pulls code-like tokens out of free text: "DV-2026-00128", "AO No. 14", "OBR #2025-01-0045",
# "1011-02-03". Prefix words below are ordinary words, not code prefixes.
_CODE_RE = re.compile(
    r"\b([A-Za-z]{1,8})\.?(?:[\s_/\-]*no\.?)?[\s_/\-#]*(\d[\w/\-.]*)"
    r"|\b(\d{2,}(?:[-/.]\d+)+)\b",
    re.I,
)
_NOT_PREFIXES = {
    "page", "pages", "p", "pp", "year", "of", "the", "and", "for", "in", "on", "no",
    "section", "sec", "version", "v", "top", "limit", "id",
}


def extract_reference_codes(raw: str) -> list[str]:
    """Code-like tokens in `raw`. A bare single token with a digit (e.g. '004512') is kept as-is;
    plain text with no code returns []."""
    codes: list[str] = []
    for m in _CODE_RE.finditer(raw):
        if m.group(3):
            codes.append(m.group(3))
        elif m.group(1).lower() not in _NOT_PREFIXES:
            codes.append(m.group(0).rstrip(".-/"))
    if not codes:
        token = raw.strip()
        if token and " " not in token and any(c.isdigit() for c in token):
            codes.append(token)
    return list(dict.fromkeys(codes))[:3]


def _code_body(code: str, sep: str, no_part: str) -> str | None:
    """Regex body tolerant to separators, an optional 'No.' and dropped leading zeros."""
    groups = [g for g in re.findall(r"[A-Za-z]+|\d+", code) if g.lower() != "no"]
    if not any(g.isdigit() for g in groups):
        return None                                   # not a reference number
    if len(groups) == 1 and len(groups[0]) < 3:
        return None                                   # "14" alone would match everything
    pieces = ["0*" + (g.lstrip("0") or "0") if g.isdigit() else g for g in groups]
    return (sep + no_part).join(pieces)


def build_reference_patterns(codes: list[str]) -> tuple[str, str] | None:
    """(postgres_regex, python_regex) matching any of the codes as a whole token, case-insensitive."""
    py_no = rf"(?:no\.?{_SEP_PY})?"
    pg_no = rf"(?:no[.]?{_SEP_PG})?"
    py_bodies = [b for c in codes if (b := _code_body(c, _SEP_PY, py_no))]
    pg_bodies = [b for c in codes if (b := _code_body(c, _SEP_PG, pg_no))]
    if not py_bodies:
        return None
    py = rf"(?<![A-Za-z0-9])(?:{'|'.join(py_bodies)})(?![A-Za-z0-9])"
    pg = rf"(^|[^[:alnum:]])(?:{'|'.join(pg_bodies)})([^[:alnum:]]|$)"
    return pg, py


class LookupReferenceInput(BaseModel):
    reference: str = Field(
        description="The reference number exactly as the user gave it, e.g. 'DV-2026-00128', "
                    "'AO No. 14', 'OBR 2025-01-0045', '1011-02-03'. Extra words are ignored."
    )
    doc_type: Optional[str] = Field(default=None, description=DOC_TYPE_HELP)
    include_historical: bool = Field(default=False, description="Also include older versions. Default False.")
    limit: int = Field(default=10, description="Maximum documents to return (1-20). Default 10.")


@tool(
    "lookup_reference",
    description=(
        "Exact lookup of a reference number (voucher/OBR/PR/PO/JEV numbers, 'AO No. 14', account codes) "
        "in document titles, file names and text. Tolerates different separators, 'No.' and dropped "
        "leading zeros. Use this FIRST whenever the user gives a reference number."
    ),
    args_schema=LookupReferenceInput,
    response_format="content_and_artifact",
)
async def lookup_reference_tool(
    reference: str,
    doc_type: Optional[str] = None,
    include_historical: bool = False,
    limit: int = 10,
) -> tuple[str, list[dict]]:
    limit = max(1, min(int(limit or 10), MAX_DOCS))
    codes = extract_reference_codes(reference)
    patterns = build_reference_patterns(codes)
    if patterns is None:
        return (f"'{reference}' does not look like a reference number. "
                "Use find_documents or search_documents instead."), []
    pg_pattern, py_pattern = patterns
    py_re = re.compile(py_pattern, re.I)

    version_ids = await resolve_authorized_version_ids(
        allowed_clearance_levels=_effective_clearances(),
        include_historical=include_historical,
        doc_type=normalize_doc_type(doc_type),
    )
    if not version_ids:
        return f"No documents found for reference {', '.join(codes)}.", []

    title_sql = text("""
        SELECT dv.id AS version_id
        FROM document_version dv
        JOIN documents d ON d.id = dv.document_id
        WHERE dv.id = ANY(:ids)
          AND (d.title ~* :pattern OR dv.file_name ~* :pattern)
    """)
    chunk_sql = text("""
        SELECT dc.document_version_id AS version_id, dc.page_number, dc.chunk_index,
               dc.content, dc.metadata AS chunk_metadata
        FROM document_chunks dc
        WHERE dc.document_version_id = ANY(:ids)
          AND dc.content ~* :pattern
        ORDER BY dc.document_version_id, dc.chunk_index
        LIMIT :max_rows
    """)
    params = {"ids": version_ids, "pattern": pg_pattern, "max_rows": LOOKUP_MAX_ROWS}
    try:
        async with SessionLocal() as session:
            title_hits = {r[0] for r in (await session.execute(title_sql, params)).fetchall()}
            chunk_rows = (await session.execute(chunk_sql, params)).mappings().all()
    except Exception as e:
        logger.warning(f"[Researcher] lookup_reference query failed: {e}")
        return "The reference lookup failed. Try search_documents with the same reference.", []

    groups: dict[int, dict[str, Any]] = {
        vid: {"version_id": vid, "title_hit": True, "pages": set(), "hits": 0, "snippet": None,
              "snippet_page": None, "chunk_id": None}
        for vid in title_hits
    }
    for row in chunk_rows:
        vid = row["version_id"]
        g = groups.setdefault(vid, {"version_id": vid, "title_hit": False, "pages": set(), "hits": 0,
                                    "snippet": None, "snippet_page": None, "chunk_id": None})
        g["hits"] += 1
        if row["page_number"] is not None:
            g["pages"].add(int(row["page_number"]))
        if g["snippet"] is None:
            flat = _flatten(row["content"])
            m = py_re.search(flat)
            g["snippet"] = _snippet(flat, m.span() if m else None)
            g["snippet_page"] = row["page_number"]
            g["chunk_id"] = (row["chunk_metadata"] or {}).get("chunk_id")

    if not groups:
        return (f"No document contains reference {', '.join(codes)}. OCR may have misread the digits "
                "on scanned pages; try search_documents or find_documents with the reference and topic."), []

    # Title/file-name matches first, then the most text matches.
    ranked = sorted(groups.values(), key=lambda g: (not g["title_hit"], -g["hits"]))[:limit]
    ids = [g["version_id"] for g in ranked]
    info = await _fetch_version_info(ids)
    unverified = await get_unverified_version_ids(ids)

    lines, sources = [], []
    for idx, g in enumerate(ranked, 1):
        meta = info.get(g["version_id"], {})
        where = []
        if g["title_hit"]:
            where.append("title/file name")
        if g["hits"]:
            where.append(f"text, pages {_pages_text(g['pages'])}")
        parts = [_doc_header(idx, meta, None), f"    Found in: {'; '.join(where)}"]
        if g["version_id"] in unverified:
            parts.append(f"    {UNVERIFIED_NOTE}")
        if g["snippet"]:
            page_txt = f" (p. {g['snippet_page']})" if g["snippet_page"] is not None else ""
            parts.append(f"    Match{page_txt}: {g['snippet']}")
        lines.append("\n".join(parts))
        sources.append({
            "document_id": meta.get("document_id"),
            "document_version_id": g["version_id"],
            "file_name": meta.get("file_name"),
            "page_number": g["snippet_page"],
            "chunk_id": g["chunk_id"],
            "score": 1.0,
        })

    header = f"Reference {', '.join(codes)}: {len(ranked)} document(s).\n\n"
    return header + "\n\n".join(lines), sources


RESEARCH_SEARCH_TOOLS = [search_documents, find_documents_tool, lookup_reference_tool]
