from typing import Literal
from agents.doc_analysis_agent.state import DocAnalysisAgent

def doc_analysis_router(
    state:DocAnalysisAgent
)->Literal["detect_duplicate_nodes","compare_document_node", "analyze_docuement_node"]:
    
    question = state.get("question", "").lower()
    is_duplicate_intent = state.get("is_duplicate_check", False) or "duplicate" in question
    
    if is_duplicate_intent:
        return "detect_duplicates_node"
    
    
    has_second_doc = bool(state.get("compare_document_id") or state.get("compare_document_text"))
    is_compare_flag = state.get("is_comparison", False)

    if has_second_doc or is_compare_flag:
        return "compare_documents_node"

    return "analyze_document_node"


