import asyncio
from langchain_core.messages import HumanMessage
from api.models.enums.docs import CLEARANCE_ORDER
from tools.access.permissions import current_allowed_clearance
from agents.records_agent.graph import records_app


async def main():
    current_allowed_clearance.set(list(CLEARANCE_ORDER.keys()))  # test with full clearance
    for q in [
        "How many documents were archived from 2026-11-01 to 2026-11-30, grouped by category?",
        "Where is DV-2024-00128 filed?",
        "List leave documents archived from 2026-07-01 to 2026-09-30 by Accounting division.",
    ]:
        result = await records_app.ainvoke({"messages": [HumanMessage(content=q)]})
        print(f"\nQ: {q}\nA: {result['messages'][-1].text}")


asyncio.run(main())



#uv run python -m test.try_mutya
