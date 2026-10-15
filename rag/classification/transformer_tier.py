#Tier 2  (loads when the model folder exists)
import asyncio

from rag.classification.base import Prediction
from rag.classification.config import MODEL_DIR, read_version


class TransformerClassifier:
    name = "transformer"

    def __init__(self):
        self.folder = MODEL_DIR / "transformer"
        self.model_version = read_version(self.folder)
        self.temperature = 1.0
        self._tokenizer = None
        self._model = None

    def is_ready(self) -> bool:
        return (self.folder / "config.json").exists()

    def _load(self):
        if self._model is None:
            from transformers import AutoTokenizer, AutoModelForSequenceClassification

            self._tokenizer = AutoTokenizer.from_pretrained(self.folder)
            self._model = AutoModelForSequenceClassification.from_pretrained(self.folder)
            self._model.eval()

            temp_file = self.folder / "temperature.txt"      # from temperature scaling
            if temp_file.exists():
                self.temperature = float(temp_file.read_text().strip())

    def _predict_sync(self, text: str) -> Prediction:
        import torch

        self._load()
        inputs = self._tokenizer(text, truncation=True, max_length=512, return_tensors="pt")
        with torch.inference_mode():
            logits = self._model(**inputs).logits[0] / self.temperature
        probs = torch.softmax(logits, dim=-1).tolist()

        id2label = self._model.config.id2label
        probabilities = {id2label[i]: float(p) for i, p in enumerate(probs)}
        label = max(probabilities, key=probabilities.get)
        return Prediction(self.name, label, probabilities[label], probabilities, self.model_version)

    async def predict(self, text: str) -> Prediction | None:
        return await asyncio.to_thread(self._predict_sync, text)