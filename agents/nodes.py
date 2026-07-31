from agents.state import IntentAgentState
from agents.context import classifier_service

# NOTE: In a real app, you would import the compiled graphs of your other agents here.
# from agents.leave_credits.graph import leave_credits_app
# from agents.doc_analysis.graph import doc_analysis_app

async def classify_intent_node(state: IntentAgentState):
    question = state["question"]

    detected_intent = await classifier_service.detect_intent(question)
    
    # LangGraph will take this dict and update the state automatically.
    return {"intent": detected_intent}

async def get_attachment_ids_node(state: IntentAgentState):
    new_ids = [1, 2, 3] 
    return {"attachment_ids": new_ids}

async def target_agent_node(state: IntentAgentState):
    # This acts as the supervisor delegating to a sub-agent
    intent = state.get("intent")
    result = f"Sub-agent handled the {intent} task successfully."
    return {"agent_result": result, "target_agent": f"{intent}_agent"}

async def ask_for_clarification_node(state: IntentAgentState):
    return {"final_response": "Could you clarify what you want to do?"}

async def reject_request_node(state: IntentAgentState):
    return {"final_response": "I cannot fulfill this request."}

async def generated_answer_node(state: IntentAgentState):
    # Combines the agent result into a final user-facing string
    result = state.get("agent_result")
    final = f"Here is your answer: {result}"
    return {"final_response": final}