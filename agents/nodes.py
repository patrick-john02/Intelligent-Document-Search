#document analysis agent
from agents.doc_analysis_agent.graph import doc_analysis_app
from agents.researcher_agent.graph import doc_searching_app
from langchain_core.messages import HumanMessage, AIMessage



from agents.state import IntentAgentState
from agents.context import classifier_service

# NOTE: In a real app, you would import the compiled graphs of your other agents here.
# from agents.leave_credits.graph import leave_credits_app
# from agents.doc_analysis.graph import doc_analysis_app

async def classify_intent_node(state: IntentAgentState):
    question = state["question", ""]

    if not question and state.get("messages"):
        #grab the question from state or the last message in the history
        question = state["messages"][-1].content

    detected_intent = await classifier_service.detect_intent(question)
    
    # LangGraph will take this dict and update the state automatically.
    return {"intent": detected_intent}


async def get_attachment_ids_node(state: IntentAgentState):
    existing_id = state.get("attachment_ids", [])
    return {"attachment_ids": existing_id}


async def call_doc_analysis_node(state:IntentAgentState):
    question = state.get("question", "")
    doc_ids = state.get("mentioned_document_ids", [])
    
    prompt = question
    if doc_ids:
        prompt += f" (Referenced Document IDs: {', '.join(map(str, doc_ids))})"
        
    sub_result = await doc_analysis_app.ainvoke({
        # "messages":[{"role": "user", "content":prompt}]

        #pass the question of messge hisotry to the sub agent 
        "message":state.get("message", []) or [HumanMessage(content=prompt)]
    })

    
    messages = sub_result.get("messages", [])
    final_text = messages[-1].content if messages else "Analysis could not be completed."
    
    
    return {
        "target_agent":"doc_analysis_agent",
        "agent_result":final_text
    }


async def call_researcher_node(state:IntentAgentState):
    question = state.get("question", "")

    #pass full conversation message so researcher understands follow-ups like "summrize it"
    input_messages = state.get("messages", []) or [HumanMessage(content=question)]

    sub_result = await doc_searching_app.ainvoke({
        # "messages":[{"role":"user","content":question}]

        "messages": input_messages
    })

    
    messages = sub_result.get("messages", [])
    final_text=messages[-1].content if messages else "No relevant information found."
    
    return {
        "target_agent": " researcher_agent",
        "agent_result": final_text
    }

async def call_reporting_node(state: IntentAgentState):
    return{
        "target_agent": "reporting_agent",
        "agent_result":"Attachment processing is currently being prepared."
    }

async def generated_answer_node(state: IntentAgentState):
    # Combines the agent result into a final user-facing string
    result = state.get("agent_result", "No answer generated")
    # final = f"Here is your answer: {result}"

    #return both final_response string and append in AIMessage to the chathistory
    return {"final_response": result, "message": [AIMessage(content=result)]}


async def ask_for_clarification_node(state: IntentAgentState):
    msg = "Could you clarify what you want to do?"
    return{
        "final_response": msg,
        "messages":[AIMessage(content=msg)]
    }


async def reject_request_node(state: IntentAgentState):
    msg = "I cannot fullfill this request."
    return{
        "final_response": msg,
        "messages": [AIMessage(content=msg)]
    }

