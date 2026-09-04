from typing import TypedDict, Optional

class DocAnalysisAgent(TypedDict, total=False): 
    question: str
    document_text: Optional[str]
    document_id: Optional[int]

    #comparison fields
    compare_document_text: Optional[str]
    compare_document_id: Optional[int]
    is_comparison: Optional[bool]

    
    analysis_result: Optional[dict]

