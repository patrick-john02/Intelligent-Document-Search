from typing import Literal
from agents.state import IntentAgentState

def intent_classifier_router(
        state: IntentAgentState
) -> Literal[
    "target_agent_node", 
    "ask_for_clarification_node", 
    "reject_request_node"
]:
    # Use .get() to prevent KeyError if intent is None
    classify_intent = state.get("intent")

    # The router dictates the NEXT step. If the intent is valid, route to the target agent node.
    if classify_intent in {"search", "summarize", "compare"}:
        return "target_agent_node"

    if classify_intent == "unclear":
        return "ask_for_clarification_node"

    return "reject_request_node"