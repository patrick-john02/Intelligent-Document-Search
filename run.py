"""Start the backend with an event loop that works on Windows.

Why: on Windows, plain `uvicorn main:app` uses the ProactorEventLoop, and psycopg
(used by the LangGraph Postgres checkpointer = agent memory) cannot run on it.
The agent then hangs waiting for the database and chat replies are never saved.
With `--reload`, uvicorn happens to use a SelectorEventLoop, which works.
This script always uses the SelectorEventLoop on Windows (Linux/Docker are unaffected).

Usage:  uv run python run.py            (add --reload for auto-restart on code changes)
"""
import asyncio
import sys

import uvicorn

if __name__ == "__main__":
    reload = "--reload" in sys.argv

    if reload:
        # uvicorn's reloader runs the app in a subprocess with a SelectorEventLoop already
        uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
    else:
        if sys.platform == "win32":
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        server = uvicorn.Server(uvicorn.Config("main:app", host="127.0.0.1", port=8000))
        asyncio.run(server.serve())   # serve() directly, so uvicorn doesn't pick the Proactor loop
