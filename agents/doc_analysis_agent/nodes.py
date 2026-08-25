#document analysis agent
from agents.doc_analysis_agent.state import DocAnalysisAgent
from agents.doc_analysis_agent.context import DocAnalysisService
#supervisor
from agents.state import IntentAgentState



async def target_agent_node(state:IntentAgentState):
    intent = state.get("intent", "unkown")
    result = f"Sub-agent handled the {intent} task successfully."
    return {"agent_result": result, "target_agent": f"{intent}_agent"}

async def analyze_document_node(state: DocAnalysisAgent):
    question = state.get("question", "")
    service= DocAnalysisService() #service initialization
    result = await service.chain.ainvoke({"question":question}) #run the chain to make the structured pydantic output

    #convert pydantic model to dictionary so it will be in stored state
    return {"analysis_result":result.model_dump()}



