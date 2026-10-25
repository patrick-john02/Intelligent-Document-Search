from datetime import datetime, timezone, timedelta

from langchain_core.messages import SystemMessage, ToolMessage, HumanMessage, trim_messages
from langchain_core.messages.utils import count_tokens_approximately
from langgraph.store.base import BaseStore

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


def _build_prompt(state: SupervisorState) -> str:
    prompt = SUPERVISOR_SYSTEM_PROMPT

    today = datetime.now(MANILA).strftime("%A, %B %d, %Y")
    prompt += f"\n\nToday is {today} (Philippine time). Resolve 'this year', 'last month', etc. from this date."

    profile = state.get("user_profile") or {}
    if profile.get("name"):
        prompt += (
            f"\nYou are assisting {profile['name']}, "
            f"{profile.get('position') or 'staff'} of {profile.get('office') or 'the office'}."
        )

    attachment_ids = state.get("attachment_ids") or []
    if attachment_ids:
        ids = ", ".join(map(str, attachment_ids))
        prompt += (
            f"\n\nDocuments attached in this conversation (oldest first): {ids}. "
            "When the user says 'this file' or 'the attachment', they usually mean the LAST one. "
            "Pass the relevant IDs to ask_doc_analyst."
        )
    return prompt


async def agent_node(state: SupervisorState, store: BaseStore):
    messages = state.get("messages", [])
    user_id = state.get("user_id")

    prompt = _build_prompt(state)

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

