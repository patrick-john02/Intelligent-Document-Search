
from typing import TypedDict, Optional, List, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class IntentAgentState(TypedDict, total=False):
    #stores the chat history. "add messages" means APPEND, never overwrite
    messages: Annotated[List[BaseMessage], add_messages]

    question: Optional[str]
    user_id: Optional[int]
    attachment_ids: Optional[List[int]]
    final_response: Optional[str]
