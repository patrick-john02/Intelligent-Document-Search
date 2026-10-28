"""Read-only diagnosis: why doesn't the chat find my uploaded document, and is the AI reply saved?

Usage (project root, Postgres + Ollama running):
    uv run python -m test.diagnose_chat --user admin --q "words from your document title"
    uv run python -m test.diagnose_chat --user admin --q "..." --agent      # also runs the agent once (uses Groq)

Nothing is written to the database.
"""
import argparse
import asyncio

from sqlalchemy import text

from core.dependencies import SessionLocal
from core.security import get_user
from tools.access.permissions import get_user_clearance_levels, current_allowed_clearance
from tools.documents.search import (
    resolve_authorized_version_ids, search_documents, search_lexical_chunks,
)
from core.dependencies import deps


def h(title: str) -> None:
    print(f"\n{'=' * 10} {title} {'=' * 10}")


async def main(username: str, query: str, run_agent: bool) -> None:
    async with SessionLocal() as db:
        user = await get_user(db, username)
        if not user:
            print(f"User '{username}' not found"); return
        levels = [lvl.lower() for lvl in get_user_clearance_levels(user)]

        # ---- 1. Is the AI reply saved? (last conversation of this user) ----
        h("1. LAST CONVERSATION (are assistant replies saved?)")
        conv = (await db.execute(text(
            "SELECT id, title FROM conversation WHERE user_id = :u ORDER BY id DESC LIMIT 1"
        ), {"u": user.id})).first()
        if conv:
            print(f"conversation #{conv.id}: {conv.title}")
            rows = (await db.execute(text(
                "SELECT id, sender_type, left(content, 90) AS preview, created_at "
                "FROM chat_messages WHERE conversation_id = :c ORDER BY id"
            ), {"c": conv.id})).all()
            for r in rows:
                print(f"  #{r.id:<5} {r.sender_type:<10} {r.created_at}  {r.preview!r}")
            senders = [r.sender_type for r in rows]
            if senders.count("assistant") < senders.count("user"):
                print("  ⚠ fewer assistant messages than user messages → some replies were NOT saved")
        else:
            print("no conversations for this user")

        # ---- 2. Agent memory tables (dropped by the alembic incident?) ----
        h("2. LANGGRAPH TABLES")
        for t in ("checkpoints", "checkpoint_writes", "checkpoint_blobs", "store"):
            ok = (await db.execute(text("SELECT to_regclass(:t)"), {"t": t})).scalar()
            print(f"  {t:<20} {'OK' if ok else '❌ MISSING (restart backend to recreate)'}")

        # ---- 3. Latest uploads: are they really searchable? ----
        h("3. LATEST DOCUMENT VERSIONS")
        rows = (await db.execute(text("""
            SELECT dv.id, d.id AS doc_id, left(d.title, 40) AS title, dv.status, dv.is_current,
                   d.is_deleted, d.clearance_level::text AS clearance, dv.doc_type,
                   (SELECT count(*) FROM document_chunks c WHERE c.document_version_id = dv.id) AS chunks,
                   (SELECT count(*) FROM document_chunks c WHERE c.document_version_id = dv.id
                                                            AND c.search_vector IS NOT NULL) AS fts,
                   (SELECT count(*) FROM langchain_pg_embedding e
                     WHERE e.cmetadata->>'document_version_id' = dv.id::text) AS vectors
            FROM document_version dv JOIN documents d ON d.id = dv.document_id
            ORDER BY dv.id DESC LIMIT 6
        """))).all()
        authorized = set(await resolve_authorized_version_ids(levels))
        print(f"user '{username}' clearance levels: {levels}")
        print(f"authorized (searchable) versions for this user: {len(authorized)}")
        for r in rows:
            problems = []
            if r.status != "indexed": problems.append(f"status={r.status!r} (search needs 'indexed')")
            if not r.is_current: problems.append("not current version")
            if r.is_deleted: problems.append("document is soft-deleted")
            if r.clearance.lower() not in levels: problems.append(f"clearance {r.clearance} > user")
            if r.chunks == 0: problems.append("NO chunks")
            if r.vectors == 0: problems.append("NO vectors (dense search can't find it)")
            if r.fts == 0 and r.chunks: problems.append("no search_vector (lexical can't find it)")
            mark = "✅ searchable" if r.id in authorized and not problems else "❌ " + "; ".join(problems or ["not authorized"])
            print(f"  v{r.id} doc#{r.doc_id} {r.title!r:<42} chunks={r.chunks} fts={r.fts} vectors={r.vectors} → {mark}")

    # ---- 4. Does search find it? (same function the researcher uses) ----
    h(f"4. SEARCH for {query!r}")
    token = current_allowed_clearance.set(levels)
    try:
        ids = list(authorized)
        lexical = await search_lexical_chunks(query, top_k=5, authorized_version_ids=ids)
        print(f"lexical (FTS) hits: {len(lexical)}  {[x['file_name'] for x in lexical][:5]}")
        try:
            dense = await deps.vector_store.asimilarity_search_with_score(
                query=query, k=5, filter={"document_version_id": {"$in": ids}})
            print(f"dense (vector) hits: {len(dense)}  {[d.metadata.get('file_name') for d, _ in dense]}")
        except Exception as e:
            print(f"dense search FAILED: {type(e).__name__}: {e}  ← is Ollama running?")
        try:
            final = await search_documents(query=query, top_k=5)
            print(f"full hybrid + rerank: {len(final)}  {[x.get('file_name') for x in final]}")
        except Exception as e:
            print(f"full search FAILED: {type(e).__name__}: {e}")

        # ---- 5. Optional: run the whole agent once (non-streaming) ----
        if run_agent:
            h("5. AGENT RUN")
            from langchain_core.messages import HumanMessage
            from agents.graph import app as agent_app
            from agents.checkpointer import init_checkpointer, close_checkpointer
            await init_checkpointer()
            try:
                out = await agent_app.ainvoke(
                    {"messages": [HumanMessage(content=query)], "attachment_ids": [], "user_id": None},
                    config={"configurable": {"thread_id": "diagnose-chat"}, "recursion_limit": 20},
                )
                for m in out["messages"]:
                    calls = [tc["name"] + str(tc["args"]) for tc in (getattr(m, "tool_calls", None) or [])]
                    print(f"  [{type(m).__name__}] {calls or (m.text[:200] if m.text else '')!s}")
            finally:
                await close_checkpointer()
    finally:
        current_allowed_clearance.reset(token)


if __name__ == "__main__":
    import sys
    if sys.platform == "win32":
        # psycopg (agent checkpointer) can't use Windows' default ProactorEventLoop
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    ap = argparse.ArgumentParser()
    ap.add_argument("--user", default="admin")
    ap.add_argument("--q", required=True, help="a question / words that should find your uploaded document")
    ap.add_argument("--agent", action="store_true", help="also run the full agent once (uses Groq)")
    a = ap.parse_args()
    asyncio.run(main(a.user, a.q, a.agent))
