from typing import TypedDict, Optional, List, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


def merge_ids(existing: Optional[List[int]], new: Optional[List[int]]) -> List[int]:
    """Keep attachments from earlier turns; add new ones at the end, no duplicates."""
    return list(dict.fromkeys((existing or []) + (new or [])))


class SupervisorState(TypedDict, total=False):
    # chat history — add_messages APPENDS, never overwrites
    messages: Annotated[List[BaseMessage], add_messages]

    user_id: Optional[int]

    # name, position, office of the current user — set per request in chat_view
    user_profile: Optional[dict]

    # every document attached in this conversation, oldest first
    attachment_ids: Annotated[List[int], merge_ids]
