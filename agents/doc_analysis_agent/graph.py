from langchain.agents import create_agent
# from langgraph.checkpoint.memory import MemorySaver
# from langgraph.store.memory import InMemoryStore
from core.configurations import chat_model
from tools.registry import DOC_ANALYSIS_TOOLS
from agents.doc_analysis_agent.context import DOC_ANALYSIS_SYSTEM_PROMPT

# doc_analysis_memory = MemorySaver()
# doc_analysis_store = InMemoryStore()




doc_analysis_app = create_agent(
    model=chat_model,
    tools=DOC_ANALYSIS_TOOLS,
    system_prompt=DOC_ANALYSIS_SYSTEM_PROMPT,
    # checkpointer=doc_analysis_memory,
    # store=doc_analysis_store
)
