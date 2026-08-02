import os
from tavily import TavilyClient
from dotenv import load_dotenv
from deepagents import create_deep_agent

from typing import Literal

load_dotenv()
tavily_client = TavilyClient(os.getenv("TAVILY_API_KEY"))

def internet_search(
    query:str, 
    max_results: int =5, 
    topic: Literal["general", "news", "finance"] = "general",
    include_raw_content: bool = False, 
):
    #web search run
    return tavily_client.search(
        query,
        max_results=max_results,
        include_raw_content=include_raw_content,
        topic=topic
    )
    
agent = create_deep_agent(
    model = "ollama:north-mini-core-1.0",
    tools=[internet_search],
)