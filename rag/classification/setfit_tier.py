"""Tier 2: SetFit + Sentence Transformer classifier (candidate production classifier).

Loads from `models/classification/setfit_model/` (or `setfit/`).
Uses `setfit.SetFitModel` when installed, and otherwise runs the exact same
SentenceTransformer mean-pooling + `model_head.pkl` LogisticRegression inference
directly via `transformers` + `torch` + `joblib` (zero extra dependencies).
"""
import asyncio
import json
from pathlib import Path

import joblib

from rag.classification.base import Prediction
from rag.classification.config import MODEL_DIR, read_version
from rag.classification.text import clean_rapidocr, normalize_label


def _resolve_setfit_folder() -> Path:
    for name in ("setfit_model", "setfit"):
        candidate = MODEL_DIR / name
        if (candidate / "config_setfit.json").exists():
            return candidate
    return MODEL_DIR / "setfit_model"


class SetFitClassifier:
    name = "setfit"

    def __init__(self):
        self.folder = _resolve_setfit_folder()
        self.model_version = read_version(self.folder)
        self._setfit_model = None
        self._tokenizer = None
        self._encoder = None
        self._head = None
        self._labels: list[str] = []
        self._normalize_embeddings = False
        self._max_length = 128

    def is_ready(self) -> bool:
        return (
            (self.folder / "config_setfit.json").exists()
            and (self.folder / "model_head.pkl").exists()
        )

    def _load(self) -> None:
        if self._setfit_model is not None or self._encoder is not None:
            return

        cfg = json.loads((self.folder / "config_setfit.json").read_text(encoding="utf-8"))
        self._labels = [normalize_label(lbl) for lbl in (cfg.get("labels") or [])]
        self._normalize_embeddings = bool(cfg.get("normalize_embeddings", False))

        # Prefer official SetFitModel when the `setfit` package is installed.
        try:
            from setfit import SetFitModel

            self._setfit_model = SetFitModel.from_pretrained(str(self.folder))
            if not self._labels and getattr(self._setfit_model, "labels", None):
                self._labels = [normalize_label(lbl) for lbl in self._setfit_model.labels]
            return
        except ImportError:
            pass

        # Native transformers + torch + joblib path (exact match to SentenceTransformer mean pooling + sklearn head).
        from transformers import AutoModel, AutoTokenizer

        self._tokenizer = AutoTokenizer.from_pretrained(str(self.folder))
        self._encoder = AutoModel.from_pretrained(str(self.folder))
        self._encoder.eval()
        self._head = joblib.load(self.folder / "model_head.pkl")

        tok_max = getattr(self._tokenizer, "model_max_length", 128)
        self._max_length = tok_max if isinstance(tok_max, int) and 0 < tok_max <= 1024 else 128

    def _encode_mean_pool(self, text: str):
        import torch
        import torch.nn.functional as F

        inputs = self._tokenizer(
            [text],
            padding=True,
            truncation=True,
            max_length=self._max_length,
            return_tensors="pt",
        )
        with torch.inference_mode():
            outputs = self._encoder(**inputs)
            token_embeddings = outputs.last_hidden_state
            mask = inputs["attention_mask"].unsqueeze(-1).expand(token_embeddings.size()).float()
            pooled = (token_embeddings * mask).sum(dim=1) / mask.sum(dim=1).clamp(min=1e-9)
            if self._normalize_embeddings:
                pooled = F.normalize(pooled, p=2, dim=1)
        return pooled.cpu().numpy()

    def _map_label(self, raw_class: object) -> str:
        if isinstance(raw_class, (int, float)) or str(raw_class).isdigit():
            idx = int(raw_class)
            if 0 <= idx < len(self._labels):
                return self._labels[idx]
        return normalize_label(raw_class)

    def _predict_sync(self, text: str) -> Prediction:
        self._load()
        cleaned = clean_rapidocr(text)

        if self._setfit_model is not None:
            probs = self._setfit_model.predict_proba([cleaned])[0]
            if hasattr(probs, "tolist"):
                probs = probs.tolist()
            head_classes = getattr(self._setfit_model.model_head, "classes_", range(len(probs)))
            probabilities = {
                self._map_label(cls): float(p)
                for cls, p in zip(head_classes, probs)
            }
        else:
            embedding = self._encode_mean_pool(cleaned)
            probs = self._head.predict_proba(embedding)[0]
            probabilities = {
                self._map_label(cls): float(p)
                for cls, p in zip(self._head.classes_, probs)
            }

        label = max(probabilities, key=probabilities.get)
        return Prediction(self.name, label, probabilities[label], probabilities, self.model_version)

    async def predict(self, text: str) -> Prediction | None:
        return await asyncio.to_thread(self._predict_sync, text)
