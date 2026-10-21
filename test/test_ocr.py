import asyncio
import sys
from rag.extractor import extract_text

path = sys.argv[1]
with open(path, "rb") as f:
    data = f.read()

result = asyncio.run(extract_text(data, file_name=path))
print(f"extractor={result.extractor} scanned={result.is_scanned} score={result.ocr_score:.2f}\n")
print(result.text[:3000])