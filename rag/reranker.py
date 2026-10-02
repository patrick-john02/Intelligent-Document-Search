from __future__ import annotations

import json
import logging
import re
from typing import Any

import httpx
from core.configurations import app_settings, ollama_url

logger = logging.getLogger(__name__)


class QwenReranker:



    def __init__(
        self,
        model_name: str | None = None,
        base_url: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        self.model_name = model_name or getattr(app_settings, "RERANKER_MODEL", "qwen2.5:1.5b-instruct")
        self.base_url = (base_url or ollama_url).rstrip("/")
        self.timeout = timeout

    async def rerank(
        self,
        query: str,
        candidates: list[dict[str, Any]],
        top_k: int = 5,
    ) -> list[dict[str, Any]]:




        if not candidates:
            return []

        if not getattr(app_settings, "RERANKER_ENABLED", True) or len(candidates) <= 1:
            return candidates[:top_k]

        try:
            scored_candidates = await self._score_candidates(query, candidates)




            scored_candidates.sort(
                key=lambda x: x.get("rerank_score", x.get("relevance_score", 0.0)),
                reverse=True,
            )
            return scored_candidates[:top_k]
        except Exception as e:
            logger.warning(f"[QwenReranker] Reranking failed ({e}); falling back to original RRF ranking.")
            return candidates[:top_k]

    async def _score_candidates(
        self,
        query: str,
        candidates: list[dict[str, Any]],
        batch_size: int = 10,
    ) -> list[dict[str, Any]]:




        results = [c.copy() for c in candidates]

        for i in range(0, len(results), batch_size):
            batch = results[i : i + batch_size]
            batch_scores = await self._evaluate_batch(query, batch, offset=i)
            for idx, score in batch_scores.items():
                if 0 <= idx < len(results):
                    results[idx]["rerank_score"] = float(score)

        return results

    async def _evaluate_batch(
        self,
        query: str,
        batch: list[dict[str, Any]],
        offset: int = 0,
    ) -> dict[int, float]:




        doc_entries = []
        for local_idx, doc in enumerate(batch):
            global_idx = offset + local_idx



            snippet = doc.get("content", "").replace("\n", " ").strip()[:350]
            doc_entries.append(f"[{global_idx}] {snippet}")

        docs_text = "\n".join(doc_entries)
        prompt = (
            "You are an expert search reranker for a government and document archive.\n"
            "Score the relevance of each document to the search query on a scale from 0.00 to 1.00.\n"
            "- 0.90 to 1.00: Directly answers or contains the exact information.\n"
            "- 0.60 to 0.89: Highly relevant background or related provisions.\n"
            "- 0.20 to 0.59: Tangentially mentions topics or keywords.\n"
            "- 0.00 to 0.19: Irrelevant.\n\n"
            f"Query: {query}\n\n"
            f"Documents:\n{docs_text}\n\n"
            "Return JSON only mapping each document ID to its relevance score, for example:\n"
            '{"0": 0.95, "1": 0.10}'
        )

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0.0},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            raw_text = data.get("response", "{}")

        return self._parse_scores(raw_text)

    def _parse_scores(self, raw_text: str) -> dict[int, float]:


        scores: dict[int, float] = {}
        try:
            parsed = json.loads(raw_text)
            if isinstance(parsed, dict):
                for k, v in parsed.items():
                    clean_k = re.sub(r"\D", "", str(k))
                    if not clean_k:
                        continue
                    idx = int(clean_k)
                    if isinstance(v, (int, float)):
                        scores[idx] = float(v)
                    elif isinstance(v, dict) and "score" in v:
                        scores[idx] = float(v["score"])
            elif isinstance(parsed, list):
                for item in parsed:
                    if isinstance(item, dict) and "id" in item and "score" in item:
                        scores[int(item["id"])] = float(item["score"])
        except Exception:



            matches = re.findall(r"\[?(\d+)\]?\s*[:=]\s*([0-1]?\.\d+|\d+)", raw_text)
            for m_id, m_score in matches:
                try:
                    scores[int(m_id)] = float(m_score)
                except ValueError:
                    pass
        return scores





reranker = QwenReranker()
