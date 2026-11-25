# rules.py (Tier 0). It only looks at the top of the document, and the earliest match wins. 
# A disbursement voucher often mentions “Obligation Request No.” further down the page, so matching anywhere would mislabel it.
import re

from rag.classification.base import Prediction

# Keep empty while DOC_TYPES is ["clearance", "communication", "leaves", "other"]
# so Tier 0 abstains and does not vote for removed types or dilute ML probabilities.
RULES: list[tuple[str, re.Pattern]] = []

HEADER_CHARS = 800


class RuleClassifier:
    name = "rules"
    model_version = "rules-v1"

    def is_ready(self) -> bool:
        return True

    async def predict(self, text: str) -> Prediction | None:
        header = text[:HEADER_CHARS]
        hits = []
        for label, pattern in RULES:
            match = pattern.search(header)
            if match:
                hits.append((match.start(), label))

        if not hits:
            return None                     

        hits.sort()
        position, label = hits[0]
        confidence = 0.95 if position < 200 else 0.80

        return Prediction(
            source=self.name,
            label=label,
            confidence=confidence,
            probabilities={label: confidence},
            model_version=self.model_version,
        )