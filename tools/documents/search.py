from typing import Optional, List, Dict, Any
from core.dependencies import deps
from langchain.tools import tool
from pydantic import BaseModel, Field
from tools.analysis.fetch import resolve_document_content

from api.models.users import Users
from tools.access.permissions import get_user_clearance_levels


#so im learning about difference of asimilarity_search, asimilarity_search_by_vector, 
# asimilarity_search_with_relevance_scores, asimilarity_search_with_score,
# asimilarity_search_with_score_by_vector, and _asimilarity_search_with_relevance_scores 
#I will test every part of them we will start on the part of the asimilarity_search 

#short description asimilarity_search - is defined as a No scores no way to filter.




async def search_documents(
    query: str,
    top_k: int = 3, #on this part lets put the top_k similarities as 3 first.
    allowed_clearance_level: Optional[List[str]] = None,
    document_ids: Optional[List[int]] = None,
):

    filter_conditions: Dict[str, Any] = {}

    if allowed_clearance_level:
        filter_conditions["clearance_level"] = {"$in": allowed_clearance_level}

    if document_ids:
        filter_conditions["document_id"] = {"$in":document_ids}

    results = await deps.vector_store.asimilarity_search_with_score(
        query=query,
        k=top_k,
        filter=filter_conditions if filter_conditions else None,
    )

    formatted_results = []
    for doc, score in results:
        formatted_results.append({
            "content":doc.page_content,
            "document_id":doc.metadata.get("document_id"),
            "document_version_id":doc.metadata.get("document_version_id"),
            "file_name":doc.metadata.get("file_name"),
            "clearance_Level":doc.metadata.get("clearance_level"),
            "relevance_score":float(score),

        })

    return formatted_results

class SearchDocumentsInput(BaseModel):
    query:str=Field(
        description="Natural language search query or keywords describing the information, concept, or policy to find in internal documents"
    )
    top_k: int = Field(
        default=3,
        description="The maximum number of relevant documnet excepts to retrieve. Default is 3 (range: 1-10)."
    )

class FetchDocumentInput(BaseModel):
    document_ref: str = Field(
        description="The document ID (e.g '5') or title/file name to fetch full readable text for."
    )
    

@tool("search_documents", description="Search internal documents and vector store for relevant excerpts, policies, and circulars.", args_schema=SearchDocumentsInput)
async def search_document_tool(query:str,top_k:int=3)->str:
    
    results = await search_documents(query=query, top_k=top_k)
    if not results:
        return f"No relevant documents found matching query: '{query}'."
    
    output = []
    
    for idx, item in enumerate(results, 1):
        output.append(
            f"[{idx}] File: {item.get('file_name', 'Unknown')} (Score: {item.get('relevance_score', 0.0):.2f})\n"
            f"Document ID: {item.get('document_id')}\n"
            f"Content:\n{item.get('content')}\n"
        )
        
    return "\n---\n".join(output)

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



async def vector_search_users(query:str, user:Users, top_k:int=5):
    allowed_clearances = get_user_clearance_levels(user) 

    return await search_documents(
        query=query,
        top_k=top_k,
        allowed_clearance_level=allowed_clearances
    )




