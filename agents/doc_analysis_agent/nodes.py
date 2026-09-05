#document analysis agent
from agents.doc_analysis_agent.state import DocAnalysisAgent
from agents.doc_analysis_agent.context import DocAnalysisService
#supervisor
from agents.state import IntentAgentState

#tools
from tools.analysis.compare import compare_documents
from tools.analysis.fetch import resolve_document_content
from tools.analysis.detect_duplicates import detect_duplicates as detect_dup

async def fetch_document_node(state:DocAnalysisAgent):
    updates = {}
    
    doc_a_ref = state.get("document_text") or state.get("document_id")
    if doc_a_ref and not  state.get("document_text"):
        title, text = await resolve_document_content(str(doc_a_ref))
        updates["document_text"]=text
        updates["document_title"]=title
        
    doc_b_ref = state.get("compare_document_text") or state.get("compare_document_id")
    if doc_b_ref and not state.get("compare_document_text"):
        title_b, text_b = await resolve_document_content(str(doc_b_ref))
        updates["compare_document_text"] = text_b
        updates["compare_document_title"] = title_b
    
    return updates


async def detects_duplicates_node(state:DocAnalysisAgent):
    doc_ref = str(state.get("document_text")) or state.get("document_id" or "")
    
    if not doc_ref.strip():
        return{
            "analysis_result":{
                "error": "Duplicate detection failed: No document provided"
            }
        }
    result = await detect_dup(document_ref=doc_ref, threshold=0.92)
    
    
        


async def compare_document_node(state: DocAnalysisAgent):
    question = state.get("question", "Compare these two documents.")

    #resolves first doc
    doc_a = str(state.get("document_id") or state.get("document_text") or "")
    #resolve 2nd doc
    doc_b = str(state.get("compare_document_id")or state.get("compare_document_text") or "")

    result = await compare_documents(
        query=question,
        current_doc=doc_a,
        doc_compare=doc_b
    )


    if not result:
        return {"analysis_result": {"error":"Comparison failed: One or both documents could not be found or read."}}

    return {"analysis_result": result.model_dump()}

async def analyze_document_node(state: DocAnalysisAgent):
    question = state.get("question", "Perform a complete analysis of this document.")
    document_text = state.get("document_text", "")
    
    if not document_text.strip():
        return {"analysis_result": {"error": "Analysis failed: Document text is empty or could not be found"}}
    
    service= DocAnalysisService() #service initialization
    # result = await service.chain.ainvoke({"question":question}) 

    #Use the helper method service.analyze which passes both document_text and user_prompt
    result = await service.analyze(document_text=document_text, user_prompt=question)#run the chain to make the structured pydantic output

    #convert pydantic model to dictionary so it will be in stored state
    return {"analysis_result":result.model_dump()}

