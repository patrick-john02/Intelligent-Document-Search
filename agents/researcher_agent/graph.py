from langchain.agents import create_agent
from core.configurations import chat_model
from tools.registry import RESEARCH_TOOLS
from agents.researcher_agent.context import RESEARCHER_SYSTEM_PROMPT

doc_searching_app = create_agent(
    model = chat_model,
    tools=RESEARCH_TOOLS, 
    system_prompt = RESEARCHER_SYSTEM_PROMPT,
    # checkpointer=researcher_memory,
)

