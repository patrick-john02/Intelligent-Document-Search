from typing import TypedDict, Optional, List


class IntentAgentState(TypedDict, total=False):
    question: str
    intent: Optional[str]
    attachment_ids: List[int]
    mentioned_document_ids: List[int]
    target_agent: Optional[str]
    agent_result: Optional[str]
    final_response: Optional[str]
    