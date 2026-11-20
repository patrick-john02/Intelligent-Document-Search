import re

LOW_OCR_SCORE=0.75
MIN_UNCERTAIN_SPANS=3
MIN_TEXT_PER_SCANNED_PAGE=150

UNCERTAIN_SPAN = re.compile(r"\[\?(.*?)\?\]")
PAGE_HEADER = re.compile(r"^## Page \d+.*$", re.MULTILINE)

BLANK_FIELD_PATTERNS = [
    re.compile(r"certify\s+that\s*(employee|has\s+been)", re.IGNORECASE),
    re.compile(r"employee\s+of\s+the\s*(,|has\s+been)", re.IGNORECASE),
    re.compile(r"issued\s+this\s*(day\s+of)", re.IGNORECASE),
    re.compile(r"day\s+of\s*,?\s*(20\d\d)?\s*(tuguegarao|,\s*$)", re.IGNORECASE),
]

def assess_text_quality(text: str, is_scanned: bool, ocr_score: float | None) -> list[str]:

    if not is_scanned:
        return [] #digital text is trusted

    reasons: list[str]=[]

    if ocr_score is not None and ocr_score < LOW_OCR_SCORE:
        reasons.append("low_ocr_score")

    if len(UNCERTAIN_SPAN.findall(text)) >= MIN_UNCERTAIN_SPANS:
        reasons.append("uncertain_handwriting")

    if any(p.search(text) for p in BLANK_FIELD_PATTERNS):
        reasons.append("blank_form_fields")

    pages=[p for p in PAGE_HEADER.split(text) if p.strip()] or [text]
    if any(sum(c.isalnum() for c in p) < MIN_TEXT_PER_SCANNED_PAGE for p in pages):
        reasons.append("little_text_on_page")
        
    return reasons


