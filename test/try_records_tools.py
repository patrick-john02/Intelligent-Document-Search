import asyncio
from api.models.enums.docs import CLEARANCE_ORDER
from tools.access.permissions import current_allowed_clearance
from tools.records.lookup import (
    find_records_tool, count_records_tool, get_record_details_tool, list_record_categories_tool,
)


async def main():
    current_allowed_clearance.set(list(CLEARANCE_ORDER.keys()))

    print("--- categories");  print(await list_record_categories_tool.ainvoke({}))
    print("--- find");        print(await find_records_tool.ainvoke({"limit": 3}))
    print("--- division");    print(await find_records_tool.ainvoke({"division": "accounting", "limit": 3}))
    print("--- count");       print(await count_records_tool.ainvoke({"group_by": "category"}))
    print("--- details");     print(await get_record_details_tool.ainvoke({"reference": "1"}))


asyncio.run(main())

# uv run python -m test.try_records_tools