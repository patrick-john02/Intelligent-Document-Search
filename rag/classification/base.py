#Prediction + tier interface
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class Prediction:
    source: str
    label: str
    confidence: float
    probabilities: dict[str, float] = field(default_factory=dict)
    model_version: str = "n/a"
    is_ood: bool = False          # out-of-distribution flag


class TierClassifier(Protocol):
    name: str

    def is_ready(self) -> bool: ...

    async def predict(self, text: str) -> Prediction | None: ...