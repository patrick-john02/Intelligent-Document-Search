from langgraph.graph import StateGraph, START, END
from agents.doc_analysis_agent.state import DocAnalysisAgent
from agents.doc_analysis_agent.nodes import analyze_document_node, compare_document_node
from agents.doc_analysis_agent.routing import doc_analysis_router

workflow = StateGraph(DocAnalysisAgent)

workflow.add_node("analyze_document_node", analyze_document_node)
workflow.add_node("compare_document_node", compare_document_node)

workflow.add_conditional_edges(
    START,
    doc_analysis_router,
    {
        "analyze_document_node":"analyze_document_node",
        "compare_document_node":"compare_documents_node"
    }
)


workflow.add_edge("analyze_document_node",END)
workflow.add_edge("compare_documents_node", END)


doc_analysis_app = workflow.compile()
