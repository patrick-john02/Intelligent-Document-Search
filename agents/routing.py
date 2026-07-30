from typing import Literal
from agents.state import DocumentAgentState



def route_after_classificiation(
        state:DocumentAgentState
)->Literal[
    "search_documents",
    "ask_for_clarification",
    "reject_request"
]:
    intent = state["classfication"]["intent"]

    if intent in {"search", "summarize", "compare"}:
        return "search_documents"

    if intent == "unclear":
        return "ask_for_clarification"

    return "reject_request"


def route_after_intent_classification(
        state:DocumentAgentState,
)->Literal[
    "search_document",
    "ask_for_format",
    "reject_request"
]:
    intent = state["classification"]["intent"]

    if intent in {"document_name", "search_document"}:
        return "classify_document_format"

    if intent == "unclear":
        return "reject_request"
