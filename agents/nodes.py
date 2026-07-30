from agents.state import (
    DocumentAgentState,
)

async def classify_question(state: DocumentAgentState):
    question = state["question"]
    return {"classification": "document_search"}

async def classify_document_format(state: DocumentAgentState):
    format = state["document_format"]
    return {"document_format": classify_document_format}

async def search_documents(state:DocumentAgentState):
    classification = state["classification"]
    return {"search_results": search_documents}

async def generated_answer(state: DocumentAgentState):
    documents = state["answer"]
    return {"answer": generated_answer}