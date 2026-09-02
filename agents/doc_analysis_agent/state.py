from typing import TypedDict, Optional

class DocAnalysisAgent(TypedDict, total=False): 
    question: str
    document_text: Optional[str]
    document_id: Optional[int]
    analysis_result: Optional[dict]

