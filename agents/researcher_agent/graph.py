from langgraph.graph import StateGraph, START, END
from agents.researcher_agent.context import DocumentSearching
from agents.researcher_agent.nodes import search_document_node
#import nodes here soon


workflow = StateGraph(DocumentSearching)

workflow.add_node("search_documents_node", search_document_node)

workflow.add_edge(START, "search_document_node")
workflow.add_edge("search_document_node", END)

doc_searching_app = workflow.compile()