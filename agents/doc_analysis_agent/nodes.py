#document analysis agent
from agents.doc_analysis_agent.state import DocAnalysisAgent
from agents.doc_analysis_agent.context import DocAnalysisService
#supervisor
from agents.state import IntentAgentState

#tools
from tools.analysis.compare import compare_documents

async def analyze_document_node(state: DocAnalysisAgent):
    question = state.get("question", "Perform a complete analysis of this document.")
    document_text = state.get("document_text", "")
    service= DocAnalysisService() #service initialization
    # result = await service.chain.ainvoke({"question":question}) 

    #Use the helper method service.analyze which passes both document_text and user_prompt
    result = await service.analyze(document_text=document_text, user_prompt=question)#run the chain to make the structured pydantic output

    #convert pydantic model to dictionary so it will be in stored state
    return {"analysis_result":result.model_dump()}

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
