from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.store.base import BaseStore
from core.configurations import chat_model
from tools.registry import ALL_TOOLS
from agents.state import IntentAgentState



model_with_tools = chat_model.bind_tools(ALL_TOOLS)



SUPERVISOR_SYSTEM_PROMPT = """You are an intelligent Document Research and Analaysis Assistant.
You have access to the following specialized tools:
1. `search_documents`: Search internal documents, circulars, and policies by keywords or semantic queries.
2. `fetch_document_content`: Retrieve full text contentn of a specific document by its ID or title.
3. `compare_documents`: Perform an in-depth comparison between two documents to find similarities, differences and unique points.
4. `detect_duplicates`: Check if a document has exact binary hash or semantic duplicates in the database.


Operational Guidelines:
-Analyze the user request step-by-step.
- Call tools whenever you need to find, read, compare, or verify documents.
- You can multiple tools in sequence (e.g. search for a document first, fetch its full content, then compare it).
- If the user's request is ambiguous or lacks necessary references, politely ask for clarification.
- Synthesize clear , well-formatted markdown answers based on the tool observations.
"""

async def agent_node(state: IntentAgentState, store: BaseStore):
    messages = state.get("question", "")
    user_id = state.get("user_id")

    user_preferences = {} 

    if user_id:
        user_namespace = ("users", str(user_id))
        pref_item = await store.aget(user_namespace, "preferences") #this can be configure, what will be the user preferences, preffered response, preferred departments.
        if pref_item and pref_item.value:
            user_preferences = f"\nUser Preferences: {pref_item.value}"

    #grab the question from state or the last message in the history
    if not messages or not isinstance(messages[0], SystemMessage):
        full_prompt = SUPERVISOR_SYSTEM_PROMPT + user_preferences
        messages = [SystemMessage(content=full_prompt)] + messages

    response = await model_with_tools.ainvoke(messages)

    updates = {"message":[response]}

    if not getattr(response, "tool_calls", None):
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

