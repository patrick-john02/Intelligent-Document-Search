from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver #RAM temporary persistent storage.
from langgraph.types import RetryPolicy
from agents.state import IntentAgentState
from langgraph.prebuilt import ToolNode, tools_condition

from tools.registry import ALL_TOOLS
from agents.nodes import agent_node
from agents.routing import intent_classifier_router

#checkpointers and store
from agents.checkpointer import posgres_checkpointer, store

workflow = StateGraph(IntentAgentState)

#NODE A : reasoning Node(LLM thinks, decides tools or answer)
workflow.add_node("agent_node", agent_node, retry_policy=RetryPolicy(max_attempts=3))

#NODE B Tool execution node (this will runs any tool called by the LLM)
workflow.add_node("tools", ToolNode(ALL_TOOLS))

workflow.add_edge(START, "agent_node")


workflow.add_conditional_edges(
    "agent_node", 
    {
        "tools": "tools",
        END:END
    }
)

workflow.add_edge("tools", "agent_node")

#Compile
#for now I will use MemorySaver, and soon i will use AsyncPostgresSaver() on production
# memory = MemorySaver() 

# app = workflow.compile(checkpointer=memory)
app=workflow.compile(
    checkpointer=posgres_checkpointer, 
    store=store
)



