import hashlib
from pydantic import BaseModel, Field
from typing import Literal, List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from langchain.tools import tool


#imports
from core.dependencies import SessionLocal
from api.models.document import DocumentVersion, DocumentModel
from core.dependencies import deps

#tools
from tools.analysis.fetch import resolve_document_content


#data models
class DuplicateMatch(BaseModel):
    document_id: int = Field(
        description="Database ID of duplicated document"
    )
    document_title: str = Field(
        description="Title of the duplicated document"
    )
    match_type: Literal["EXACT_HASH", "SEMANTIC_SIMILARITY"] = Field(
        description="EXACT_HASH FOR 100% identical files, SEMANTIC_SIMILARITY for high conceptual match"
    )
    reason: str = Field(description="Detailed explnation of the duplicat flag.")
    
    
class DuplicateDetectionResult(BaseModel):
    is_duplicate: bool = Field(description="True if any duplicate candidates were detected")
    checked_document: str = Field(description="Title or reference of the target document")
    total_matches: int = Field(default=0, description="Count of duplicate candidates found")
    matches: List[DuplicateMatch] = Field(default_factory=list, description="List of matched documents.")
    
    
#hash unitilities: exact match

def calculate_content_hash(text:str)->str:
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()


async def check_hash_duplicates(
    checksum: str,
    exclude_version_id: Optional[int] = None,
    exclude_document_id: Optional[int] = None
)->List[DuplicateMatch]:
    
    matches=[]
    if not checksum:
        return matches
    
    try:
        async with SessionLocal() as session:
            stmt = (
                select(DocumentVersion)
                .join(DocumentVersion.document)
                .where(
                    DocumentVersion.checksum == checksum,
                    DocumentModel.is_deleted.is_(False)
                )
                .options(selectinload(DocumentVersion.document))
            )
            
            #do not match against itself if checking an existing doc
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


#similarity search 
async def check_semantic_duplicates(
    text:str,
    threshold: float = 0.92,
    exclude_document_id: Optional[int] = None,
    k: int = 5,
)->List[DuplicateMatch]:
    
    matches = []
    if not text.strip():
        return matches
    
    
    query_sample = text.strip()[:1500]
    
    
    try:
        results = await deps.vector_store.asimilarity_search_with_score(
            query=query_sample,
            k=k,
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
                    reason=f"Semantic similarity score of {similarity:.2%} exceeds threshold of {threshold:.2%}"
                )
            )
        
    except Exception:
        pass
    
    return matches


#detector
async def detect_duplicates(
    doducment_ref: str,
    threshold: float = 0.92,
)->DuplicateDetectionResult:
    #orchestrate duplicate detection:
    # resolves document text and title
    # runs tier 1 (hash check)
    #runs tier 2 vector similarity search
    
    title, text = await resolve_document_content(doducment_ref)
    
    if not text.strip():
        return DuplicateDetectionResult(
            is_duplicate=False,
            checked_document=doducment_ref,
            total_matches=0,
            matches=[],
        )
        
    exclude_doc_id = None
    exclude_ver_id = None
    existing_checksum= None
    
    
    if str(doducment_ref).strip().isdigit():
        exclude_doc_id = int(str(doducment_ref).strip())
        
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
        
        
    #check exact hash
    checksum_to_check = existing_checksum or calculate_content_hash(text)
    hash_matches = await check_hash_duplicates(
        checksum=checksum_to_check,
        exclude_version_id=exclude_ver_id,
        exclude_document_id=exclude_doc_id,
    )
    
    #check semantic similarity
    
    matched_doc_ids = {m.document_id for m in hash_matches}
    semantic_candidates = await check_semantic_duplicates(
        text=text,
        threshold=threshold,
        exclude_document_id=exclude_doc_id,
    )
    
    semantic_mathces = [sm for sm in semantic_candidates if sm.document_id not in matched_doc_ids]
    all_matches=hash_matches + semantic_mathces
    
    return DuplicateDetectionResult(
        is_duplicate=len(all_matches) > 0,
        checked_document=title, 
        total_matches=len(all_matches),
        matches=all_matches,
    )
    
#agent tool
@tool("detect_duplicates")
async def detect_duplicates_tool(document_ref: str, threshold:float = 0.92)->str:
    result = await detect_duplicates(document_ref=document_ref, threshold=threshold)
    
    if not result.is_duplicate:
        return f"No duplicates found for '{result.checked_document}'. The document apppears to be unique in the system."
    
    
    output = [
        f"### Duplicate Detection Report: '{result.checked_document}'",
        f"**Found{result.total_matches} potential duplicate(s):**\n"
    ]
    
    
    for match in result.matches:
        output.append(
            f"- ** Document #{match.document_id}: {match.document_title}** ({match.file_name})\n"
            f"- **Type** {match.match_type}\n"
            f"- **Similarity Score: ** {match.similarity_score:.2%}\n"
            f"-**Details:** {match.reason}\n"
        )
        
    return "\n".join(output)



