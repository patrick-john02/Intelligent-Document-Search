from typing import Optional, List, Dict, Any
from core.dependencies import deps
from langchain.tools import tool

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


#description: searches for company knowledge base for relevant docs.
#this will be used when the user asks for internal company information.

@tool("search_documents")
async def search_document_tool(query:str, top_k: int = 3)->str:
    results = await search_documents(query=query, top_k=top_k)
    if not results:
        return "No Relevant Documents Found"

    output = []
    for idx, item in enumerate(results, 1):
        output.append(
            f"[{idx}] File: {item['file_name']} (Score: {item['relevance_score']:.2f})\n"
            f"Content: {item['content']}\n"
        )
    return "\n---\n".join(output)



#for database searching
@tool("search_database")
async def search_database_tool(query:str, limit: int=10)->str:
    return (f"found {limit} results for {query}")



#for web searching
@tool("search_web")
async def search_on_web(query: str, results: int = 10)->str:
    return f"Results for: {query}"

print(search_on_web.name)



async def vector_search_users(query:str, user:Users, top_k:int=5):
    allowed_clearances = get_user_clearance_levels(user) 

    return await search_documents(
        query=query,
        top_k=top_k,
        allowed_clearance_level=allowed_clearances
    )




