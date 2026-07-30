from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import RetryPolicy
from agents.state import DocumentAgentState
from agents.nodes import (
    classify_question, search_documents, generated_answer, 
)

workflow = StateGraph(DocumentAgentState)

workflow.add_node("classify_question", classify_question, retry_policy=RetryPolicy(max_attempts=3))
workflow.add_node("search_documents", search_documents, retry_policy=RetryPolicy(max_attempts=3))
workflow.add_node("generated_answer", generated_answer, retry_policy=RetryPolicy(max_attempts=3))

memory = MemorySaver() 
app = workflow.compile(checkpointer=memory)
