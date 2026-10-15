# ensemble.py. If one tier crashes, it is skipped and ingestion continues. 
# If the tiers disagree, the combined score drops and the document goes to review.
from __future__ import annotations

import logging
from collections import defaultdict
from dataclasses import dataclass, field

from api.models.enums.docs import ClassificationStatus
from rag.classification.base import Prediction
from rag.classification.config import AUTO_ASSIGN_THRESHOLD, UNKNOWN_THRESHOLD, TIER_WEIGHTS
from rag.classification.embedding_tier import EmbeddingClassifier
from rag.classification.labels import UNKNOWN_LABEL
from rag.classification.rules import RuleClassifier
from rag.classification.text import build_classification_text
from rag.classification.tfidf_tier import TfidfClassifier
from rag.classification.transformer_tier import TransformerClassifier

logger = logging.getLogger(__name__)

TIERS = [RuleClassifier(), TfidfClassifier(), EmbeddingClassifier(), TransformerClassifier()]


@dataclass
class ClassificationDecision:
    label: str
    confidence: float
    status: str
    probabilities: dict[str, float]
    tier_predictions: list[Prediction] = field(default_factory=list)


def combine(predictions: list[Prediction]) -> ClassificationDecision:
    if not predictions:
        return ClassificationDecision(UNKNOWN_LABEL, 0.0, ClassificationStatus.UNKNOWN.value, {}, [])

    combined: dict[str, float] = defaultdict(float)
    total_weight = 0.0
    for p in predictions:
        weight = TIER_WEIGHTS.get(p.source, 1.0)
        total_weight += weight
        for label, prob in p.probabilities.items():
            combined[label] += weight * prob

    probabilities = {label: score / total_weight for label, score in combined.items()}
    best_label = max(probabilities, key=probabilities.get)
    best = probabilities[best_label]
    is_ood = any(p.is_ood for p in predictions)

    if best >= AUTO_ASSIGN_THRESHOLD and not is_ood:
        status, label = ClassificationStatus.AUTO_ASSIGNED.value, best_label
    elif best < UNKNOWN_THRESHOLD or is_ood:
        status, label = ClassificationStatus.UNKNOWN.value, UNKNOWN_LABEL
    else:
        status, label = ClassificationStatus.NEEDS_REVIEW.value, best_label

    return ClassificationDecision(label, best, status, probabilities, predictions)


async def classify_text(text: str) -> ClassificationDecision:
    predictions: list[Prediction] = []
    for tier in TIERS:
        if not tier.is_ready():
            continue
        try:
            prediction = await tier.predict(text)
            if prediction is not None:
                predictions.append(prediction)
        except Exception as e:
            logger.warning(f"[classify] tier '{tier.name}' failed: {e}")
    return combine(predictions)


async def classify_extraction(extraction) -> ClassificationDecision:
    text = build_classification_text(extraction.full_text, extraction.pages)
    return await classify_text(text)