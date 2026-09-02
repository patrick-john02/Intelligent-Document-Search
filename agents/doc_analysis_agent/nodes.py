#document analysis agent
from agents.doc_analysis_agent.state import DocAnalysisAgent
from agents.doc_analysis_agent.context import DocAnalysisService
#supervisor
from agents.state import IntentAgentState

async def analyze_document_node(state: DocAnalysisAgent):
    question = state.get("question", "Perform a complete analysis of this document.")
    document_text = state.get("document_text", "")
    service= DocAnalysisService() #service initialization
    # result = await service.chain.ainvoke({"question":question}) 

    #Use the helper method service.analyze which passes both document_text and user_prompt
    result = await service.analyze(document_text=document_text, user_prompt=question)#run the chain to make the structured pydantic output

    #convert pydantic model to dictionary so it will be in stored state
    return {"analysis_result":result.model_dump()}


