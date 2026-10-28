from datetime import datetime, timezone, timedelta

from langchain_core.messages import SystemMessage, ToolMessage, HumanMessage, trim_messages
from langchain_core.messages.utils import count_tokens_approximately
from langgraph.store.base import BaseStore
from sqlalchemy import select

from api.models.document import DocumentModel, DocumentVersion
from core.dependencies import SessionLocal
from tools.access.permissions import clearance_filter

from core.configurations import chat_model
from agents.state import SupervisorState
from agents.supervisor_tools import SUPERVISOR_TOOLS
from agents.context import SUPERVISOR_SYSTEM_PROMPT


model_with_tools = chat_model.bind_tools(SUPERVISOR_TOOLS, parallel_tool_calls=False)

MANILA = timezone(timedelta(hours=8))   # fixed offset, no tzdata needed (Windows-safe)
HISTORY_TOKEN_BUDGET = 6000             # tune to the model's context window / Groq TPM limit
OLD_TOOL_RESULT_CHARS = 1500            # specialist results from earlier turns get shortened to this
MAX_SPECIALIST_CALLS = 4                # per user request


def _last_human_index(messages) -> int:
    return max((i for i, m in enumerate(messages) if isinstance(m, HumanMessage)), default=-1)


def _shorten_old_tool_results(messages):
    """Shorten ToolMessages from PREVIOUS turns (only in what we send to the model). The current turn stays full."""
    last_human = _last_human_index(messages)
    out = []
    for i, m in enumerate(messages):
        if i < last_human and isinstance(m, ToolMessage) and len(m.text) > OLD_TOOL_RESULT_CHARS:
            m = m.model_copy(update={"content": m.text[:OLD_TOOL_RESULT_CHARS] + "\n[...earlier result shortened]"})
        out.append(m)
    return out


async def _load_targets(attachment_ids: list[int]) -> list[tuple[int, str, str]]:
    """(id, title, file_name) for the documents the user targeted with @, in the order they were added.
    Clearance-filtered (current_allowed_clearance is set per request), so nothing above the user leaks."""
    if not attachment_ids:
        return []
    try:
        async with SessionLocal() as session:
            rows = (await session.execute(
                select(DocumentModel.id, DocumentModel.title, DocumentVersion.file_name)
                .join(DocumentVersion, DocumentVersion.document_id == DocumentModel.id)
                .where(
                    DocumentModel.id.in_(attachment_ids),
                    DocumentModel.is_deleted.is_(False),
                    DocumentVersion.is_current.is_(True),
                    clearance_filter(),
                )
            )).all()
    except Exception:
        return [(i, "", "") for i in attachment_ids]   # fall back to IDs only
    by_id = {r.id: (r.id, r.title, r.file_name) for r in rows}
    return [by_id[i] for i in attachment_ids if i in by_id]


def _build_prompt(
        state:SupervisorState,
        targets: list[tuple[int, str, str]] | None = None,
        earlier: list[tuple[int, str, str]] | None = None,
)->str:
    
    prompt = SUPERVISOR_SYSTEM_PROMPT

    today = datetime.now(MANILA).strftime("%A, %B %d, %Y")
    prompt += f"\n\nToday is {today} (Philippine time). Resolve 'this year', 'last month', etc. from this date."

    profile = state.get("user_profile") or {}
    if profile.get("name"):
        prompt += (
            f"\nYou are assisting {profile['name']}, "
            f"{profile.get('position') or 'staff'} of {profile.get('office') or 'the office'}."
        )

    if targets:
        listed = "\n".join(
            f"- #{doc_id} \"{title}\" ({file_name})" if title else f"- #{doc_id}"
            for doc_id, title, file_name in targets
        )
        ids = ", ".join(str(t[0]) for t in targets)
        prompt += (
            f"\n\nThe user targeted these documents with @ (oldest first, newest last):\n{listed}\n"
            "When documents are targeted, answer ONLY from them:\n"
            f"- to summarize, analyze, compare or check duplicates, call ask_doc_analyst with these document IDs ({ids});\n"
            f"- to find a specific fact inside them, call ask_researcher and tell it to search ONLY document IDs {ids}.\n"
            "'This file' or 'the attachment' usually means the LAST one. "
            "If the answer is not in the targeted documents, say so instead of using other documents."
        )

    # def _list(docs):
    #     return "\n".join(
    #         f"- #{doc_id} \"{title}\"
    #     )
    
    return prompt


async def agent_node(state: SupervisorState, store: BaseStore):
    messages = state.get("messages", [])
    user_id = state.get("user_id")


    targets = await _load_targets(state.get("attachment_ids") or [])   # titles, not just IDs
    earlier_ids = [i for i in (state.get("attachment_ids")or []) if i not in (state.get("target_ids") or [])]
    earlier = await _load_targets(earlier_ids)
    prompt = _build_prompt(state, targets)

    if user_id:
        # user preferences (preferred response style, departments, ...) — persisted in Postgres store
        pref_item = await store.aget(("users", str(user_id)), "preferences")
        if pref_item and pref_item.value:
            prompt += f"\n\nUser Preferences: {pref_item.value}"

    recent = trim_messages(
        _shorten_old_tool_results(messages),
        strategy="last",
        token_counter=count_tokens_approximately,   # real (approximate) tokens, not message count
        max_tokens=HISTORY_TOKEN_BUDGET,
        start_on="human",                           # never start on a dangling tool result
    )

    # Guardrail: cap specialist calls per request, then force a final answer
    calls_this_turn = sum(
        1 for m in messages[_last_human_index(messages) + 1:] if isinstance(m, ToolMessage)
    )
    if calls_this_turn >= MAX_SPECIALIST_CALLS:
        final_prompt = prompt + (
            "\n\nYou have reached the specialist-call limit for this request. "
            "Answer NOW using only the results above, and say clearly what could not be found."
        )
        # plain model, no tools bound -> it cannot call another specialist
        response = await chat_model.ainvoke([SystemMessage(content=final_prompt)] + recent)
        # return {"messages": [AIMessage(content=response.text)]}
        return {"messages": [response]}

    response = await model_with_tools.ainvoke([SystemMessage(content=prompt)] + recent)
    return {"messages": [response]}

