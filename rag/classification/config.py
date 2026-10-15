# thresholds, weights, model folder
from pathlib import Path

MODEL_DIR = Path(__file__).resolve().parents[2] / "models_store" / "classification"

AUTO_ASSIGN_THRESHOLD = 0.85 # >= this: assign automatically
UNKNOWN_THRESHOLD = 0.40 # < this: "unknown"; in between: needs_review

# Transformer gets more say once it exists
TIER_WEIGHTS = {"rules": 1.0, "tfidf": 1.0, "embedding": 1.0, "transformer": 2.0}

def read_version(folder: Path) -> str:
    version_file = folder / "VERSION"
    return version_file.read_text().strip() if version_file.exists() else folder.name