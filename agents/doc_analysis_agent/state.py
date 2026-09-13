from typing import TypedDict, Optional, List, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class DocAnalysisAgent(TypedDict, total=False): 
    message: Annotated[List[BaseMessage], add_messages]


    question: str
    document_text: Optional[str]
    document_id: Optional[int]
    document_title: Optional[str]

    #comparison fields
    compare_document_text: Optional[str]
    compare_document_id: Optional[int]
    compare_document_title: Optional[str]
    is_comparison: Optional[bool]

    
    analysis_result: Optional[dict]

