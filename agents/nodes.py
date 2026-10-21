from langchain_core.messages import SystemMessage, trim_messages
from langgraph.store.base import BaseStore
from core.configurations import chat_model
# from tools.registry import ALL_TOOLS
from agents.state import SupervisorState
from agents.supervisor_tools import SUPERVISOR_TOOLS
from agents.context import SUPERVISOR_SYSTEM_PROMPT


model_with_tools = chat_model.bind_tools(SUPERVISOR_TOOLS, parallel_tool_calls=False)


async def agent_node(state: SupervisorState, store: BaseStore):
    messages = state.get("messages", [])
    user_id = state.get("user_id")
    attachment_ids = state.get("attachment_ids") or []
    
    prompt = SUPERVISOR_SYSTEM_PROMPT
    
    if attachment_ids:
        ids = ", ".join(map(str, attachment_ids))
        prompt += (
            f"\n\nThe user attached documents with IDs: {ids}. "
            "When they say 'this file' or 'the attachment', pass these IDs to ask_doc_analyst."
        )

    if user_id:
        pref_item = await store.aget(("users", str(user_id)), "preferences") #this can be configure, what will be the user preferences, preffered response, preferred departments.
        if pref_item and pref_item.value:
            prompt += f"\n\nUser Preferences: {pref_item.value}"
            
       
    recent = trim_messages(
        messages,
        strategy="last",
        token_counter=len, # count messages, not tokens 
        max_tokens=20, # keep last 20 messages
        start_on="human", # never start on a dangling tool result
    )

    response = await model_with_tools.ainvoke([SystemMessage(content=prompt)] + recent)

    updates = {"messages": [response]}

    if not response.tool_calls:
        updates["final_response"] = response.content
    
    # LangGraph will take this dict and update the state automatically.
    return updates



















# async def classify_intent_node(state: IntentAgentState, store: BaseStore):
#     question = state.get("question", "")
#     user_id = state.get("user_id")

#     user_preferences = {} 

#     if user_id:
#         user_namespace = ("users", str(user_id))
#         pref_item = await store.aget(user_namespace, "preferences") #this can be configure, what will be the user preferences, preffered response, preferred departments.
#         if pref_item and pref_item.value:
#             user_preferences = pref_item.value

#     #grab the question from state or the last message in the history
#     if not question and state.get("messages"):
#         question = state["messages"][-1].content

#     detected_intent = await classifier_service.detect_intent(question)
    
#     # LangGraph will take this dict and update the state automatically.
#     return {"intent": detected_intent}


# async def get_attachment_ids_node(state: IntentAgentState):
#     existing_id = state.get("attachment_ids", [])
#     return {"attachment_ids": existing_id}


# async def call_doc_analysis_node(state:IntentAgentState, store: BaseStore):
#     question = state.get("question", "")
#     doc_ids = state.get("mentioned_document_ids", [])
    
#     prompt = question
#     if doc_ids:
#         first_doc_id = str(doc_ids[0])
#         doc_namespace = ("documents", first_doc_id)
#         cached_analysis = await store.aget(doc_namespace, "analysis_summary")

#         if cached_analysis and cached_analysis.value:
#             return{
#                 "target_agent": "doc_analysis_agent",
#                 "agent_result": f"[From Cache] {cached_analysis.value.get('summary')}"
#             }

#     prompt = question
#     if doc_ids:
#         prompt += f" (Referenced Document IDs: {', '.join(map(str, doc_ids))})"

#     input_messages=state.get("messages", []) or [HumanMessage(content=prompt)]    
#     sub_result = await doc_analysis_app.ainvoke({
#         "messages":input_messages
#     })

    
#     messages = sub_result.get("messages", [])
#     final_text = messages[-1].content if messages else "Analysis could not be completed."

#     if doc_ids:
#         first_doc_id = str(doc_ids[0])
#         doc_namespace = ("documents", first_doc_id)
#         await store.aput(doc_namespace,"analysis_summary", {"summary": final_text})
    
#     return {
#         "target_agent":"doc_analysis_agent",
#         "agent_result":final_text
#     }


# async def call_researcher_node(state:IntentAgentState):
#     question = state.get("question", "")

#     #pass full conversation message so researcher understands follow-ups like "summrize it"
#     input_messages = state.get("messages", []) or [HumanMessage(content=question)]

#     sub_result = await doc_searching_app.ainvoke({
#         # "messages":[{"role":"user","content":question}]

#         "messages": input_messages
#     })

    
#     messages = sub_result.get("messages", [])
#     final_text=messages[-1].content if messages else "No relevant information found."
    
#     return {
#         "target_agent": " researcher_agent",
#         "agent_result": final_text
#     }

# async def call_reporting_node(state: IntentAgentState):
#     return{
#         "target_agent": "reporting_agent",
#         "agent_result":"Attachment processing is currently being prepared."
#     }

# async def generated_answer_node(state: IntentAgentState):
#     # Combines the agent result into a final user-facing string
#     result = state.get("agent_result", "No answer generated")
#     # final = f"Here is your answer: {result}"

#     #return both final_response string and append in AIMessage to the chathistory
#     return {"final_response": result, "messages": [AIMessage(content=result)]}


# async def ask_for_clarification_node(state: IntentAgentState):
#     msg = "Could you clarify what you want to do?"
#     return{
#         "final_response": msg,
#         "messages":[AIMessage(content=msg)]
#     }


# async def reject_request_node(state: IntentAgentState):
#     msg = "I cannot fullfill this request."
#     return{
#         "final_response": msg,
#         "messages": [AIMessage(content=msg)]
#     }

