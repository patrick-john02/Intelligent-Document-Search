"""Manual check for Alon: runs the full agent on one existing document version.
Nothing is saved to the database (that is step 4).

Usage (from the project root):
    uv run python -m test.try_alon 27
"""
import asyncio
import sys

from agents.archiving_agent.runner import run_alon

ALL_LEVELS = ["public", "internal", "confidential", "secret", "top_secret"]


async def main(version_id: int) -> None:
    result = await run_alon(version_id, ALL_LEVELS)

    print(f"\nModel: {result.model_name}")
    print(f"Time: {result.elapsed_ms / 1000:.1f}s | Tokens: {result.tokens_used}")
    print(f"Tools used ({len(result.tool_calls)}): {', '.join(result.tool_calls) or 'none'}")

    if result.findings:
        print("\n=========== Alon's findings report (step 1) ===========")
        print(result.findings)

    if result.error:
        print(f"\nERROR: {result.error}")
        return

    print("\n=========== ArchiveProposal ===========")
    print(result.proposal.model_dump_json(indent=2))


if __name__ == "__main__":
    asyncio.run(main(int(sys.argv[1]) if len(sys.argv) > 1 else 1))