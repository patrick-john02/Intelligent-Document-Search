# rules.py (Tier 0). It only looks at the top of the document, and the earliest match wins. 
# A disbursement voucher often mentions “Obligation Request No.” further down the page, so matching anywhere would mislabel it.
import re

from rag.classification.base import Prediction

RULES: list[tuple[str, re.Pattern]] = [
    ("disbursement_voucher", re.compile(r"\bdisbursement\s+voucher\b", re.I)),
    ("obligation_request", re.compile(r"\bobligation\s+request\b", re.I)),
    ("budget_utilization_request", re.compile(r"\bbudget\s+utili[sz]ation\s+request\b", re.I)),
    ("purchase_request", re.compile(r"\bpurchase\s+request\b", re.I)),
    ("purchase_order", re.compile(r"\bpurchase\s+order\b", re.I)),
    ("payroll", re.compile(r"\bpayroll\b", re.I)),
    ("liquidation_report", re.compile(r"\bliquidation\s+report\b", re.I)),
    ("official_receipt", re.compile(r"\bofficial\s+receipt\b", re.I)),
    ("journal_entry_voucher", re.compile(r"\bjournal\s+entry\s+voucher\b", re.I)),
]

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
            return None                     # abstain, don't guess

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