from typing import TypedDict, Optional

class DocAnalysisAgent(TypedDict, total=False): 
    question: str
    analysis_result: Optional[dict]
    

