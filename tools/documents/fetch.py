from langchain.tools import tool


@tool
def search_database(query:str, limit: int = 10) -> str:
    return f"Found {limit} results for '{query}'"

@tool("web_search")
def search_web(query:str)->str:
    return f"Results for: {query}"

print (search_web.name)