import asyncio
import uuid
from langchain_core.messages import HumanMessage
from api.models.enums.docs import CLEARANCE_ORDER
from tools.access.permissions import current_allowed_clearance
from agents.graph import app


async def main():
    current_allowed_clearance.set(list(CLEARANCE_ORDER.keys()))
    config = {"configurable": {"thread_id": f"test-{uuid.uuid4()}"}}

    questions = [
        "How many documents were archived this month, per category?",
        "Where is document #1 filed?",
        "Who uploaded it, and which version is current?",          # follow-up: tests history rewrite
        "What does document #1 say about its purpose?",             # should go to researcher/analyst, NOT Mutya
    ]
    for q in questions:
        result = await app.ainvoke({"messages": [HumanMessage(content=q)]}, config=config)
        new_calls = [
            c["name"] for m in result["messages"][-6:] for c in (getattr(m, "tool_calls", None) or [])
        ]
        print(f"\nQ: {q}\nDatu called: {new_calls}\nA: {result['messages'][-1].text}")


asyncio.run(main())

#uv run python -m test.try_datu_records