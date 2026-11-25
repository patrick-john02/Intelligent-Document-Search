"""Offline unit tests for Alon's Hybrid Pre-Fetch + Targeted ReAct + Guardrails architecture."""
from agents.archiving_agent.runner import (
    _apply_guardrails,
    _build_fast_path_proposal,
    _can_use_fast_path,
)
from agents.archiving_agent.schema import ArchiveProposal
from tools.archiving.archive_tools import ArchiveDossier, TARGETED_ARCHIVE_TOOLS


def _sample_dossier(**overrides) -> ArchiveDossier:
    base = dict(
        document_version_id=42,
        overview_text="## What the user entered at upload\n- Title: Application for Leave - Juan Dela Cruz",
        classification_text=(
            "## Classifier result\n"
            "- Final label: leaves | confidence 0.91 | status: auto_assigned\n"
            "## Votes per tier\n"
            "- tfidf (real_ocr_v1): leaves (0.78)\n"
            "- setfit (setfit-real-ocr-v1): leaves (0.98)"
        ),
        initial_pages_text="--- Page 1 of 1 ---\nCIVIL SERVICE FORM NO. 6 APPLICATION FOR LEAVE",
        duplicates_text="No duplicates found.",
        similar_text="## Shelf locations\n- Cabinet B - Drawer 2: 3 document(s)",
        upload_title="Application for Leave - Juan Dela Cruz",
        upload_department_order="PAO",
        upload_series_year=2024,
        file_name="leave_juan.pdf",
        has_extraction=True,
        ocr_score=0.95,
        page_count=1,
        pages_prefetched=1,
        ml_label="leaves",
        ml_confidence=0.91,
        ml_status="auto_assigned",
        ml_tier_votes=["tfidf (real_ocr_v1): leaves (0.78)", "setfit (setfit-real-ocr-v1): leaves (0.98)"],
        top_shelf_location="Cabinet B - Drawer 2",
        top_shelf_count=3,
    )
    base.update(overrides)
    return ArchiveDossier(**base)


def _sample_proposal(**overrides) -> ArchiveProposal:
    base = dict(
        title="Application for Leave (Vacation) - Juan Dela Cruz (Nov 2024)",
        document_type="leaves",
        document_type_confidence=0.95,
        document_type_reason="CS Form No. 6 Application for Leave.",
        agrees_with_classifier=True,
        summary="Employee leave application for 5 days.",
        needs_human_review=False,
    )
    base.update(overrides)
    return ArchiveProposal(**base)


def test_targeted_tools_are_investigative_only():
    names = [t.name for t in TARGETED_ARCHIVE_TOOLS]
    assert names == ["read_pages", "find_similar_archived"]


def test_dossier_prompt_includes_ml_votes_and_doc_types():
    prompt = _sample_dossier(page_count=3, pages_prefetched=1).to_prompt_text()
    assert "setfit (setfit-real-ocr-v1)" in prompt
    assert "tfidf (real_ocr_v1)" in prompt
    assert "clearance, communication, leaves, other" in prompt
    assert "Only page(s) 1..1 of 3" in prompt


def test_guardrails_keep_clean_auto_assigned_false():
    out = _apply_guardrails(_sample_proposal(), _sample_dossier())
    assert out.needs_human_review is False
    assert out.agrees_with_classifier is True
    assert out.duplicates == []


def test_guardrails_lock_human_verified_label():
    dossier = _sample_dossier(human_verified_label="clearance", ml_label="clearance", ml_status="verified")
    proposal = _sample_proposal(document_type="leaves", document_type_confidence=0.70)
    out = _apply_guardrails(proposal, dossier)
    assert out.document_type == "clearance"
    assert out.document_type_confidence == 1.0
    assert out.agrees_with_classifier is True


def test_guardrails_inject_duplicates_and_force_review():
    dossier = _sample_dossier(
        duplicates=[
            {
                "document_id": 10,
                "title": "Existing Leave Form",
                "match_type": "EXACT_HASH",
                "similarity": 1.0,
            }
        ]
    )
    out = _apply_guardrails(_sample_proposal(duplicates=[], needs_human_review=False), dossier)
    assert len(out.duplicates) == 1
    assert out.duplicates[0].document_id == 10
    assert out.needs_human_review is True
    assert any("duplicate" in i.lower() for i in out.issues)


def test_guardrails_flag_low_ocr_and_classifier_disagreement():
    dossier = _sample_dossier(ocr_score=0.62, ml_label="communication", ml_status="needs_review")
    out = _apply_guardrails(_sample_proposal(document_type="leaves", agrees_with_classifier=True), dossier)
    assert out.agrees_with_classifier is False
    assert out.needs_human_review is True
    assert any("ocr" in i.lower() for i in out.issues)
    assert any("communication" in i.lower() for i in out.issues)


def test_fast_path_gate_and_builder():
    clean = _sample_dossier()
    assert _can_use_fast_path(clean) is True
    fast = _apply_guardrails(_build_fast_path_proposal(clean), clean)
    assert fast.document_type == "leaves"
    assert fast.suggested_shelf_location == "Cabinet B - Drawer 2"
    assert fast.needs_human_review is False

    assert _can_use_fast_path(_sample_dossier(ml_status="needs_review")) is False
    assert _can_use_fast_path(_sample_dossier(upload_title="test")) is False
    assert _can_use_fast_path(_sample_dossier(ocr_score=0.70)) is False
    assert _can_use_fast_path(_sample_dossier(duplicates=[{"document_id": 1, "title": "x", "match_type": "EXACT_HASH", "similarity": 1.0}])) is False
