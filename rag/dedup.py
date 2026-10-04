from __future__ import annotations

import difflib
import hashlib
import re
import unicodedata
from dataclasses import dataclass, field
from typing import Any, Iterable, Sequence, Set, Tuple

import numpy as np


def normalize_text(text: str) -> str:
    if not text:
        return ""
    normalized = unicodedata.normalize("NFKC", text).lower()
    return re.sub(r"\s+", " ", normalized).strip()


def tokenize_words(text: str) -> list[str]:
    normalized = normalize_text(text)
    if not normalized:
        return []
    return re.findall(r"\b\w+\b", normalized)


def get_shingles(
    text: str,
    k: int = 3,
    shingle_type: str = "word",
) -> set[str]:
    if shingle_type == "char":
        clean = normalize_text(text)
        if len(clean) < k:
            return {clean} if clean else set()
        return {clean[i : i + k] for i in range(len(clean) - k + 1)}

    tokens = tokenize_words(text)
    if not tokens:
        return set()
    if len(tokens) < k:
        return {" ".join(tokens)}

    return {" ".join(tokens[i : i + k]) for i in range(len(tokens) - k + 1)}


def calculate_sha256(data: str | bytes) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def calculate_normalized_content_hash(text: str) -> str:
    normalized = normalize_text(text)
    return calculate_sha256(normalized.encode("utf-8"))


class MinHashEngine:
    MERSENNE_PRIME: int = (1 << 61) - 1

    def __init__(self, num_perm: int = 128, seed: int = 42):
        self.num_perm = num_perm
        self.seed = seed
        self._a, self._b = self._init_permutations()

    def _init_permutations(self) -> Tuple[np.ndarray, np.ndarray]:
        rng = np.random.RandomState(self.seed)
        a = rng.randint(1, self.MERSENNE_PRIME, size=self.num_perm, dtype=np.int64)
        b = rng.randint(0, self.MERSENNE_PRIME, size=self.num_perm, dtype=np.int64)
        return a, b

    def compute_signature(self, shingles: Iterable[str]) -> np.ndarray:
        shingle_list = list(shingles)
        if not shingle_list:
            return np.zeros(self.num_perm, dtype=np.int64)

        raw_hashes = np.array(
            [int(hashlib.sha256(s.encode("utf-8")).hexdigest()[:15], 16) for s in shingle_list],
            dtype=np.int64,
        )

        hashes = (np.outer(self._a, raw_hashes) + self._b[:, np.newaxis]) % self.MERSENNE_PRIME
        return np.min(hashes, axis=1)

    @staticmethod
    def estimate_jaccard(sig_a: np.ndarray, sig_b: np.ndarray) -> float:
        if sig_a is None or sig_b is None or len(sig_a) == 0 or len(sig_b) == 0:
            return 0.0
        if len(sig_a) != len(sig_b):
            raise ValueError(f"Signatures must have identical length ({len(sig_a)} vs {len(sig_b)})")
        return float(np.mean(sig_a == sig_b))

    @staticmethod
    def exact_jaccard(set_a: Set[str], set_b: Set[str]) -> float:
        if not set_a and not set_b:
            return 1.0
        if not set_a or not set_b:
            return 0.0
        intersection = len(set_a.intersection(set_b))
        union = len(set_a.union(set_b))
        return float(intersection / union) if union > 0 else 0.0


class TokenDistanceComparator:
    @staticmethod
    def token_sort_ratio(text_a: str, text_b: str) -> float:
        tokens_a = sorted(tokenize_words(text_a))
        tokens_b = sorted(tokenize_words(text_b))
        if not tokens_a and not tokens_b:
            return 1.0
        if not tokens_a or not tokens_b:
            return 0.0
        sorted_a = " ".join(tokens_a)
        sorted_b = " ".join(tokens_b)
        return difflib.SequenceMatcher(None, sorted_a, sorted_b).ratio()

    @staticmethod
    def token_set_ratio(text_a: str, text_b: str) -> float:
        set_a = set(tokenize_words(text_a))
        set_b = set(tokenize_words(text_b))
        if not set_a and not set_b:
            return 1.0
        if not set_a or not set_b:
            return 0.0

        intersection = sorted(set_a.intersection(set_b))
        diff_a = sorted(set_a.difference(set_b))
        diff_b = sorted(set_b.difference(set_a))

        str_inter = " ".join(intersection)
        str_inter_diff_a = f"{str_inter} {' '.join(diff_a)}".strip()
        str_inter_diff_b = f"{str_inter} {' '.join(diff_b)}".strip()

        ratio1 = difflib.SequenceMatcher(None, str_inter, str_inter_diff_a).ratio()
        ratio2 = difflib.SequenceMatcher(None, str_inter, str_inter_diff_b).ratio()
        ratio3 = difflib.SequenceMatcher(None, str_inter_diff_a, str_inter_diff_b).ratio()

        return float(max(ratio1, ratio2, ratio3))

    @staticmethod
    def token_levenshtein_distance(tokens_a: Sequence[str], tokens_b: Sequence[str]) -> int:
        if not tokens_a:
            return len(tokens_b)
        if not tokens_b:
            return len(tokens_a)

        if len(tokens_a) < len(tokens_b):
            tokens_a, tokens_b = tokens_b, tokens_a

        previous_row = list(range(len(tokens_b) + 1))
        for i, c1 in enumerate(tokens_a):
            current_row = [i + 1] + [0] * len(tokens_b)
            for j, c2 in enumerate(tokens_b):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row[j + 1] = min(insertions, deletions, substitutions)
            previous_row = current_row

        return previous_row[-1]

    @classmethod
    def token_levenshtein_ratio(cls, text_a: str, text_b: str) -> float:
        tokens_a = tokenize_words(text_a)
        tokens_b = tokenize_words(text_b)
        max_len = max(len(tokens_a), len(tokens_b))
        if max_len == 0:
            return 1.0
        dist = cls.token_levenshtein_distance(tokens_a, tokens_b)
        return float(max(0.0, 1.0 - (dist / max_len)))

    @staticmethod
    def extract_diff_blocks(text_a: str, text_b: str) -> dict[str, Any]:
        lines_a = [line.strip() for line in text_a.splitlines() if line.strip()]
        lines_b = [line.strip() for line in text_b.splitlines() if line.strip()]

        matcher = difflib.SequenceMatcher(None, lines_a, lines_b)
        common_blocks: list[str] = []
        unique_to_a: list[str] = []
        unique_to_b: list[str] = []

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == "equal":
                common_blocks.extend(lines_a[i1:i2])
            elif tag == "delete":
                unique_to_a.extend(lines_a[i1:i2])
            elif tag == "insert":
                unique_to_b.extend(lines_b[j1:j2])
            elif tag == "replace":
                unique_to_a.extend(lines_a[i1:i2])
                unique_to_b.extend(lines_b[j1:j2])

        return {
            "similarity_ratio": round(matcher.ratio(), 4),
            "common_blocks_count": len(common_blocks),
            "unique_to_a_count": len(unique_to_a),
            "unique_to_b_count": len(unique_to_b),
            "sample_common": common_blocks[:5],
            "sample_unique_a": unique_to_a[:5],
            "sample_unique_b": unique_to_b[:5],
        }


@dataclass
class DeterministicComparisonReport:
    is_exact_binary_match: bool
    is_exact_normalized_match: bool
    minhash_jaccard_similarity: float
    exact_jaccard_similarity: float
    token_sort_ratio: float
    token_set_ratio: float
    token_levenshtein_ratio: float
    composite_similarity_score: float
    is_near_duplicate: bool
    duplicate_category: str
    diff_summary: dict[str, Any] = field(default_factory=dict)


class DeterministicDuplicateDetector:
    def __init__(self, num_perm: int = 128, k_shingle: int = 3, seed: int = 42):
        self.minhash_engine = MinHashEngine(num_perm=num_perm, seed=seed)
        self.comparator = TokenDistanceComparator()
        self.k_shingle = k_shingle

    def compare_documents(
        self,
        text_a: str,
        text_b: str,
        file_bytes_a: bytes | None = None,
        file_bytes_b: bytes | None = None,
        near_duplicate_threshold: float = 0.85,
    ) -> DeterministicComparisonReport:
        exact_binary = False
        if file_bytes_a and file_bytes_b:
            exact_binary = calculate_sha256(file_bytes_a) == calculate_sha256(file_bytes_b)

        hash_norm_a = calculate_normalized_content_hash(text_a)
        hash_norm_b = calculate_normalized_content_hash(text_b)
        exact_normalized = (hash_norm_a == hash_norm_b) and (bool(text_a.strip()))

        if exact_binary or exact_normalized:
            return DeterministicComparisonReport(
                is_exact_binary_match=exact_binary,
                is_exact_normalized_match=exact_normalized,
                minhash_jaccard_similarity=1.0,
                exact_jaccard_similarity=1.0,
                token_sort_ratio=1.0,
                token_set_ratio=1.0,
                token_levenshtein_ratio=1.0,
                composite_similarity_score=1.0,
                is_near_duplicate=True,
                duplicate_category="EXACT_HASH",
                diff_summary={"status": "Documents are 100% mathematically identical."},
            )

        shingles_a = get_shingles(text_a, k=self.k_shingle, shingle_type="word")
        shingles_b = get_shingles(text_b, k=self.k_shingle, shingle_type="word")

        sig_a = self.minhash_engine.compute_signature(shingles_a)
        sig_b = self.minhash_engine.compute_signature(shingles_b)

        minhash_jaccard = round(self.minhash_engine.estimate_jaccard(sig_a, sig_b), 4)
        exact_jaccard = round(self.minhash_engine.exact_jaccard(shingles_a, shingles_b), 4)

        token_sort = round(self.comparator.token_sort_ratio(text_a, text_b), 4)
        token_set = round(self.comparator.token_set_ratio(text_a, text_b), 4)
        token_lev = round(self.comparator.token_levenshtein_ratio(text_a, text_b), 4)
        diff_summary = self.comparator.extract_diff_blocks(text_a, text_b)

        composite_score = round(
            (0.40 * minhash_jaccard) + (0.30 * token_sort) + (0.30 * token_lev),
            4,
        )

        is_near = composite_score >= near_duplicate_threshold
        category = "NONE"
        if composite_score >= 0.95:
            category = "NEAR_DUPLICATE_VERY_HIGH"
        elif composite_score >= near_duplicate_threshold:
            category = "NEAR_DUPLICATE_HIGH"
        elif composite_score >= 0.65:
            category = "MODERATE_REVISION_OR_SHARED_SECTIONS"
        else:
            category = "DISTINCT_DOCUMENTS"

        return DeterministicComparisonReport(
            is_exact_binary_match=False,
            is_exact_normalized_match=False,
            minhash_jaccard_similarity=minhash_jaccard,
            exact_jaccard_similarity=exact_jaccard,
            token_sort_ratio=token_sort,
            token_set_ratio=token_set,
            token_levenshtein_ratio=token_lev,
            composite_similarity_score=composite_score,
            is_near_duplicate=is_near,
            duplicate_category=category,
            diff_summary=diff_summary,
        )


default_duplicate_detector = DeterministicDuplicateDetector()
