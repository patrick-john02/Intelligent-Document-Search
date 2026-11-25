"""Local smoke test & side-by-side comparison: TF-IDF (baseline) vs SetFit (candidate).

Usage (from project root):
    uv run python -m test.try_classifier                # offline comparison (no DB needed)
    uv run python -m test.try_classifier --version 27   # replay on saved OCR from Postgres
"""
import argparse
import asyncio
import time

from rag.classification.config import AUTO_ASSIGN_THRESHOLD, MODEL_DIR, TIER_WEIGHTS, UNKNOWN_THRESHOLD
from rag.classification.ensemble import TIERS, classify_extraction, combine
from rag.classification.labels import DOC_TYPES, UNKNOWN_LABEL
from rag.classification.setfit_tier import SetFitClassifier
from rag.classification.text import build_classification_text
from rag.classification.tfidf_tier import TfidfClassifier


OFFLINE_SAMPLES = [
    (
        "leaves",
        "CIVIL SERVICE FORM NO. 6 REVISED 2020 REPUBLIC OF THE PHILIPPINES "
        "PROVINCIAL GOVERNMENT OF CAGAYAN PENABLANCA CAGAYAN APPLICATION FOR LEAVE "
        "OFFICE/DEPARTMENT PROVINCIAL ACCOUNTANT'S OFFICE 6.A TYPE OF LEAVE TO BE AVAILED OF "
        "VACATION LEAVE SICK LEAVE NUMBER OF WORKING DAYS APPLIED FOR 5 DAYS "
        "7.A CERTIFICATION OF LEAVE CREDITS TOTAL EARNED BALANCE PROVINCIAL HUMAN RESOURCE DEVELOPMENT OFFICER",
    ),
    (
        "clearance",
        "REPUBLIC OF THE PHILIPPINES PROVINCE OF CAGAYAN TUGUEGARAO CITY "
        "OFFICE OF THE PROVINCIAL ACCOUNTANT CERTIFICATION THIS IS TO CERTIFY THAT "
        "EMPLOYEE OF THE PROVINCIAL HEALTH OFFICE HAS BEEN CLEARED FROM RESPONSIBILITY "
        "AS FAR AS THE HEREUNDER ACCOUNTS ARE CONCERNED AS TO CASH ADVANCE AS TO LOANS "
        "GENERAL FUND PROPER TRUST FUND THIS CERTIFICATE OF CLEARANCE IS ISSUED SUBJECT TO "
        "GAO GENERAL CIRCULAR NO. 52 DATED DECEMBER 23 1957 APPROVED PROVINCIAL ACCOUNTANT",
    ),
    (
        "communication",
        "REPUBLIC OF THE PHILIPPINES PROVINCE OF CAGAYAN TUGUEGARAO CITY "
        "PROVINCIAL HUMAN RESOURCE MANAGEMENT OFFICE JANUARY 10 2024 "
        "MS. JEANNA C. GARMA PROVINCIAL ACCOUNTANT THIS PROVINCE DEAR MS. GARMA: GREETINGS! "
        "WE ARE FORWARDING THE APPROVED REQUEST FOR ON THE JOB TRAINING OF STUDENTS "
        "WHO WILL REPORT AT THE PROVINCIAL ACCOUNTING OFFICE THANK YOU VERY TRULY YOURS "
        "ACTING PROVINCIAL HUMAN RESOURCE DEVELOPMENT OFFICER",
    ),
]


async def _benchmark_one(tfidf: TfidfClassifier, setfit: SetFitClassifier, text: str):
    t0 = time.perf_counter()
    p_tfidf = await tfidf.predict(text) if tfidf.is_ready() else None
    ms_tfidf = (time.perf_counter() - t0) * 1000

    t1 = time.perf_counter()
    p_setfit = await setfit.predict(text) if setfit.is_ready() else None
    ms_setfit = (time.perf_counter() - t1) * 1000

    preds = [p for p in (p_tfidf, p_setfit) if p is not None]
    decision = combine(preds)
    return p_tfidf, ms_tfidf, p_setfit, ms_setfit, decision


async def run_offline() -> None:
    print(f"MODEL_DIR: {MODEL_DIR}")
    print(f"Thresholds: auto_assign >= {AUTO_ASSIGN_THRESHOLD}, unknown < {UNKNOWN_THRESHOLD}")
    print(f"Weights: tfidf={TIER_WEIGHTS.get('tfidf')} | setfit={TIER_WEIGHTS.get('setfit')}")
    print("Tiers ready:", [(t.name, t.is_ready()) for t in TIERS])
    print()

    tfidf = TfidfClassifier()
    setfit = SetFitClassifier()
    allowed = set(DOC_TYPES) | {UNKNOWN_LABEL}

    # Warm up both models once so per-sample latency reflects steady-state inference
    if tfidf.is_ready():
        await tfidf.predict("warmup")
    if setfit.is_ready():
        await setfit.predict("warmup")

    for expected, text in OFFLINE_SAMPLES:
        p_tfidf, ms_tfidf, p_setfit, ms_setfit, decision = await _benchmark_one(tfidf, setfit, text)

        assert decision.label in allowed, f"Label '{decision.label}' is not in DOC_TYPES!"
        for p in decision.tier_predictions:
            assert set(p.probabilities).issubset(set(DOC_TYPES)), (
                f"Tier '{p.source}' emitted unknown keys: {set(p.probabilities) - set(DOC_TYPES)}"
            )
            prob_sum = sum(p.probabilities.values())
            assert abs(prob_sum - 1.0) < 1e-4, f"Probabilities did not sum to 1.0: {prob_sum}"

        agree = p_tfidf and p_setfit and p_tfidf.label == p_setfit.label
        print(f"Expected: {expected}")
        if p_tfidf:
            print(f"  TF-IDF  (baseline , {p_tfidf.model_version}): {p_tfidf.label:<13} conf={p_tfidf.confidence:.3f} ({ms_tfidf:.1f} ms)")
        if p_setfit:
            print(f"  SetFit  (candidate, {p_setfit.model_version}): {p_setfit.label:<13} conf={p_setfit.confidence:.3f} ({ms_setfit:.1f} ms)")
        print(f"  Ensemble: {decision.label:<13} conf={decision.confidence:.3f} status={decision.status} | agree={agree}")
        print()


async def run_db_version(version_id: int) -> None:
    from rag.storage import get_extraction

    extraction = await get_extraction(version_id)
    if extraction is None:
        raise SystemExit(f"No DocumentExtractions row found for document_version_id={version_id}")

    text = build_classification_text(extraction.full_text, extraction.pages)
    tfidf = TfidfClassifier()
    setfit = SetFitClassifier()
    p_tfidf, ms_tfidf, p_setfit, ms_setfit, _ = await _benchmark_one(tfidf, setfit, text)
    decision = await classify_extraction(extraction)

    print(f"DocumentVersion #{version_id} ({extraction.page_count} pages, {extraction.char_count} chars)")
    if p_tfidf:
        print(f"  TF-IDF  (baseline , {p_tfidf.model_version}): {p_tfidf.label:<13} conf={p_tfidf.confidence:.4f} ({ms_tfidf:.1f} ms)")
    if p_setfit:
        print(f"  SetFit  (candidate, {p_setfit.model_version}): {p_setfit.label:<13} conf={p_setfit.confidence:.4f} ({ms_setfit:.1f} ms)")
    print(f"  Ensemble: {decision.label:<13} conf={decision.confidence:.4f} status={decision.status}")
    print("  Combined probs:", {k: round(v, 4) for k, v in sorted(decision.probabilities.items(), key=lambda kv: -kv[1])})


def main() -> None:
    parser = argparse.ArgumentParser(description="Compare TF-IDF baseline vs SetFit candidate locally.")
    parser.add_argument("--version", type=int, default=None, help="DocumentVersion ID to replay from Postgres.")
    args = parser.parse_args()

    if args.version is not None:
        asyncio.run(run_db_version(args.version))
    else:
        asyncio.run(run_offline())


if __name__ == "__main__":
    main()
