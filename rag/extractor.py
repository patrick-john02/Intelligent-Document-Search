#rag/extractor.py handles extraction & OCR.
from __future__ import annotations

import re
import asyncio 
import mimetypes
import io
from dataclasses import dataclass
from PIL import Image
import pypdfium2 as pdfium
from rapidocr_onnxruntime import RapidOCR
import anydoc

# Two boxes are on the same row if their vertical centers are within this
# fraction of the smaller box height. Raise to ~0.7 for skewed scans.
ROW_TOLERANCE = 0.5
# A horizontal gap wider than this many text-heights means a new column/cell.
COLUMN_GAP_FACTOR = 1.5
COLUMN_SEPARATOR = " | "
MIN_BOX_SCORE = 0.65 



@dataclass
class ExtractionResult:
    text:str
    is_scanned:bool=False
    ocr_score:float=1.0 #to see how confident the OCR engine is that it recognized the text correctly.
    extractor: str = "unknown" 


#initialize ocr engine    
ocr_engine=RapidOCR()

def _ocr_pil_image_with_score(image: Image.Image) -> tuple[str, float]:
    try:
        result, _ = ocr_engine(image)
        if not result:
            return "", 0.0

        items: list[tuple[list, str]] = []
        scores: list[float] = []

        for line in result:
            # RapidOCR line = [box, text, score]
            if len(line) < 2 or not line[1]:
                continue
            text = str(line[1]).strip()
            if not text:
                continue

            score = None
            if len(line) > 2:
                try:
                    score = float(line[2])
                except (TypeError, ValueError):
                    pass

            # print(f"{score if score is not None else -1:.2f}  {text}")  # DEBUG: remove after tuning

            if score is not None and score < MIN_BOX_SCORE:
                continue  # skip stamp/handwriting noise

            items.append((line[0], text))
            if score is not None:
                scores.append(score)

        if not items:
            return "", 0.0

        rows = _group_boxes_into_rows(items)
        avg_score = (sum(scores) / len(scores)) if scores else 1.0
        return "\n".join(rows), avg_score

    except Exception as e:
        print(f"[OCR] RapidOCR error on image: {str(e)}")
        return "", 0.0
    


def _extract_from_image_bytes(image_bytes:bytes)-> tuple[str, float]:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        return _ocr_pil_image_with_score(image)
    except Exception as e:
        print(f"[OCR] Error decoding image bytes: {str(e)}")
        return "", 0.0




#orchestrates digital text + ocr page by page
# - Page has digital text -> Fast digital extraction
# - Page is an image/scan -> RapidOCR takes over
# - Stitches everything together in original order

def extract_pdf_interleaved(file_bytes: bytes) -> tuple[str, bool, float]: 
    pdf=None
    try:
        pdf = pdfium.PdfDocument(file_bytes)
        assembled_pages: list[str] = []
        has_scanned = False
        ocr_scores: list[float] = []

        for page_index in range(len(pdf)):
            page = pdf[page_index]
            text_page = page.get_textpage()
            digital_text = text_page.get_text_range().strip()
            alnum_count = sum(c.isalnum() for c in digital_text)

            if alnum_count >= 100:
                assembled_pages.append(f"## Page {page_index + 1}\n\n{digital_text}")
            else:
                pil_image = page.render(scale=2.0).to_pil()
                ocr_text, score = _ocr_pil_image_with_score(pil_image)
                ocr_alnum = sum(c.isalnum() for c in ocr_text)

                if ocr_alnum > alnum_count:
                    has_scanned = True
                    if score > 0:
                        ocr_scores.append(score)
                    assembled_pages.append(
                        f"## Page {page_index + 1} [Scanned Page]\n\n{ocr_text.strip()}"
                    )
                elif digital_text:
                    assembled_pages.append(f"## Page {page_index + 1}\n\n{digital_text}")

        avg_score = (
            (sum(ocr_scores) / len(ocr_scores))
            if ocr_scores
            else (1.0 if not has_scanned else 0.0)
        )
        return "\n\n".join(assembled_pages), has_scanned, avg_score
            
    except Exception as e:
        print(f"[Extractor] Interleaved PDF extraction error: {str(e)}")
        return "", False, 0.0

    finally:
            if pdf is not None:
                pdf.close()
                
                
#HELPERS
def _box_geometry(box) -> tuple[float, float, float, float]:
    xs = [float(p[0]) for p in box]
    ys = [float(p[1]) for p in box]
    return min(xs), max(xs), min(ys), max(ys)

def _group_boxes_into_rows(items: list[tuple[list, str]]) -> list[str]:
    boxes = []
    for box, text in items:
        x0, x1, y0, y1 = _box_geometry(box)
        boxes.append({
            "x0": x0,
            "x1": x1,
            "yc": (y0 + y1) / 2,
            "h": max(1.0, y1 - y0),
            "text": text,
        })
    boxes.sort(key=lambda b: b["yc"])

    # group boxes whose vertical centers line up
    rows: list[list[dict]] = []
    for b in boxes:
        if rows:
            row = rows[-1]
            row_yc = sum(r["yc"] for r in row) / len(row)
            row_h = sum(r["h"] for r in row) / len(row)
            if abs(b["yc"] - row_yc) <= ROW_TOLERANCE * min(b["h"], row_h):
                row.append(b)
                continue
        rows.append([b])

    # join each row left-to-right; big gaps become a column separator
    lines: list[str] = []
    for row in rows:
        row.sort(key=lambda r: r["x0"])
        avg_h = sum(r["h"] for r in row) / len(row)
        parts = [row[0]["text"]]
        for prev, cur in zip(row, row[1:]):
            gap = cur["x0"] - prev["x1"]
            parts.append(COLUMN_SEPARATOR if gap > COLUMN_GAP_FACTOR * avg_h else " ")
            parts.append(cur["text"])
        lines.append("".join(parts).strip())

    return lines

#i used the kreuzberg as a primary extractor because of its performance
async def _extract_text_kreuzberg(file_bytes: bytes, file_name: str)->ExtractionResult | None:
    
    try:
        from kreuzberg import extract_bytes
        
        mime_type, _ = mimetypes.guess_type(file_name)
        mime_type = mime_type or "application/octet-stream"
        
        result = await extract_bytes(file_bytes, mime_type=mime_type)
        if result and getattr(result, "content", None):
            return ExtractionResult(
                text=result.content.strip(),
                extractor="kreuzberg",
                is_scanned=False,
                ocr_score=1.0,
            )
        return None
    
    except ImportError:
        return None
    
    except Exception as e:
        print(f"[Extractor] Kreuzberg skipped for '{file_name}':  {str(e)}")
        return None
    
        
        
#content and structure validator
#this will inspect extraction output to decide if it meets quality standards or requires specialized OCR/parser fallback.
class ExtractionQualityGate:
    
    @staticmethod
    def is_acceptable(result:ExtractionResult | None, file_name: str, file_bytes: bytes)->bool:
        if result is None or not result.text or len(result.text.strip()) == 0:
            return False
        
        ext = file_name.lower().split(".")[-1] if "." in file_name else ""
        
        if ext == "pdf" and len(file_bytes) > 10240 and len(result.text.strip()) < 50:
            return False
        
        
        if ext == "pdf" and "## Page " not in result.text:
            return False
        
        return True



#THE FALLBACK
async def _extract_text_fallback(file_bytes: bytes, file_name: str = "") -> ExtractionResult:
    ext = file_name.lower().split(".")[-1] if "." in file_name else ""

    if ext in ["png", "jpg", "jpeg", "webp", "tiff", "bmp"]:
        print(f"[Extractor] '{file_name}' detected as image. Running RapidOCR...")
        text, score = await asyncio.to_thread(_extract_from_image_bytes, file_bytes)
        return ExtractionResult(text=text, is_scanned=True, ocr_score=score, extractor="rapidocr")

    if ext in ["txt", "csv", "md"]:
        print(f"[Extractor] '{file_name}' detected as text file. Decoding...")
        text = await asyncio.to_thread(anydoc.to_markdown_bytes, file_bytes)
        return ExtractionResult(text=text or "", is_scanned=False, ocr_score=1.0, extractor="anydoc")

    if ext in ["docx", "pptx", "xlsx", "doc"]:
        print(f"[Extractor] '{file_name}' detected as office document. Parsing...")
        text = await asyncio.to_thread(anydoc.to_markdown_bytes, file_bytes)
        return ExtractionResult(text=text or "", is_scanned=False, ocr_score=1.0, extractor="anydoc")

    print(f"[Extractor] Processing PDF '{file_name}' through Interleaved Engine...")
    pdf_text, is_scanned, score = await asyncio.to_thread(
        extract_pdf_interleaved, file_bytes
    )
    if pdf_text and len(pdf_text.strip()) > 0:
        return ExtractionResult(text=pdf_text, is_scanned=is_scanned, ocr_score=score, extractor="pdf_interleaved")

    try:
        fallback_text = await asyncio.to_thread(anydoc.to_markdown_bytes, file_bytes)
    except Exception as e:
        print(f"[Extractor] anydoc fallback failed for '{file_name}': {e}")
        fallback_text = ""
    return ExtractionResult(text=fallback_text or "", is_scanned=False, ocr_score=1.0, extractor="anydoc")       
        


#router endpoint
#will try kreuzberg->output throught the extractionqualitygate->pass->if failed routes to fall back engine(fail)
async def extract_text(file_bytes:bytes, file_name: str = "" )->ExtractionResult:

    # PDFs go straight to the interleaved engine: Kreuzberg output has no "## Page N"
    # markers, so it could never pass the quality gate and only wasted a full parse.
    # The interleaved engine also keeps page numbers and OCRs scanned pages individually.
    ext = file_name.lower().rsplit(".", 1)[-1] if "." in file_name else ""
    if ext == "pdf":
        print(f"[EXTRACTOR] '{file_name}' is a PDF; using interleaved engine.")
        return await _extract_text_fallback(file_bytes, file_name)

    result = await _extract_text_kreuzberg(file_bytes, file_name)
    
    if ExtractionQualityGate.is_acceptable(result, file_name, file_bytes):
        print(f"[EXTRACTOR] '{file_name}' passed quality gate via primary (Kreuzberg)")
        
        return result
    
    print(f"[EXTRACTOR] '{file_name}' routed to Specialized fallback engine.")
    return await _extract_text_fallback(file_bytes, file_name)
    

#added this helper at the botom. it turns the ## Page N markers into per-page records.
PAGE_HEADER_RE = re.compile(r"^## Page (\d+)( \[Scanned Page\])?\s*$", re.MULTILINE)


def split_page(text:str)->list[dict]:
    matches=list(PAGE_HEADER_RE.finditer(text))
    if not matches:
        return [{"page": None, "text":text.strip(), "is_ocr":False}]

    pages:list[dict] = []
    for i, match in enumerate(matches):
        start = match.end()
        end = matches[i+1].start() if i + 1 < len(matches) else len(text) 
        pages.append({
            "page": int(match.group(1)),
            "text": text[start:end].strip(),
            "is_ocr":bool(match.group(2))
        })

    return pages

