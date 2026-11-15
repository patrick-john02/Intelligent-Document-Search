from langchain.agents import create_agent
from core.configurations import chat_model
from tools.registry import get_tools_for_agents
from agents.records_agent.context import RECORDS_SYSTEM_PROMPT

records_app = create_agent(
    model=chat_model,
    tools=get_tools_for_agents("records"),
    system_prompt=RECORDS_SYSTEM_PROMPT,
)