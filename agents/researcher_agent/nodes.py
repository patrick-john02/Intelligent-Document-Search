from agents.researcher_agent.context import DocumentSearchingService
from agents.researcher_agent.state import DocumentResearcherAgent

async def search_document_node(state: DocumentResearcherAgent):
    question = state.get("question", "Perform a search analysis of this document.")
    query = state.get("query", "")
    service = DocumentSearchingService() 

    result = await service.search(query=query, user_prompt=question)

    return{"search_result":result.model_dump()}


