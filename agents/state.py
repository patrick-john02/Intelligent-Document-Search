from typing import TypedDict
from langchain_core.documents import Document


class DocumentAgentState(TypedDict):
    question: str
    classification: str | None
    classify_document_format: str | None
    search_results: list[Document]
    answer: str | None


