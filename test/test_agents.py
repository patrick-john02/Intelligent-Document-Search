import asyncio
from agents.graph import app as agent_app

async def main():
    config = {"configurable": {"thread_id": "test-thread-1"}}

        # Test 1: Researcher ReAct Agent
    print("\n==========================================")
    print("TEST 1: RESEARCH QUERY (triggers researcher_agent)")
    print("==========================================")
    query_1 = {
        "question": "Search for any circular or policy about tax collection or real property tax.",
        "user_id": 1,
    }
    res1 = await agent_app.ainvoke(query_1, config=config)
    print(f"\n[Detected Intent]: {res1.get('intent')}")
    print(f"[Agent Used]: {res1.get('target_agent')}")
    print(f"\n[Final Response]:\n{res1.get('final_response')}")

    # Test 2: Document Analysis ReAct Agent
    print("\n==========================================")
    print("TEST 2: ANALYSIS QUERY (triggers doc_analysis_agent)")
    print("==========================================")
    query_2 = {
        "question": "Can you check if document 1 has duplicates in the system?",
        "user_id": 1,
    }
    res2 = await agent_app.ainvoke(query_2, config=config)
    print(f"\n[Detected Intent]: {res2.get('intent')}")
    print(f"[Agent Used]: {res2.get('target_agent')}")
    print(f"\n[Final Response]:\n{res2.get('final_response')}")

if __name__ == "__main__":
    asyncio.run(main())