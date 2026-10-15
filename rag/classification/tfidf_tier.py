#Tier 1   (loads when the model file exists)
import asyncio

import joblib

from rag.classification.base import Prediction
from rag.classification.config import MODEL_DIR, read_version


class TfidfClassifier:
    name = "tfidf"

    def __init__(self):
        self.folder = MODEL_DIR / "tfidf"
        self.model_version = read_version(self.folder)
        self._model= None

    def is_ready(self)->bool:
        return (self.folder / "model.joblib").exists()


    def _load(self):
        if self._model is None:
            self._model = joblib.load(self.folder / "model.joblib")
        return self._model

    def _predict_sync(self, text: str) -> Prediction:
        model = self._load()
        probs = model.predict_proba([text])[0]
        probabilities = {str(label): float(p) for label, p in zip(model.classes_, probs)}
        label = max(probabilities, key=probabilities.get)
        return Prediction(self.name, label, probabilities[label], probabilities, self.model_version)

    async def predict(self, text: str) -> Prediction | None:
        return await asyncio.to_thread(self._predict_sync, text)


