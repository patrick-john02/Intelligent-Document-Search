import logging

from langchain.tools import tool
from langchain_core.messages import HumanMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from langgraph.errors import GraphRecursionError

from agents.researcher_agent.graph import doc_searching_app
from agents.doc_analysis_agent.graph import doc_analysis_app

logger = logging.getLogger(__name__)

SPECIALIST_STEP_LIMIT = 12


def _collect_sources(messages) -> list[dict]:
    """Gather structured sources (artifacts) from the sub-agent's tool calls, deduped by document + page."""
    seen, sources = set(), []
    for m in messages:
        if isinstance(m, ToolMessage) and isinstance(m.artifact, list):
            for s in m.artifact:
                key = (s.get("document_id"), s.get("page_number"))
                if s.get("document_id") and key not in seen:
                    seen.add(key)
                    sources.append(s)
    return sources


def _sources_footer(sources: list[dict]) -> str:
    if not sources:
        return ""
    lines = [
        f"- Document #{s['document_id']}: {s.get('file_name') or 'Untitled'}"
        + (f" (p. {s['page_number']})" if s.get("page_number") else "")
        for s in sources
    ]
    return "\n\nSources:\n" + "\n".join(lines)


# run a sub-agent on a single self-contained task; returns (answer text, sources)
async def _run_specialist(app, task: str, config: RunnableConfig, name: str) -> tuple[str, list[dict]]:
    try:
        result = await app.ainvoke(
            {"messages": [HumanMessage(content=task)]},
            config={**config, "recursion_limit": SPECIALIST_STEP_LIMIT},
        )
        messages = result.get("messages", [])
        answer = (messages[-1].text if messages else "").strip() or f"The {name} returned no answer."
        sources = _collect_sources(messages)
        return answer + _sources_footer(sources), sources

    except GraphRecursionError:
        logger.warning("[Supervisor] %s hit step limit. Task: %.200s", name, task)
        return (f"The {name} could not finish within its step limit. "
                "Do not retry the same task; ask the user to narrow the request."), []

    except Exception:
        logger.exception("[Supervisor] %s failed. Task: %.200s", name, task)
        return (f"The {name} is temporarily unavailable. "
                "Tell the user the request could not be completed and to try again later."), []


@tool(response_format="content_and_artifact")
async def ask_researcher(task: str, config: RunnableConfig) -> tuple[str, list[dict]]:
    """Delegate to the Researcher agent. Use it to FIND documents in the archive or ANSWER
    questions from their contents (policies, circulars, vouchers, dates, amounts).
    `task` must be a complete, self-contained instruction: include document names, IDs,
    types or years mentioned earlier in the chat. The researcher cannot see the chat history."""
    return await _run_specialist(doc_searching_app, task, config, "researcher")


@tool(response_format="content_and_artifact")
async def ask_doc_analyst(task: str, config: RunnableConfig) -> tuple[str, list[dict]]:
    """Delegate to the Document Analysis agent. Use it to ANALYZE or SUMMARIZE a specific
    document, COMPARE two documents, or CHECK FOR DUPLICATES.
    `task` must name the document IDs or titles involved. If you do not know the IDs yet,
    call ask_researcher first to find them. The analyst cannot see the chat history."""
    return await _run_specialist(doc_analysis_app, task, config, "document analyst")


SUPERVISOR_TOOLS = [ask_researcher, ask_doc_analyst]
