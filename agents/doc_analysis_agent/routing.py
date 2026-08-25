from typing import Literal
from agents.state import IntentAgentState

def intent_classifier_router(
        state: IntentAgentState
)->Literal[
    "call_doc_analysis_node",
    "ask_for_clarification_node",
    "reject_request_node"
]:
    classify_intent = state.get("intent")

    if classify_intent == "analyze_document":
        return "call_doc_analysis_node"

    # TODO: Add routing for 'retrieve_document', 'check_leave_credits', etc... later

    if classify_intent == "unclear":
        return "ask_for_clarification_node"

    return "reject_request_node"


