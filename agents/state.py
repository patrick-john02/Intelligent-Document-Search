
from typing import TypedDict, Optional, List, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class IntentAgentState(TypedDict, total=False):
    #stores the chat history. "add messages" means APPEND, never overwrite
    messages: Annotated[List[BaseMessage], add_messages]

    question: str
    user_id: Optional[int]
    intent: Optional[str]
    attachment_ids: List[int]
    mentioned_document_ids: List[int]
    target_agent: Optional[str]
    agent_result: Optional[str]
    final_response: Optional[str]
