from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware
from core.dependencies import chat_model

agent = create_agent(
    model=chat_model
)