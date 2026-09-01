from typing import Literal
from agents.state import IntentAgentState

VALID_AGENT_INTENTS = {
    "analyze_document",
    "retrieve_document",
    "check_leave_credits",
    "process_attachments",
}

def intent_classifier_router(
        state: IntentAgentState
) -> Literal[
    "call_doc_analysis_node", 
    "call_researcher_node",
    "call_reporting_node",
    "ask_for_clarification_node", 
    "reject_request_node"
]:

    
    # Use .get() to prevent KeyError if intent is None
    classify_intent = state.get("intent")

    

    # The router dictates the NEXT step. If the intent is valid, route to the target agent node.
    if classify_intent == "analyze_document":
        return "call_doc_analysis_node"

    if classify_intent == "research_documents":
        return "call_researcher_node"

    if classify_intent == "proccess_attachments":
        return "call_reporting_node"

    if classify_intent == "unclear":
        return "ask_for_clarification_node"

    return "reject_request_node"