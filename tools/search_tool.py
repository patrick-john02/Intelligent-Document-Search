import os
from tavily import TavilyClient
from dotenv import load_dotenv

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
    
