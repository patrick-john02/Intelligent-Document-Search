from __future__ import annotations

import asyncio 
import io
from dataclasses import dataclass
from PIL import Image
import pypdfium2 as pdfium
from rapidocr_onnxruntime import RapidOCR
import anydoc

@dataclass
class ExtractionResult:
    text:str
    is_scanned:bool=False
    ocr_score:float=1.0


#initialize ocr engine    
ocr_engine=RapidOCR()

def _ocr_pil_image_with_score(image: Image.Image) -> tuple[str, float]:
    try:
        result, _  = ocr_engine(image)
        if not result:
            return "", 0.0
        
        lines: list[str] = []
        scores: list[float] = []
        for line in result:
            if len(line) > 1 and line[1]:
                lines.append(line[1])
                if len(line) > 2 and isinstance(line[2], (int, float)):
                    scores.append(float(line[2]))
                    
        avg_score = (sum(scores) / len(scores)) if scores else 1.0
        return "\n".join(lines), avg_score
    
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

            if alnum_count >= 15:
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


async def extract_text(file_bytes: bytes, file_name: str = "") -> ExtractionResult:
    ext = file_name.lower().split(".")[-1] if "." in file_name else ""

    if ext in ["png", "jpg", "jpeg", "webp", "tiff", "bmp"]:
        print(f"[Extractor] '{file_name}' detected as image. Running RapidOCR...")
        text, score = await asyncio.to_thread(_extract_from_image_bytes, file_bytes)
        return ExtractionResult(text=text, is_scanned=True, ocr_score=score)

    if ext in ["txt", "csv", "md"]:
        print(f"[Extractor] '{file_name}' detected as text file. Decoding...")
        text = await asyncio.to_thread(anydoc.to_markdown_bytes, file_bytes)
        return ExtractionResult(text=text or "", is_scanned=False, ocr_score=1.0)

    if ext in ["docx", "pptx", "xlsx", "doc"]:
        print(f"[Extractor] '{file_name}' detected as office document. Parsing...")
        text = await asyncio.to_thread(anydoc.to_markdown_bytes, file_bytes)
        return ExtractionResult(text=text or "", is_scanned=False, ocr_score=1.0)

    print(f"[Extractor] Processing PDF '{file_name}' through Interleaved Engine...")
    pdf_text, is_scanned, score = await asyncio.to_thread(
        extract_pdf_interleaved, file_bytes
    )
    if pdf_text and len(pdf_text.strip()) > 0:
        return ExtractionResult(text=pdf_text, is_scanned=is_scanned, ocr_score=score)

    fallback_text = await asyncio.to_thread(anydoc.to_markdown_bytes, file_bytes)
    return ExtractionResult(text=fallback_text or "", is_scanned=False, ocr_score=1.0)        
        
