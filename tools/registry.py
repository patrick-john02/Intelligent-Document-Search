from typing import List, Optional
from langchain_core.tools import BaseTool


#research and document tools
from tools.documents.search import(
    search_document_tool,
    fetch_document_content_tool,
    fetch_parent_context_tool,
)
from tools.researcher.search import(
    search_documents, find_documents_tool, lookup_reference_tool
)

#analysis tools
from tools.analysis.compare import compare_document_tool
from tools.analysis.detect_duplicates import detect_duplicates_tool
from tools.archiving.archive_tools import ARCHIVE_TOOLS

#lookup tool
from tools.records.lookup import RECORDS_TOOLS

#reporting tools
from tools.reporting.reporting_tools import archive_activity_summary_tool, review_queue_status_tool, list_attention_items_tool

#reporting tool
from tools.reporting.reporting_tools import REPORTING_TOOLS

#researcher tool
from tools.researcher.search import RESEARCH_SEARCH_TOOLS


RESEARCH_TOOLS: List[BaseTool] = [
    lookup_reference_tool,
    find_documents_tool,
    search_documents,
    fetch_document_content_tool,
    fetch_parent_context_tool,
]

DOC_ANALYSIS_TOOLS: List[BaseTool] = [
    fetch_document_content_tool,
    fetch_parent_context_tool,
    compare_document_tool,
    detect_duplicates_tool,
]

REPORTING_TOOLS:List[BaseTool] = [
    archive_activity_summary_tool,
    review_queue_status_tool,
    list_attention_items_tool,
]

# ARCHIVE_TOOLS: List[BaseTool]= []


ALL_TOOLS: List[BaseTool] = list({
    t.name: t for t in [
        *RESEARCH_TOOLS, 
        *RESEARCH_SEARCH_TOOLS,
        *DOC_ANALYSIS_TOOLS, 
        *ARCHIVE_TOOLS, 
        *RECORDS_TOOLS,
        *REPORTING_TOOLS,
    ]
}.values())


#helper functions
def get_tools_for_agents(agent_name: str)->List[BaseTool]:
    
    mapping = {
        "researcher": RESEARCH_TOOLS,
        "reporting": REPORTING_TOOLS,
        "doc_analysis": DOC_ANALYSIS_TOOLS,
        "archiving":ARCHIVE_TOOLS,
        "records":RECORDS_TOOLS,
    }
    
    return mapping.get(agent_name.lower(), ALL_TOOLS)


def get_tool_by_name(name: str)->Optional[BaseTool]:
    
    for t in ALL_TOOLS: 
        if getattr(t, "name", None) == name:
            return t
    return None


