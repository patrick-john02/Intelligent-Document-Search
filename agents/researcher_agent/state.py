from typing import TypedDict, Optional

class DocumentResearcherAgent(TypedDict, total=False):
    question:str
    document_text: Optional[str]
    document_id: Optional[int]
    search_result: Optional[dict]

    