"""run_alon(): Hybrid Pre-Fetch + Targeted ReAct + Deterministic Guardrails for ONE document version.

Pipeline:
  1. Pre-fetch (Python, 0 tokens): gathers upload overview, TF-IDF + SetFit ML votes,
     Page 1 text (plus Page 2 if sparse), duplicate matches, and top 5 similar archived docs.
  2. Optional ML Fast-Path (when ALON_FAST_PATH=true and allow_fast_path=True):
     skips the LLM completely (0 tokens) for clean, confident `auto_assigned` docs.
  3. Targeted ReAct Investigate: Alon receives the dossier and calls `read_pages` or
     `find_similar_archived` ONLY when more evidence is needed, then writes a findings report.
  4. Structured Format + Hard Python Guardrails: converts the report into `ArchiveProposal`
     and deterministically enforces human-verified lock, duplicate list, classifier agreement,
     system issues, and the `needs_human_review` safety floor.

Why it never raises: archiving must never block indexing. Failures come back as `error`
so the pipeline can mark the proposal as 'failed' and continue.
"""
from __future__ import annotations

import logging
import os
import re
import time
from dataclasses import dataclass, field
from typing import Optional

from langchain_core.callbacks import get_usage_metadata_callback
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.errors import GraphRecursionError

from core.configurations import chat_model
from rag.classification.labels import DOC_TYPES
from tools.access.permissions import current_allowed_clearance
from tools.archiving.archive_tools import (
    LOW_OCR_THRESHOLD,
    ArchiveDossier,
    build_archive_dossier,
    current_archive_version_id,
)
from agents.archiving_agent.graph import doc_archiving_app
from agents.archiving_agent.schema import ArchiveProposal, DuplicateWarning

logger = logging.getLogger(__name__)

# Allows up to ~3 investigative tool calls + the findings report (common case uses 0 tool calls)
ALON_STEP_LIMIT = 10

PLACEHOLDER_VALUES = {
    "", "test", "testing", "sample", "asdf", "qwerty", "n/a", "na", "none",
    "null", "untitled", "document", "doc", "file", "pdf", "scan", "temp", "tmp",
    "123", "1234", "12345", "xxx", "tbd",
}

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
    tool_calls: list[str] = field(default_factory=list)  # which investigative tools Alon chose to call
    findings: str = ""                                    # Alon's raw report (useful for debugging/audit)
    model_name: str = ""


def _fast_path_enabled() -> bool:
    return os.getenv("ALON_FAST_PATH", "false").strip().lower() in {"1", "true", "yes"}


def _model_name() -> str:
    return str(getattr(chat_model, "model_name", None) or getattr(chat_model, "model", None) or "unknown")


def _tokens(usage_cb) -> int:
    if not usage_cb:
        return 0
    return sum(int(u.get("total_tokens", 0)) for u in usage_cb.usage_metadata.values())


def _is_placeholder_title(title: str) -> bool:
    cleaned = re.sub(r"[^a-z0-9/]+", " ", (title or "").strip().lower()).strip()
    return len(cleaned) < 4 or cleaned in PLACEHOLDER_VALUES or cleaned.isdigit()


def _can_use_fast_path(dossier: ArchiveDossier) -> bool:
    """True when ML + deterministic checks are completely clean and need no LLM review."""
    if not dossier.has_extraction:
        return False
    if dossier.ocr_score is not None and dossier.ocr_score < LOW_OCR_THRESHOLD:
        return False
    if dossier.duplicates or dossier.skipped_checks:
        return False
    if _is_placeholder_title(dossier.upload_title):
        return False

    label = dossier.human_verified_label or dossier.ml_label
    if not label or label not in DOC_TYPES or label == "other":
        return False

    return bool(dossier.human_verified_label or dossier.ml_status == "auto_assigned")


def _build_fast_path_proposal(dossier: ArchiveDossier) -> ArchiveProposal:
    label = dossier.human_verified_label or dossier.ml_label or "other"
    confidence = 1.0 if dossier.human_verified_label else dossier.ml_confidence
    votes = ", ".join(dossier.ml_tier_votes) or "ensemble"
    reason = (
        f"Human-verified document type ({label})."
        if dossier.human_verified_label
        else f"Auto-assigned by ML classifier ({votes}) with confidence {confidence:.2f}."
    )
    shelf_reason = (
        f"Used by {dossier.top_shelf_count} similar archived document(s)."
        if dossier.top_shelf_location
        else None
    )
    return ArchiveProposal(
        title=dossier.upload_title.strip() or dossier.file_name or f"Document Version {dossier.document_version_id}",
        document_type=label,
        document_type_confidence=confidence,
        document_type_reason=reason,
        agrees_with_classifier=True,
        suggested_new_type=None,
        series_year=dossier.upload_series_year,
        department_order=dossier.upload_department_order,
        key_fields=[],
        suggested_shelf_location=dossier.top_shelf_location,
        shelf_location_reason=shelf_reason,
        duplicates=[],
        summary=f"Auto-archived {label.replace('_', ' ')} document ({dossier.file_name}) classified by ML fast-path.",
        issues=[],
        needs_human_review=False,
    )


def _has_issue_keyword(issues: list[str], *keywords: str) -> bool:
    joined = " ".join(issues).lower()
    return any(k.lower() in joined for k in keywords)


def _apply_guardrails(proposal: ArchiveProposal, dossier: ArchiveDossier) -> ArchiveProposal:
    """Enforce deterministic archive policy rules on top of the LLM / fast-path proposal."""
    updates: dict = {}
    issues = list(proposal.issues)

    # 1. Never override a human-verified document type
    doc_type = proposal.document_type
    if dossier.human_verified_label and dossier.human_verified_label in DOC_TYPES:
        doc_type = dossier.human_verified_label
        updates["document_type"] = doc_type
        updates["document_type_confidence"] = 1.0

    # 2. Deterministic duplicate warnings (LLM cannot drop or fabricate duplicates)
    deterministic_dups = [DuplicateWarning(**d) for d in dossier.duplicates]
    updates["duplicates"] = deterministic_dups
    if deterministic_dups and not _has_issue_keyword(issues, "duplicate"):
        issues.append(f"Possible duplicate(s) detected ({len(deterministic_dups)} match(es)).")

    # 3. Deterministic system issues
    if not dossier.has_extraction and not _has_issue_keyword(issues, "extract", "empty", "unreadable"):
        issues.append("No extracted text found for this document.")
    if (
        dossier.ocr_score is not None
        and dossier.ocr_score < LOW_OCR_THRESHOLD
        and not _has_issue_keyword(issues, "ocr")
    ):
        issues.append(f"Low OCR quality ({dossier.ocr_score:.2f} < {LOW_OCR_THRESHOLD:.2f}).")
    for skipped in dossier.skipped_checks:
        if not _has_issue_keyword(issues, skipped, "skipped"):
            issues.append(f"Check skipped: {skipped}.")

    # 4. Deterministic classifier agreement
    agrees = proposal.agrees_with_classifier
    if dossier.ml_label:
        agrees = doc_type == dossier.ml_label
        updates["agrees_with_classifier"] = agrees
        if not agrees and not dossier.human_verified_label and not _has_issue_keyword(issues, "disagree", "classifier"):
            issues.append(
                f"Alon proposed '{doc_type}' while ML classifier predicted '{dossier.ml_label}' "
                f"({dossier.ml_confidence:.2f})."
            )

    updates["issues"] = issues

    # 5. Mandatory `needs_human_review` safety floor
    confidence = updates.get("document_type_confidence", proposal.document_type_confidence)
    must_review = (
        bool(issues)
        or bool(deterministic_dups)
        or doc_type == "other"
        or (not dossier.human_verified_label and (
            not agrees
            or dossier.ml_status != "auto_assigned"
            or confidence < 0.80
        ))
    )
    updates["needs_human_review"] = proposal.needs_human_review or must_review

    return proposal.model_copy(update=updates)


async def _format_proposal(findings: str) -> ArchiveProposal:
    """Findings text -> ArchiveProposal. json_schema first, function_calling as fallback."""
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


async def run_alon(
    document_version_id: int,
    clearance_levels: list[str],
    *,
    allow_fast_path: bool = True,
) -> AlonResult:
    started = time.perf_counter()
    version_token = current_archive_version_id.set(document_version_id)
    clearance_token = current_allowed_clearance.set([lvl.lower() for lvl in clearance_levels])

    usage_cb, tool_calls, findings = None, [], ""
    try:
        # Stage 1: Deterministic pre-fetch (0 LLM tokens)
        dossier = await build_archive_dossier(document_version_id)

        # Stage 2: Optional ML fast-path (enabled via ALON_FAST_PATH=true)
        if allow_fast_path and _fast_path_enabled() and _can_use_fast_path(dossier):
            proposal = _apply_guardrails(_build_fast_path_proposal(dossier), dossier)
            return AlonResult(
                proposal=proposal,
                elapsed_ms=(time.perf_counter() - started) * 1000,
                tokens_used=0,
                tool_calls=[],
                findings=proposal.summary,
                model_name="ml-fast-path",
            )

        # Stage 3: Targeted ReAct investigation (calls tools only when dossier is insufficient)
        with get_usage_metadata_callback() as usage_cb:
            result = await doc_archiving_app.ainvoke(
                {"messages": [HumanMessage(content=(
                    "Review the pre-fetched archive dossier below and write your FINDINGS REPORT. "
                    "Call tools ONLY if you need additional pages or a wider similar-document search.\n\n"
                    f"{dossier.to_prompt_text()}"
                ))]},
                config={"recursion_limit": ALON_STEP_LIMIT},
            )
            messages = result.get("messages", [])
            tool_calls = [tc["name"] for m in messages for tc in (getattr(m, "tool_calls", None) or [])]
            findings = (messages[-1].text if messages else "").strip()
            if not findings:
                raise RuntimeError("Alon finished without writing a findings report.")

            # Stage 4: Format -> ArchiveProposal + deterministic guardrails
            proposal = _apply_guardrails(await _format_proposal(findings), dossier)

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
