import hashlib
from typing import List, Literal, Optional
from langchain.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from api.models.document import DocumentModel, DocumentVersion
from core.dependencies import SessionLocal, deps
from rag.dedup import default_duplicate_detector
from tools.analysis.fetch import resolve_document_content
from tools.access.permissions import clearance_filter, active_clearance_levels
from tools.documents.search import resolve_authorized_version_ids


class DuplicateMatch(BaseModel):
    document_id: int = Field(description="Database ID of duplicated document")
    document_title: str = Field(description="Title of the duplicated document")
    file_name: str = Field(default="Unknown", description="File name of the matched document")
    match_type: Literal["EXACT_HASH", "MINHASH_JACCARD", "TOKEN_DISTANCE", "SEMANTIC_SIMILARITY"] = Field(
        description="Type of duplicate match"
    )
    similarity_score: float = Field(default=1.0, description="Similarity score between 0.0 and 1.0")
    reason: str = Field(description="Detailed explanation of the duplicate flag.")


class DuplicateDetectionResult(BaseModel):
    is_duplicate: bool = Field(description="True if any duplicate candidates were detected")
    checked_document: str = Field(description="Title or reference of the target document")
    total_matches: int = Field(default=0, description="Count of duplicate candidates found")
    matches: List[DuplicateMatch] = Field(default_factory=list, description="List of matched documents.")


class DetectDuplicatesInput(BaseModel):
    document_ref: str = Field(
        description="The Document ID (e.g. '5') or title to check against all existing documents for duplicates"
    )
    threshold: float = Field(
        default=0.85,
        description="Similarity threshold between 0.0 and 1.0 (default: 0.85)."
    )


def calculate_content_hash(text: str) -> str:
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()


async def check_hash_duplicates(
    checksum: str,
    exclude_version_id: Optional[int] = None,
    exclude_document_id: Optional[int] = None,
) -> List[DuplicateMatch]:
    matches: List[DuplicateMatch] = []
    if not checksum:
        return matches

    try:
        async with SessionLocal() as session:
            stmt = (
                select(DocumentVersion)
                .join(DocumentVersion.document)
                .where(
                    DocumentVersion.checksum == checksum,
                    DocumentModel.is_deleted.is_(False), clearance_filter(),
                    
                )
                .options(selectinload(DocumentVersion.document))
            )

            if exclude_version_id:
                stmt = stmt.where(DocumentVersion.id != exclude_version_id)
            if exclude_document_id:
                stmt = stmt.where(DocumentVersion.document_id != exclude_document_id)

            result = await session.execute(stmt)
            versions = result.scalars().all()

            for v in versions:
                matches.append(
                    DuplicateMatch(
                        document_id=v.document_id,
                        document_title=v.document.title if v.document else f"Document #{v.document_id}",
                        file_name=v.file_name,
                        match_type="EXACT_HASH",
                        similarity_score=1.0,
                        reason=f"Exact binary/content hash match (SHA-256: {checksum[:8]}...).",
                    )
                )
    except Exception:
        pass

    return matches


async def check_algorithmic_duplicates(
    text: str,
    threshold: float = 0.85,
    exclude_document_id: Optional[int] = None,
    limit: int = 10,
) -> List[DuplicateMatch]:
    matches: List[DuplicateMatch] = []
    if not text.strip():
        return matches

    try:
        async with SessionLocal() as session:
            stmt = (
                select(DocumentModel)
                .where(DocumentModel.is_deleted.is_(False), clearance_filter())
                .options(selectinload(DocumentModel.versions))
            )
            if exclude_document_id:
                stmt = stmt.where(DocumentModel.id != exclude_document_id)

            res = await session.execute(stmt)
            docs = res.scalars().all()

            for d in docs:
                if len(matches) >= limit:
                    break

                target_title, target_text = await resolve_document_content(str(d.id))
                if not target_text.strip():
                    continue

                report = default_duplicate_detector.compare_documents(
                    text_a=text,
                    text_b=target_text,
                    near_duplicate_threshold=threshold,
                )

                if report.is_near_duplicate:
                    file_name = d.versions[0].file_name if d.versions else "Unknown"
                    match_type = (
                        "MINHASH_JACCARD"
                        if report.minhash_jaccard_similarity >= threshold
                        else "TOKEN_DISTANCE"
                    )
                    matches.append(
                        DuplicateMatch(
                            document_id=d.id,
                            document_title=d.title,
                            file_name=file_name,
                            match_type=match_type,
                            similarity_score=report.composite_similarity_score,
                            reason=(
                                f"{report.duplicate_category}: MinHash Jaccard {report.minhash_jaccard_similarity:.1%}, "
                                f"Token Sort Ratio {report.token_sort_ratio:.1%}, "
                                f"Token Levenshtein {report.token_levenshtein_ratio:.1%}."
                            ),
                        )
                    )
    except Exception:
        pass

    return matches


async def check_semantic_duplicates(
    text: str,
    threshold: float = 0.92,
    exclude_document_id: Optional[int] = None,
    k: int = 5,
) -> List[DuplicateMatch]:
    matches: List[DuplicateMatch] = []
    if not text.strip():
        return matches

    query_sample = text.strip()[:1500]
    allowed_ids = await resolve_authorized_version_ids(active_clearance_levels())
    if not allowed_ids:
        return matches

    

    try:
        results = await deps.vector_store.asimilarity_search_with_score(
            query=query_sample,
            k=k,
            filter={"document_version_id": {"$in": allowed_ids}},
        )

        seen_doc_ids = set()

        for doc, distance in results:
            similarity = 1.0 - distance if distance <= 1.0 else distance
            if similarity < 0.0:
                similarity = 0.0

            if similarity < threshold:
                continue

            doc_version_id = doc.metadata.get("document_version_id")
            file_name = doc.metadata.get("file_name", "Unknown")

            doc_id = None
            doc_title = file_name
            if doc_version_id:
                try:
                    async with SessionLocal() as session:
                        stmt = (
                            select(DocumentVersion)
                            .where(DocumentVersion.id == doc_version_id)
                            .options(selectinload(DocumentVersion.document))
                        )
                        res = await session.execute(stmt)
                        version_record = res.scalar_one_or_none()
                        if version_record:
                            doc_id = version_record.document_id
                            if version_record.document:
                                doc_title = version_record.document.title
                except Exception:
                    pass

            if doc_id and exclude_document_id and doc_id == exclude_document_id:
                continue

            dedup_key = doc_id or file_name
            if dedup_key in seen_doc_ids:
                continue

            seen_doc_ids.add(dedup_key)

            matches.append(
                DuplicateMatch(
                    document_id=doc_id or 0,
                    document_title=doc_title,
                    file_name=file_name,
                    match_type="SEMANTIC_SIMILARITY",
                    similarity_score=round(similarity, 4),
                    reason=f"Semantic similarity score of {similarity:.2%} exceeds threshold of {threshold:.2%}",
                )
            )

    except Exception:
        pass

    return matches


async def detect_duplicates(
    document_ref: str,
    threshold: float = 0.85,
) -> DuplicateDetectionResult:
    title, text = await resolve_document_content(document_ref)

    if not text.strip():
        return DuplicateDetectionResult(
            is_duplicate=False,
            checked_document=document_ref,
            total_matches=0,
            matches=[],
        )

    exclude_doc_id = None
    exclude_ver_id = None
    existing_checksum = None

    if str(document_ref).strip().isdigit():
        exclude_doc_id = int(str(document_ref).strip())
        try:
            async with SessionLocal() as session:
                stmt = select(DocumentVersion).where(
                    DocumentVersion.document_id == exclude_doc_id,
                    DocumentVersion.is_current.is_(True),
                )
                res = await session.execute(stmt)
                active_ver = res.scalar_one_or_none()
                if active_ver:
                    exclude_ver_id = active_ver.id
                    existing_checksum = active_ver.checksum
        except Exception:
            pass

    checksum_to_check = existing_checksum or calculate_content_hash(text)
    hash_matches = await check_hash_duplicates(
        checksum=checksum_to_check,
        exclude_version_id=exclude_ver_id,
        exclude_document_id=exclude_doc_id,
    )

    matched_doc_ids = {m.document_id for m in hash_matches}

    algo_matches = await check_algorithmic_duplicates(
        text=text,
        threshold=threshold,
        exclude_document_id=exclude_doc_id,
    )
    for m in algo_matches:
        if m.document_id not in matched_doc_ids:
            matched_doc_ids.add(m.document_id)
            hash_matches.append(m)

    semantic_candidates = await check_semantic_duplicates(
        text=text,
        threshold=max(threshold, 0.90),
        exclude_document_id=exclude_doc_id,
    )
    for sm in semantic_candidates:
        if sm.document_id not in matched_doc_ids:
            matched_doc_ids.add(sm.document_id)
            hash_matches.append(sm)

    return DuplicateDetectionResult(
        is_duplicate=len(hash_matches) > 0,
        checked_document=title,
        total_matches=len(hash_matches),
        matches=hash_matches,
    )


@tool(
    "detect_duplicates",
    description="Check if a given document is an exact binary hash duplicate or near-duplicate using MinHash Jaccard similarity and token distance.",
    args_schema=DetectDuplicatesInput,
)
async def detect_duplicates_tool(document_ref: str, threshold: float = 0.85) -> str:
    result = await detect_duplicates(document_ref=document_ref, threshold=threshold)

    if not result.is_duplicate:
        return f"No duplicates found for '{result.checked_document}'. The document appears to be unique in the system."

    output = [
        f"### Duplicate Detection Report: '{result.checked_document}'",
        f"**Found {result.total_matches} potential duplicate(s):**\n",
    ]

    for match in result.matches:
        output.append(
            f"- **Document #{match.document_id}: {match.document_title}** ({match.file_name})\n"
            f"  - **Type:** {match.match_type}\n"
            f"  - **Similarity Score:** {match.similarity_score:.2%}\n"
            f"  - **Reason:** {match.reason}\n"
        )

    return "\n".join(output)
