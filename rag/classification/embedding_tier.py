#embedding_tier.py (Tier 1b). It also does the out-of-distribution check by measuring how close 
# the document is to the nearest class centroid. It uses nomic’s classification: task prefix.
import asyncio

import joblib
import numpy as np
from langchain_ollama import OllamaEmbeddings

from core.configurations import app_settings, ollama_url
from rag.classification.base import Prediction
from rag.classification.config import MODEL_DIR, read_version


class EmbeddingClassifier:
    name = "embedding"

    def __init__(self):
        self.folder = MODEL_DIR / "embedding"
        self.model_version = read_version(self.folder)
        self._bundle = None
        self._embedder = OllamaEmbeddings(model=app_settings.EMBEDDING_MODEL, base_url=ollama_url)

    def is_ready(self) -> bool:
        return (self.folder / "model.joblib").exists()

    def _load(self) -> dict:
        if self._bundle is None:
            self._bundle = joblib.load(self.folder / "model.joblib")
        return self._bundle

    async def predict(self, text: str) -> Prediction | None:
        bundle = await asyncio.to_thread(self._load)

        [vector] = await self._embedder.aembed_documents([f"classification: {text[:4000]}"])
        x = np.asarray(vector, dtype=np.float32)
        x = x / (np.linalg.norm(x) + 1e-12)

        clf = bundle["clf"]
        probs = clf.predict_proba([x])[0]
        probabilities = {str(label): float(p) for label, p in zip(clf.classes_, probs)}
        label = max(probabilities, key=probabilities.get)

        nearest_similarity = float(np.max(bundle["centroids"] @ x))
        is_ood = nearest_similarity < bundle.get("ood_threshold", 0.5)

        return Prediction(self.name, label, probabilities[label], probabilities,
                          self.model_version, is_ood=is_ood)