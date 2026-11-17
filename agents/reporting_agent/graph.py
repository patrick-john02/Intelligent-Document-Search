from langchain.agents import create_agent
from core.configurations import chat_model
from tools.registry import get_tools_for_agents
from agents.reporting_agent.context import REPORTING_SYSTEM_PROMPT

reporting_app=create_agent(
    model=chat_model,
    tools=get_tools_for_agents("reporting"),
    system_prompt=REPORTING_SYSTEM_PROMPT,
)
