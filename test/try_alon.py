"""Manual check for Alon: runs the full agent on one existing document version.

Usage (from the project root):
    uv run python -m test.try_alon 27          # run only, nothing saved
    uv run python -m test.try_alon 27 --save   # run AND save to archive_proposals + agent_executions
"""
import asyncio
import sys

from agents.archiving_agent.runner import run_alon
from rag.archive_store import get_uploader_clearance, save_alon_result


async def main(version_id: int, save: bool) -> None:
    levels = await get_uploader_clearance(version_id)   # same clearance the pipeline uses
    print(f"Uploader clearance: {levels}")

    result = await run_alon(version_id, levels)

    print(f"\nModel: {result.model_name}")
    print(f"Time: {result.elapsed_ms / 1000:.1f}s | Tokens: {result.tokens_used}")
    print(f"Tools used ({len(result.tool_calls)}): {', '.join(result.tool_calls) or 'none'}")

    if result.findings:
        print("\n=========== Alon's findings report (step 1) ===========")
        print(result.findings)

    if result.error:
        print(f"\nERROR: {result.error}")
    else:
        print("\n=========== ArchiveProposal (step 2) ===========")
        print(result.proposal.model_dump_json(indent=2))

    if save:
        proposal_id = await save_alon_result(version_id, result)
        print(f"\nSaved: archive_proposals.id = {proposal_id} "
              f"({'pending' if result.proposal else 'failed'})")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    asyncio.run(main(int(args[0]) if args else 1, "--save" in sys.argv))