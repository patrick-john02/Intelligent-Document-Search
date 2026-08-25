from langgraph.graph import StateGraph, START, END
from agents.doc_analysis_agent.state import DocAnalysisAgent
from agents.doc_analysis_agent.nodes import analyze_document_node

workflow = StateGraph(DocAnalysisAgent)

workflow.add_node("analyze_document_node", analyze_document_node)

workflow.add_edge(START, "analyze_document_node")
workflow.add_edge("analyze_document_node", END)

doc_analysis_app = workflow.compile()
