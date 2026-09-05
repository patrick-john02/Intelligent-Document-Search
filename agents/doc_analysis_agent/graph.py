from langgraph.graph import StateGraph, START, END
from agents.doc_analysis_agent.state import DocAnalysisAgent
from agents.doc_analysis_agent.nodes import (
    fetch_document_node, 
    compare_document_node,
    analyze_document_node,
    detects_duplicates_node,
)
from agents.doc_analysis_agent.routing import doc_analysis_router

workflow = StateGraph(DocAnalysisAgent)

workflow.add_node("fetch_document_node", fetch_document_node)
workflow.add_node("detects_duplicates_node", detects_duplicates_node)
workflow.add_node("analyze_document_node", analyze_document_node)
workflow.add_node("compare_document_node", compare_document_node)

#every request enter on this node
workflow.add_edge(START, "fetch_document_node")


workflow.add_conditional_edges(
    "fetch_document_node",
    doc_analysis_router,
    {
        "detects_duplicates_node":"detects_duplicates_node",
        "compare_document_node":"compare_document_node",
        "analyze_document_node":"analyze_document_node",
        
    }
)
workflow.add_edge("detects_duplicates_node", END)
workflow.add_edge("compare_documents_node", END)
workflow.add_edge("analyze_document_node",END)


doc_analysis_app = workflow.compile()
