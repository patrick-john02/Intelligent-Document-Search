from typing import Literal
from agents.doc_analysis_agent.state import DocAnalysisAgent

def doc_analysis_router(state:DocAnalysisAgent)->Literal["compare_documents_node", "analyze_docuement_node"]:
    has_second_doc = bool(state.get("compare_document_id") or state.get("compare_document_text"))
    is_compare_flag = state.get("is_comparison", False)

    if has_second_doc or is_compare_flag:
        return "compare_documents_node"

    return "analyze_document_node"


