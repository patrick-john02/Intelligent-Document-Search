import asyncio
import sys
from pathlib import Path
from rag.extractor import extract_text
from rag.text_quality import assess_text_quality


async def main(path: str):
    data = Path(path).read_bytes()
    r = await extract_text(data, file_name=Path(path).name)
    print(r.text[:2500])
    print("\nOCR score:", round(r.ocr_score, 3), "| scanned:", r.is_scanned)
    print("Review reasons:", assess_text_quality(r.text, r.is_scanned, r.ocr_score))


asyncio.run(main(sys.argv[1]))


#uv run python -m test.try_text_quality "documents\pdf\<folder>\<file>.pdf"