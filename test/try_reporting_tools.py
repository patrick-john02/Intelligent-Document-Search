import asyncio
from datetime import date
from api.models.enums.docs import CLEARANCE_ORDER
from tools.access.permissions import current_allowed_clearance
from tools.reporting.reporting_tools import (
    archive_activity_summary_tool, review_queue_status_tool, list_attention_items_tool,
)


async def main():
    current_allowed_clearance.set(list(CLEARANCE_ORDER.keys()))
    today = date.today()

    print("--- today");      print(await archive_activity_summary_tool.ainvoke({"date_from": str(today), "date_to": str(today)}))
    print("--- this month"); print(await archive_activity_summary_tool.ainvoke({"date_from": str(today.replace(day=1)), "date_to": str(today)}))
    print("--- backlog");    print(await review_queue_status_tool.ainvoke({}))
    for kind in ["pending_review", "classification_review", "low_ocr", "missing_shelf"]:
        print(f"--- {kind}"); print(await list_attention_items_tool.ainvoke({"kind": kind, "limit": 5}))


asyncio.run(main())