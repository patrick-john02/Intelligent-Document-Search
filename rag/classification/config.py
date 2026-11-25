# thresholds, weights, model folder
import os
from pathlib import Path

MODEL_DIR = Path(
    os.getenv(
        "CLASSIFICATION_MODEL_DIR",
        Path(__file__).resolve().parents[2] / "models" / "classification",
    )
)

AUTO_ASSIGN_THRESHOLD = 0.75 # >= this: assign automatically (calibrated for real_ocr_v1)
UNKNOWN_THRESHOLD = 0.40 # < this: "unknown"; in between: needs_review

# SetFit / Transformer get more say as the candidate production classifier over TF-IDF baseline
TIER_WEIGHTS = {"rules": 1.0, "tfidf": 1.0, "embedding": 1.0, "setfit": 2.0, "transformer": 2.0}

def read_version(folder: Path) -> str:
    version_file = folder / "VERSION"
    return version_file.read_text().strip() if version_file.exists() else folder.name