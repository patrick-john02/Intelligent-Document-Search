import asyncio
import logging
import re
from contextvars import ContextVar
from typing import Optional, List, Dict, Any
from sqlalchemy import text
from core.dependencies import deps, SessionLocal
from langchain.tools import tool
from pydantic import BaseModel, Field
from tools.analysis.fetch import resolve_document_content

from api.models.users import Users
from api.models.enums.docs import ClearanceLevel, get_subordinate_clearance_levels
from tools.access.permissions import get_user_clearance_levels
from core.configurations import app_settings
from rag.reranker import reranker

logger = logging.getLogger(__name__)

# Request-scoped context variables for pre-retrieval authorization
current_user_context: ContextVar[Optional[Users]] = ContextVar("current_user_context", default=None)
current_allowed_clearance: ContextVar[Optional[List[str]]] = ContextVar("current_allowed_clearance", default=None)


# ============================================================================
# 1. PRE-RETRIEVAL AUTHORIZATION & VERSION SCOPE RESOLVER
# Security & version filtering happens strictly BEFORE retrieval results reach
# the candidate generation stage, RRF, reranker, or agents.
#
# Rules enforced in PostgreSQL:
# 1. clearance_level <= user's clearance (hierarchical: public < internal < confidential < secret < top_secret)
# 2. is_deleted = false (documents must be active)
# 3. status = 'indexed' (document version must be successfully indexed)
# 4. is_current = true (prevents historical version pollution; only disabled if include_historical=True)
# ============================================================================

async def resolve_authorized_version_ids(
    allowed_clearance_levels: list[str],
    include_historical: bool = False,
    document_ids: Optional[List[int]] = None,
) -> list[int]:
    """
    Resolves the exact set of authorized document_version IDs before any retrieval occurs.
    If the user lacks authorization or no versions match, returns an empty list, immediately
    blocking any downstream search.
    """
    normalized_levels = [lvl.lower() for lvl in allowed_clearance_levels]

    sql = """
        SELECT dv.id
        FROM document_version dv
        JOIN documents d ON dv.document_id = d.id
        WHERE d.is_deleted = false
          AND dv.status = 'indexed'
          AND lower(d.clearance_level::text) = ANY(:levels)
          AND (:include_historical = true OR dv.is_current = true)
    """
    params: dict[str, Any] = {
        "levels": normalized_levels,
        "include_historical": include_historical,
    }

    if document_ids:
        sql += " AND d.id = ANY(:doc_ids)"
        params["doc_ids"] = document_ids

    try:
        async with SessionLocal() as session:
            result = await session.execute(text(sql), params)
            return [row[0] for row in result.fetchall()]
    except Exception as e:
        logger.error(f"[PreRetrievalAuth] Error resolving authorized version scope: {e}")
        return []


# ============================================================================
# 2. LEXICAL RETRIEVAL (PostgreSQL Full-Text Search + Trigram Code Matching)
# Receives the pre-retrieval authorization scope (:authorized_version_ids).
# ============================================================================

async def search_lexical_chunks(
    query: str,
    top_k: int = 10,
    authorized_version_ids: Optional[List[int]] = None,
) -> list[dict[str, Any]]:
    """
    Performs fast lexical retrieval combining:
    1. ts_rank for natural language keyword matching (PostgreSQL FTS)
    2. ILIKE / Trigram matching for exact codes (e.g. DV-2026-00128, AO No. 14, 1011-02-03)
    Scoped strictly to pre-authorized version IDs.
    """
    clean_query = query.strip()
    if not clean_query or not authorized_version_ids:
        return []

    # Check if query contains an alphanumeric identifier pattern (e.g. DV-2026-00128, AO No. 14)
    has_code_pattern = bool(re.search(r"[A-Za-z0-9]+[-_/\s]?[0-9]+", clean_query))

    sql = """
        SELECT 
            dc.id,
            dc.content,
            dc.chunk_index,
            dc.page_number,
            dc.parent_chunk_id,
            dc.metadata as chunk_metadata,
            ts_rank(dc.search_vector, plainto_tsquery('english', :query)) as fts_rank,
            dv.version_number,
            dv.is_current,
            d.clearance_level::text as clearance_level
        FROM document_chunks dc
        JOIN document_version dv ON dc.document_version_id = dv.id
        JOIN documents d ON dv.document_id = d.id
        WHERE dc.document_version_id = ANY(:version_ids)
          AND (
              dc.search_vector @@ plainto_tsquery('english', :query)
              OR (:has_code AND dc.content ILIKE :code_query)
          )
        ORDER BY fts_rank DESC
        LIMIT :limit
    """

    params: dict[str, Any] = {
        "query": clean_query,
        "has_code": has_code_pattern,
        "code_query": f"%{clean_query}%",
        "version_ids": authorized_version_ids,
        "limit": top_k,
    }

    try:
        async with SessionLocal() as session:
            result = await session.execute(text(sql), params)
            rows = result.mappings().all()

        formatted = []
        for r in rows:
            meta = r["chunk_metadata"] or {}
            formatted.append({
                "content": r["content"],
                "document_id": meta.get("document_id"),
                "document_version_id": meta.get("document_version_id"),
                "version_number": r.get("version_number") or meta.get("version_number", 1),
                "is_current": bool(r.get("is_current", True)),
                "chunk_id": str(meta.get("chunk_id", r["id"])),
                "file_name": meta.get("file_name", "Unknown"),
                "clearance_level": r.get("clearance_level") or meta.get("clearance_level", "public"),
                "page_number": r["page_number"] or meta.get("page_number"),
                "section_title": meta.get("section_title", ""),
                "chunk_type": meta.get("chunk_type", "paragraph"),
                "parent_chunk_id": r.get("parent_chunk_id") or meta.get("parent_chunk_id"),
                "lexical_score": float(r["fts_rank"] or 0.0),
            })
        return formatted
    except Exception as e:
        logger.warning(f"[LexicalSearch] Warning during lexical query: {e}")
        return []


# ============================================================================
# 3. RECIPROCAL RANK FUSION (RRF)
# ============================================================================

def reciprocal_rank_fusion(
    vector_results: list[dict[str, Any]],
    lexical_results: list[dict[str, Any]],
    k: int = 60,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """
    Standard Reciprocal Rank Fusion (RRF) algorithm:
    RRF_score(d) = sum(1 / (k + rank_i))
    Fuses dense vector results and sparse lexical results without requiring score calibration.
    Operates strictly over pre-authorized candidate sets.
    """
    rrf_scores: dict[str, float] = {}
    doc_lookup: dict[str, dict[str, Any]] = {}

    # Rank 1: Dense Vector Results
    for rank, doc in enumerate(vector_results, start=1):
        doc_key = f"{doc.get('document_version_id')}_{doc.get('chunk_id')}"
        doc_lookup[doc_key] = doc
        rrf_scores[doc_key] = rrf_scores.get(doc_key, 0.0) + (1.0 / (k + rank))

    # Rank 2: Lexical Results
    for rank, doc in enumerate(lexical_results, start=1):
        doc_key = f"{doc.get('document_version_id')}_{doc.get('chunk_id')}"
        if doc_key not in doc_lookup:
            doc_lookup[doc_key] = doc
        rrf_scores[doc_key] = rrf_scores.get(doc_key, 0.0) + (1.0 / (k + rank))

    # Sort merged documents by fused RRF score
    sorted_keys = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)

    fused_results = []
    for key in sorted_keys[:top_k]:
        item = doc_lookup[key].copy()
        item["relevance_score"] = float(rrf_scores[key])
        fused_results.append(item)

    return fused_results


# ============================================================================
# 4. HYBRID DOCUMENT SEARCH (Dense + Lexical + RRF + Reranker)
# ============================================================================

async def search_documents(
    query: str,
    top_k: int = 5,
    allowed_clearance_level: Optional[List[str]] = None,
    include_historical: bool = False,
    document_ids: Optional[List[int]] = None,
    expand_parents: bool = False,
    user: Optional[Users] = None,
) -> list[dict[str, Any]]:
    """
    Two-Stage Hybrid Search with Pre-Retrieval Authorization & Version Filtering:
    1. Pre-Retrieval Authorization Scope:
       - Resolves user's allowed clearance levels (e.g. SECRET -> [public, internal, confidential, secret])
       - Queries PostgreSQL to retrieve matching document_version IDs that are active (is_deleted=false),
         indexed (status='indexed'), and current (is_current=true, unless include_historical=True).
       - If no versions are authorized, immediately exits with [] (zero candidate leakage).
    2. Candidate Generation:
       - Dense pgvector search filtered by authorized_version_ids (~20 candidates)
       - Sparse lexical search filtered by authorized_version_ids (~20 candidates)
       - Reciprocal Rank Fusion (RRF fuses candidate sets into top ~20 candidates)
    3. Cross-Encoder Reranking:
       - Qwen3-Reranker deeply evaluates query <-> document cross-attention
       - Re-sorts candidates by semantic relevance score and prunes to top_k
    4. Context Expansion (Optional):
       - Attaches enclosing parent section text (~1,200 tokens) from PostgreSQL
    """
    clean_query = query.strip()
    if not clean_query:
        return []

    # 1. Resolve Clearance Levels (pre-retrieval authorization)
    if allowed_clearance_level is None:
        ctx_levels = current_allowed_clearance.get()
        if ctx_levels:
            effective_clearances = ctx_levels
        else:
            effective_user = user or current_user_context.get()
            effective_clearances = get_user_clearance_levels(effective_user)
    else:
        effective_clearances = allowed_clearance_level

    # Fail-secure default: at least public
    if not effective_clearances:
        effective_clearances = [ClearanceLevel.PUBLIC.value]

    # 2. Resolve Authorized Version IDs before running any search
    authorized_version_ids = await resolve_authorized_version_ids(
        allowed_clearance_levels=effective_clearances,
        include_historical=include_historical,
        document_ids=document_ids,
    )

    if not authorized_version_ids:
        logger.info(f"[Search] Zero authorized document versions found for clearances: {effective_clearances}")
        return []

    candidate_pool = getattr(app_settings, "RERANKER_CANDIDATE_POOL", 20)

    # 3. Candidate Generation: Both Vector and Lexical searches receive the pre-retrieval filter
    vector_filter: Dict[str, Any] = {
        "document_version_id": {"$in": authorized_version_ids},
    }

    vector_task = deps.vector_store.asimilarity_search_with_score(
        query=clean_query,
        k=candidate_pool,
        filter=vector_filter,
    )
    lexical_task = search_lexical_chunks(
        query=clean_query,
        top_k=candidate_pool,
        authorized_version_ids=authorized_version_ids,
    )

    vector_raw, lexical_results = await asyncio.gather(vector_task, lexical_task)

    # Format vector results
    vector_results = []
    for doc, score in vector_raw:
        vector_results.append({
            "content": doc.page_content,
            "document_id": doc.metadata.get("document_id"),
            "document_version_id": doc.metadata.get("document_version_id"),
            "version_number": doc.metadata.get("version_number", 1),
            "is_current": doc.metadata.get("is_current", True),
            "chunk_id": str(doc.metadata.get("chunk_id", "")),
            "file_name": doc.metadata.get("file_name", "Unknown"),
            "clearance_level": doc.metadata.get("clearance_level", "public"),
            "page_number": doc.metadata.get("page_number"),
            "section_title": doc.metadata.get("section_title", ""),
            "chunk_type": doc.metadata.get("chunk_type", "paragraph"),
            "parent_chunk_id": doc.metadata.get("parent_chunk_id"),
            "vector_score": float(score),
        })

    # 4. Reciprocal Rank Fusion (RRF) across Pre-Authorized Dense + Lexical Candidate Sets
    if not lexical_results:
        fused_candidates = vector_results[:candidate_pool]
        for v in fused_candidates:
            v["relevance_score"] = v.get("vector_score", 0.0)
    else:
        fused_candidates = reciprocal_rank_fusion(
            vector_results=vector_results,
            lexical_results=lexical_results,
            k=60,
            top_k=candidate_pool,
        )

    # 5. Stage 2 Reranking: Qwen3-Reranker Deep Cross-Attention
    reranked = await reranker.rerank(
        query=clean_query,
        candidates=fused_candidates,
        top_k=top_k,
    )

    # 6. Optional Context Expansion: Attach Enclosing Parent Section
    if expand_parents:
        reranked = await expand_chunks_with_parent_context(reranked)

    return reranked


# ============================================================================
# 4. PARENT CONTEXT EXPANSION (Parent-Child Resolution)
# ============================================================================

async def fetch_parent_context(
    document_version_id: int,
    parent_chunk_id: str,
) -> Optional[dict[str, Any]]:
    """
    Fetches the enclosing parent section (~1,200 tokens) from PostgreSQL.
    Enables the Document Analysis Agent to expand from a precise child chunk
    to the full surrounding parent context.
    """
    sql = """
        SELECT parent_id, section_title, content, page_number, token_count, metadata
        FROM document_parent_chunks
        WHERE document_version_id = :version_id AND parent_id = :parent_id
        LIMIT 1
    """
    try:
        async with SessionLocal() as session:
            result = await session.execute(text(sql), {
                "version_id": document_version_id,
                "parent_id": parent_chunk_id,
            })
            row = result.mappings().first()
            if row:
                return dict(row)
    except Exception as e:
        print(f"[ParentContext] Error fetching parent {parent_chunk_id}: {e}")
    return None


async def expand_chunks_with_parent_context(
    chunks: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Enriches retrieved child chunks with their enclosing parent section text (~1,200 tokens)."""
    for c in chunks:
        v_id = c.get("document_version_id")
        p_id = c.get("parent_chunk_id")
        if v_id and p_id:
            parent_data = await fetch_parent_context(v_id, p_id)
            if parent_data:
                c["parent_content"] = parent_data.get("content")
                c["parent_title"] = parent_data.get("section_title")
                c["parent_tokens"] = parent_data.get("token_count")
    return chunks


class SearchDocumentsInput(BaseModel):
    query: str = Field(
        description="Natural language search query, document code (e.g. DV-2026-00128, AO No. 14), or policy terms to find."
    )
    top_k: int = Field(
        default=5,
        description="The maximum number of high-precision document excerpts to retrieve after reranking. Default is 5 (range: 1-10)."
    )
    include_historical: bool = Field(
        default=False,
        description="Whether to include previous/historical document versions. Defaults to False (only searches current versions). Set to True for historical comparison or version audits."
    )
    expand_parents: bool = Field(
        default=True,
        description="Whether to include full enclosing parent section context (~1,200 tokens) for retrieved chunks. Default is True."
    )
    document_ids: Optional[List[int]] = Field(
        default=None,
        description="Optional list of specific document IDs to restrict search to."
    )


class FetchParentContextInput(BaseModel):
    document_version_id: int = Field(
        description="The document version ID the child chunk belongs to."
    )
    parent_chunk_id: str = Field(
        description="The parent chunk ID (e.g. 'P001') to retrieve full section context for."
    )


class FetchDocumentInput(BaseModel):
    document_ref: str = Field(
        description="The document ID (e.g '5') or title/file name to fetch full readable text for."
    )


@tool(
    "search_documents",
    description="Two-stage hybrid search internal documents: dense + lexical candidate generation (~20), RRF, Qwen cross-encoder reranking (top ~5-8), and parent context expansion with pre-retrieval clearance and version filtering.",
    args_schema=SearchDocumentsInput,
)
async def search_document_tool(
    query: str,
    top_k: int = 5,
    include_historical: bool = False,
    expand_parents: bool = True,
    document_ids: Optional[List[int]] = None,
) -> str:
    results = await search_documents(
        query=query,
        top_k=top_k,
        include_historical=include_historical,
        expand_parents=expand_parents,
        document_ids=document_ids,
    )
    if not results:
        return f"No relevant documents found matching query: '{query}'."

    output = []
    for idx, item in enumerate(results, 1):
        page_info = f" | Page: {item.get('page_number')}" if item.get("page_number") else ""
        type_info = f" | Type: {item.get('chunk_type')}" if item.get("chunk_type") else ""
        section_info = f" | Section: {item.get('section_title')}" if item.get("section_title") else ""
        parent_info = f" | Parent ID: {item.get('parent_chunk_id')}" if item.get("parent_chunk_id") else ""

        is_cur = item.get("is_current", True)
        version_status = "Current" if is_cur else "Historical"
        v_num = item.get("version_number", 1)

        score_val = item.get("rerank_score", item.get("relevance_score", 0.0))
        score_type = "Rerank Score" if "rerank_score" in item else "RRF Score"

        parent_section_text = ""
        if item.get("parent_content") and item.get("parent_content") != item.get("content"):
            parent_section_text = (
                f"\n[Enclosing Parent Context: {item.get('parent_title', 'Untitled')} ({item.get('parent_tokens', 0)} tokens)]\n"
                f"{item.get('parent_content')}\n"
            )

        output.append(
            f"[{idx}] File: {item.get('file_name', 'Unknown')}{page_info}{type_info}{section_info}{parent_info} ({score_type}: {score_val:.4f})\n"
            f"Document ID: {item.get('document_id')} | Version: v{v_num} ({version_status}) | Clearance: {item.get('clearance_level', 'public')}\n"
            f"Content:\n{item.get('content')}\n"
            f"{parent_section_text}"
        )

    return "\n---\n".join(output)


@tool("fetch_parent_context", description="Retrieve the full enclosing parent section (~1,200 tokens) for a child chunk to obtain surrounding context.", args_schema=FetchParentContextInput)
async def fetch_parent_context_tool(document_version_id: int, parent_chunk_id: str) -> str:
    parent = await fetch_parent_context(document_version_id, parent_chunk_id)
    if not parent:
        return f"No parent context found for document version {document_version_id}, parent_id '{parent_chunk_id}'."
    return (
        f"## Parent Section: {parent.get('section_title', 'Untitled')} (ID: {parent.get('parent_id')}, Tokens: {parent.get('token_count')})\n\n"
        f"{parent.get('content')}"
    )


@tool("fetch_document_content", description="Retrieve the full text content and metadata of a specific document by its ID or title.", args_schema=FetchDocumentInput)
async def fetch_document_content_tool(document_ref: str)-> str:
    title, text = await resolve_document_content(document_ref)
    if not text or not text.strip():
        return f"Document '{document_ref}' was not found or contains no readable text."
    
    max_preview_len = 10000
    truncated_note = ""
    if len(text) > max_preview_len:
        text = text[:max_preview_len]
        truncated_note = f"\n\n[Note: Document truncated to first {max_preview_len} characters.]"
        
    return f"## Document Title: {title}\n\nContent:\n{text}{truncated_note}"


#for database searching
@tool("search_database", description="Search database records.")
async def search_database_tool(query:str, limit: int=10)->str:
    return (f"found {limit} results for {query}")


#for web searching
@tool("search_web", description="Search the web.")
async def search_on_web(query: str, results: int = 10)->str:
    return f"Results for: {query}"


async def vector_search_users(
    query: str,
    user: Users,
    top_k: int = 5,
    include_historical: bool = False,
    document_ids: Optional[List[int]] = None,
):
    allowed_clearances = get_user_clearance_levels(user) 

    return await search_documents(
        query=query,
        top_k=top_k,
        allowed_clearance_level=allowed_clearances,
        include_historical=include_historical,
        document_ids=document_ids,
        user=user,
    )




