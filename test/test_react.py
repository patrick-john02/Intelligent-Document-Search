import asyncio
from agents.graph import app as agent_app

async def main():
    # Test 1: Testing Researcher ReAct Agent
    print("\n--- TEST 1: RESEARCH QUERY ---")
    query_1 = {"question": "Find any memorandum or circular regarding real property tax"}
    config = {"configurable": {"thread_id": "test-session-1"}}
    res1 = await agent_app.ainvoke(query_1, config=config)
    print("Agent Result:\n", res1.get("final_response"))

        # Test 2: Testing Document Analysis ReAct Agent
    print("\n--- TEST 2: ANALYSIS / DUPLICATE QUERY ---")
    query_2 = {"question": "Can you check if document 1 has any duplicates in the database?"}
    config = {"configurable": {"thread_id": "test-session-2"}}
    res2 = await agent_app.ainvoke(query_2, config=config)
    print("Agent Result:\n", res2.get("final_response"))

if __name__ == "__main__":
    asyncio.run(main())