from typing import List, Optional
from langchain_core.tools import BaseTool


#research and document tools
from tools.documents.search import(
    search_document_tool,
    fetch_document_content_tool,
)

#analysis tools
from tools.analysis.compare import compare_document_tool
from tools.analysis.detect_duplicates import detect_duplicates_tool


RESEARCH_TOOLS: List[BaseTool] = [
    search_document_tool,
    fetch_document_content_tool,
]

DOC_ANALYSIS_TOOLS: List[BaseTool] = [
    fetch_document_content_tool,
    compare_document_tool,
    detect_duplicates_tool,
]

ARCHIVE_TOOLS: List[BaseTool]= []


ALL_TOOLS: List[BaseTool] = list({
    t.name: t for t in [*RESEARCH_TOOLS, *DOC_ANALYSIS_TOOLS, *ARCHIVE_TOOLS]
}.values())


#helper functions
def get_tools_for_agents(agent_name: str)->List[BaseTool]:
    
    mapping = {
        "researcher": RESEARCH_TOOLS,
        "doc_analysis": DOC_ANALYSIS_TOOLS,
        "archiving":ARCHIVE_TOOLS,
    }
    
    return mapping.get(agent_name.lower(), ALL_TOOLS)


def get_tool_by_name(name: str)->Optional[BaseTool]:
    
    for t in ALL_TOOLS: 
        if getattr(t, "name", None) == name:
            return t
    return None


