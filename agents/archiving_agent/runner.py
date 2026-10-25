"""run_alon(): runs Alon on ONE document version and returns the result plus metrics.

Two steps:
  1. Investigate: the ReAct agent calls its tools and writes a plain-text findings report.
  2. Format: a small structured-output call converts that report into an ArchiveProposal.
     It tries json_schema first (model fills a JSON schema, no tool call needed, the most
     reliable on Groq), then falls back to function_calling.

Purpose: one entry point used by the Celery pipeline stage (step 4) and by tests.
Why it sets context variables: the tools read the version being archived and the uploader's
clearance from them, so the LLM can't choose another document or see documents above the
uploader's clearance.
Why it never raises: archiving must never block indexing. Failures come back as `error`
so the pipeline can mark the proposal as 'failed' and continue.
"""
import logging
import time
from dataclasses import dataclass, field
from typing import Optional

from langchain_core.callbacks import get_usage_metadata_callback
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.errors import GraphRecursionError

from core.configurations import chat_model
from tools.access.permissions import current_allowed_clearance
from tools.archiving.archive_tools import current_archive_version_id
from agents.archiving_agent.graph import doc_archiving_app
from agents.archiving_agent.schema import ArchiveProposal

logger = logging.getLogger(__name__)

ALON_STEP_LIMIT = 20  # each tool call is about 2 graph steps, so this allows ~8 tool calls + the report

FORMATTER_PROMPT = """You convert an archiving agent's findings report into an ArchiveProposal.
Rules:
- Copy values exactly from the report. Do not add, guess or improve anything.
- If the report says "none" or does not mention a field, leave it null (or an empty list).
- document_type must be one of the types named in the report.
- Keep the summary and issues as written in the report."""


@dataclass
class AlonResult:
    proposal: Optional[ArchiveProposal]
    error: Optional[str] = None
    elapsed_ms: float = 0.0
    tokens_used: int = 0
    tool_calls: list[str] = field(default_factory=list)  # which tools Alon used, in order
    findings: str = ""                                    # Alon's raw report (useful for debugging/audit)
    model_name: str = ""


def _model_name() -> str:
    return str(getattr(chat_model, "model_name", None) or getattr(chat_model, "model", None) or "unknown")


def _tokens(usage_cb) -> int:
    if not usage_cb:
        return 0
    return sum(int(u.get("total_tokens", 0)) for u in usage_cb.usage_metadata.values())


async def _format_proposal(findings: str) -> ArchiveProposal:
    """Step 2: findings text -> ArchiveProposal. json_schema first, function_calling as fallback."""
    messages = [SystemMessage(content=FORMATTER_PROMPT), HumanMessage(content=findings)]
    last_error: Optional[Exception] = None

    for method in ("json_schema", "function_calling"):
        try:
            formatter = chat_model.with_structured_output(ArchiveProposal, method=method)
            out = await formatter.ainvoke(messages)
            if isinstance(out, ArchiveProposal):
                return out
            if isinstance(out, dict):
                return ArchiveProposal.model_validate(out)
        except Exception as e:
            last_error = e
            logger.warning("[Alon] formatting with %s failed: %s", method, str(e)[:200])

    raise RuntimeError(f"Could not convert findings into an ArchiveProposal: {last_error}")


async def run_alon(document_version_id: int, clearance_levels: list[str]) -> AlonResult:
    started = time.perf_counter()
    version_token = current_archive_version_id.set(document_version_id)
    clearance_token = current_allowed_clearance.set([lvl.lower() for lvl in clearance_levels])

    usage_cb, tool_calls, findings = None, [], ""
    try:
        with get_usage_metadata_callback() as usage_cb:
            # Step 1: investigate (tools + reasoning) -> plain-text findings report
            result = await doc_archiving_app.ainvoke(
                {"messages": [HumanMessage(content=(
                    f"Archive the uploaded document (version {document_version_id}). "
                    "Follow your workflow and finish with your findings report."
                ))]},
                config={"recursion_limit": ALON_STEP_LIMIT},
            )
            messages = result.get("messages", [])
            tool_calls = [tc["name"] for m in messages for tc in (getattr(m, "tool_calls", None) or [])]
            findings = (messages[-1].text if messages else "").strip()
            if not findings:
                raise RuntimeError("Alon finished without writing a findings report.")

            # Step 2: format -> ArchiveProposal
            proposal = await _format_proposal(findings)

        return AlonResult(
            proposal=proposal,
            elapsed_ms=(time.perf_counter() - started) * 1000,
            tokens_used=_tokens(usage_cb),
            tool_calls=tool_calls,
            findings=findings,
            model_name=_model_name(),
        )

    except GraphRecursionError:
        logger.warning("[Alon] step limit reached (version %s)", document_version_id)
        error = "Alon reached its step limit before finishing."
    except Exception as e:
        logger.exception("[Alon] run failed (version %s)", document_version_id)
        error = f"{type(e).__name__}: {e}"[:500]
    finally:
        current_archive_version_id.reset(version_token)
        current_allowed_clearance.reset(clearance_token)

    return AlonResult(
        proposal=None,
        error=error,
        elapsed_ms=(time.perf_counter() - started) * 1000,
        tokens_used=_tokens(usage_cb),
        tool_calls=tool_calls,
        findings=findings,
        model_name=_model_name(),
    )