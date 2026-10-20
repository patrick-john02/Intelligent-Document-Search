from langchain.tools import tool
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableConfig


from agents.researcher_agent.graph import doc_searching_app
from agents.doc_analysis_agent.graph import doc_analysis_app



#run a sub-agent on a single self-contained task and returns its final answer.
async def _run_specialist(app, task:str, config: RunnableConfig, name: str)->str:
    try:
        result = await app.ainvoke({"messages": [HumanMessage(content=task)]}, config=config)
        messages = result.get("messages", [])
        answer = messages[-1].content if messages else ""
        return answer.strip() or f"The {name} returned no answer."
    except Exception as e:
        #returning the error as text so that the supervisor can explain it instead of crashing.
        return f"The {name} failed: {e}" 


@tool
async def ask_researcher(task: str, config: RunnableConfig) -> str:
    """Delegate to the Researcher agent. Use it to FIND documents in the archive or ANSWER
    questions from their contents (policies, circulars, vouchers, dates, amounts).
    `task` must be a complete, self-contained instruction: include document names, IDs,
    types or years mentioned earlier in the chat. The researcher cannot see the chat history."""
    return await _run_specialist(doc_searching_app, task, config, "researcher")


@tool
async def ask_doc_analyst(task: str, config: RunnableConfig) -> str:
    """Delegate to the Document Analysis agent. Use it to ANALYZE or SUMMARIZE a specific
    document, COMPARE two documents, or CHECK FOR DUPLICATES.
    `task` must name the document IDs or titles involved. If you do not know the IDs yet,
    call ask_researcher first to find them. The analyst cannot see the chat history."""
    return await _run_specialist(doc_analysis_app, task, config, "document analyst")


SUPERVISOR_TOOLS = [ask_researcher, ask_doc_analyst]

