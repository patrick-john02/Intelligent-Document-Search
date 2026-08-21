from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import RetryPolicy
from agents.state import IntentAgentState
from agents.nodes import (
    classify_intent_node, 
    get_attachment_ids_node, 
    target_agent_node,
    ask_for_clarification_node,
    reject_request_node,
    generated_answer_node
)
from agents.routing import intent_classifier_router

workflow = StateGraph(IntentAgentState)


workflow.add_node("classify_intent_node", classify_intent_node, retry_policy=RetryPolicy(max_attempts=3))
workflow.add_node("get_attachment_ids_node", get_attachment_ids_node)
workflow.add_node("target_agent_node", target_agent_node)
workflow.add_node("ask_for_clarification_node", ask_for_clarification_node)
workflow.add_node("reject_request_node", reject_request_node)
workflow.add_node("generated_answer_node", generated_answer_node)


workflow.add_edge(START, "get_attachment_ids_node")

workflow.add_edge("get_attachment_ids_node", "classify_intent_node")

workflow.add_conditional_edges(
    "classify_intent_node", 
    intent_classifier_router,
    {
        "target_agent_node":"target_agent_node",
        "ask_for_clarification_node":"ask_for_clarification_node",
        "reject_request_node":"reject_request_node",
    }
)


workflow.add_edge("target_agent_node", "generated_answer_node")
workflow.add_edge("generated_answer_node", END)
workflow.add_edge("ask_for_clarification_node", END)
workflow.add_edge("reject_request_node", END)

#Compile
memory = MemorySaver() 
app = workflow.compile(checkpointer=memory)