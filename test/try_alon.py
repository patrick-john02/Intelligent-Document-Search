"""Manual check for Alon: runs the archiving agent on one existing document version.

Usage (from the project root):
    uv run python -m test.try_alon 27                    # run Alon only, nothing saved
    uv run python -m test.try_alon 27 --classify         # re-run TF-IDF + SetFit first, then Alon
    uv run python -m test.try_alon 27 --classify --save  # re-classify, run Alon, and save proposal
    uv run python -m test.try_alon 27 --fast-path        # test ALON_FAST_PATH=true (0 LLM tokens if clean)
"""
import asyncio
import os
import sys

from agents.archiving_agent.runner import run_alon
from rag.archive_store import get_uploader_clearance, save_alon_result


async def main(version_id: int, save: bool, reclassify: bool, fast_path: bool) -> None:
    if reclassify:
        from rag.pipeline import _classify
        print(f"Re-running ML classification (TF-IDF + SetFit) for version {version_id}...")
        await _classify(version_id)

    if fast_path:
        os.environ["ALON_FAST_PATH"] = "true"

    levels = await get_uploader_clearance(version_id)   # same clearance the pipeline uses
    print(f"Uploader clearance: {levels}")

    result = await run_alon(document_version_id=version_id, clearance_levels=levels)

    print(f"\nModel: {result.model_name}")
    print(f"Time: {result.elapsed_ms / 1000:.1f}s | Tokens: {result.tokens_used}")
    print(f"Investigative tools used ({len(result.tool_calls)}): {', '.join(result.tool_calls) or 'none (dossier was sufficient)'}")

    if result.findings:
        print("\n=========== Alon's findings report ===========")
        print(result.findings)

    if result.error:
        print(f"\nERROR: {result.error}")
    else:
        print("\n=========== ArchiveProposal ===========")
        print(result.proposal.model_dump_json(indent=2))

    if save:
        proposal_id = await save_alon_result(version_id, result)
        print(f"\nSaved: archive_proposals.id = {proposal_id} "
              f"({'pending' if result.proposal else 'failed'})")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    asyncio.run(
        main(
            version_id=int(args[0]) if args else 1,
            save="--save" in sys.argv,
            reclassify="--classify" in sys.argv,
            fast_path="--fast-path" in sys.argv,
        )
    )
