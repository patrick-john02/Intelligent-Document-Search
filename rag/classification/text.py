#builds the classifier input (first page + headings)
#Classifying from the first page and the headings is faster and less noisy than using the whole document:
import re

HEADING_RE = re.compile(r"^#{1,6}\s+(.+)$", re.MULTILINE)


def build_classification_text(full_text: str, pages: list[dict] | None, max_chars: int = 3000) -> str:
    first_page = (pages[0]["text"] if pages else full_text)[:2000]

    headings = [
        h.strip() for h in HEADING_RE.findall(full_text)
        if not h.lower().startswith("page ")
    ]
    heading_text = "\n".join(dict.fromkeys(headings))[:1000]   # dedupe, keep order

    return f"{first_page}\n\n{heading_text}".strip()[:max_chars]