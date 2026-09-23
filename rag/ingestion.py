from __future__ import annotations

import asyncio
import uuid
import anydoc
import io
import pypdfium2 as pdfium

from dataclasses import dataclass, field
from typing import Any
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

from api.models.document import DocumentVersion
from core.dependencies import Deps, SessionLocal, deps
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from api.models.document import DocumentVersion, DocumentChunks
from rag.worker import celery_app



from depicdoc import linearize_document


@dataclass
class FileChunk:
    document_version_id: int
    file_name: str
    chunk_id: str
    content: str
    metadata: dict[str, Any] = field(default_factory=dict)


ocr_engine = RapidOCR()

def _ocr_pil_image(image: Image.Image)->str:
    try:
        result, _ = ocr_engine(image)
        if not result:
            return ""

        lines = [line[1] for line in result if len(line) > 1 and line[1]]
        return "\n".join(lines)

    except Exception as e:
        print(f"[OCR] RapidOCR error on image: {str(e)}")
        return ""


#extract text from raw image bytes (.png, jpeg, etc.)
def _extract_from_image_bytes(image_bytes: bytes)->str:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        return _ocr_pil_image(image)
    except Exception as e:
        print(f"[OCR] Errror Decoding image bytes: {str(e)}")
        return ""

#render pdf pages as images and runs OCR on each page.
def _extract_from_scanned_pdf(file_bytes:bytes)->str:
    try:
        pdf = pdfium.PdfDocument(file_bytes)
        page_texts = []
        for index in range(len(pdf)):
            page = pdf[index]
            pil_image = page.render(scale=2.0).to_pil()
            page_content = _ocr_pil_image(pil_image)
            if page_content.strip():
                page_texts.append(f"## Page {index + 1} \n\n{page_content.strip()}")
        return "\n\n".join(page_texts)

    except Exception as e:
        print(f"[OCR] Error running OCR on PDF pages: {e}")
        return ""


#orchestrates digital text + ocr page by page
# - Page has digital text -> Fast digital extraction
# - Page is an image/scan -> RapidOCR takes over
# - Stitches everything together in original order
def extract_pdf_interleaved(file_bytes:bytes)->str:
    try:
        pdf = pdfium.PdfDocument(file_bytes)
        assembled_pages = []

        for page_index in range(len(pdf)):
            page = pdf[page_index]

            text_page = page.get_textpage()
            digital_text = text_page.get_text_range().strip()

            alnum_count = sum(c.isalnum() for c in digital_text)

            if alnum_count >= 15:
                assembled_pages.append(f"## Page {page_index + 1}\n\n{digital_text}")

            else:
                pil_image = page.render(scale=2.0).to_pil()
                ocr_text = _ocr_pil_image(pil_image)

                if sum(c.isalnum() for c in ocr_text) > alnum_count:
                    assembled_pages.append(f"## Page {page_index + 1} [Scanned Page]")
                elif digital_text:
                    assembled_pages.append(f"## Page {page_index + 1}\n\n{digital_text}")


        return "\n\n".join(assembled_pages)
    except Exception as e:
        print(f"[Ingestion] Interleaved PDF extraction error: {str(e)}")
        return ""
    


async def extract_text(file_bytes:bytes,  file_name: str = "")->str:
    ext = file_name.lower().split(".")[-1] if "." in file_name else ""

    if ext in ["png", "jpg", "jpeg", "webp", "tiff", "bmp"]:
        print(f"[Ingestion] '{file_name}' detected as image. Running RapidOCR...")

        # return _extract_from_image_bytes(file_bytes)
        return await asyncio.to_thread(_extract_from_image_bytes, file_bytes) #offload ocr to a separate thread

    #raw text and data files
    if ext in ["txt", "csv", "md"]:
        print(f"[Ingestion] '{file_name}' detected as text file. Decoding...")

        # return file_bytes.decode("utf-8", errors="ignore")
        return asyncio.to_thread(anydoc.to_markdown_bytes, file_bytes) #offload anydoc parsing

    #office documents
    if ext in ["docx", "pptx", "xlsx", "doc"]: 
        # return anydoc.to_markdown_bytes(file_bytes)
        return await asyncio.to_thread(anydoc.to_markdown_bytes, file_bytes)

    print(f"[Ingestion] Processing PDF '{file_name}' through Interleaved Engine...")

    # result = extract_pdf_interleaved(file_bytes)
    result = await asyncio.to_thread(extract_pdf_interleaved, file_bytes) #off load pdf rendering and ocr extrction
    if result and len(result.strip()) > 0:
        return result

    # return anydoc.to_markdown_bytes(file_bytes)
    return await asyncio.to_thread(anydoc.to_markdown_bytes, file_bytes)


# async def extract_text(file_bytes: bytes) -> str:
#     markdown = anydoc.to_markdown_bytes(file_bytes)
#     return markdown


def chunk_text(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 200,
) -> list[str]:
    if not text:
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", " ", ""],
    )
    return splitter.split_text(text)


async def insert_file_chunk(
    sem: asyncio.Semaphore,
    deps: Deps,
    chunk: FileChunk,
) -> None:
    async with sem:
        unique_string = f"{chunk.document_version_id}_chunk_{chunk.chunk_id}"
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, unique_string))

        try:
            document = Document(
                page_content=chunk.content,
                metadata={
                    **chunk.metadata,
                    "document_version_id": chunk.document_version_id,
                    "file_name": chunk.file_name,
                    "chunk_id": chunk.chunk_id,
                },
            )

            await deps.vector_store.aadd_documents(
                documents=[document],
                ids=[point_id],
            )

        except Exception:
            raise


async def process_uploaded_file(
    document_version_id: int, file_name: str, file_path: str
) -> None:
    text_chunk = []
    document_id = version_number = clearance_level = None
    try:
        # print(f"Extracting Text from {document_version_id}")

        async with SessionLocal() as db_session:
            query = (
                select(DocumentVersion)
                .where(DocumentVersion.id == document_version_id)
                .options(selectinload(DocumentVersion.document))
            )
            result = await db_session.execute(query)
            version = result.scalar_one_or_none()

        if not version or not version.document:
            raise ValueError(
                f"DocumentVersion {document_version_id} or parent Document not found"
            )

        document_id = version.document_id
        version_number = version.version_number
        clearance_level = (
            version.document.clearance_level.value
            if hasattr(version.document.clearance_level, "value")
            else str(version.document.clearance_level)
        )

        with open(file_path, "rb") as f:
            file_bytes = f.read()

        # markdown = await extract_text(file_bytes)
        markdown = await extract_text(file_bytes, file_name=file_name)

        # linearized_markdown = linearize_document(markdown)
        # text_chunk = chunk_text(linearized_markdown)
        linearized_markdown = await asyncio.to_thread(linearize_document, markdown) 
        text_chunk = await asyncio.to_thread(chunk_text, linearized_markdown)

        table_chunks = [c for c in text_chunk if "[Columns:" in c or " | " in c]


        # print(
        #     f"[DepicDocs] Version {document_version_id}: Generated {len(text_chunk)} chunks "
        #     f"({len(table_chunks)} table chunks detected)"
        # )


        for idx, t_chunk in enumerate(table_chunks[:2]):
            print(f"[DepicDocs] Table Sample #{idx+1}:\n{t_chunk[:200]}...")

        file_chunks = [
            FileChunk(
                document_version_id=document_version_id,
                file_name=file_name,
                chunk_id=str(i),
                content=chunk,
                metadata={
                    "document_id": document_id,
                    "version_number": version_number,
                    "clearance_level": clearance_level,
                },
            )
            for i, chunk in enumerate(text_chunk)
        ]

        sem = asyncio.Semaphore(5)
        task = [insert_file_chunk(sem, deps, chunk) for chunk in file_chunks]
        await asyncio.gather(*task)

        async with SessionLocal() as db_session:
            version = await db_session.get(DocumentVersion, document_version_id)
            if version:
                version.status = "indexed"
                await db_session.commit()

        print(f"[DepicDocs] Version {document_version_id} successfully indexed into vector store!")

    except Exception as e:
        print(f"Ingestion Failed for version {document_version_id}: {e}")
        async with SessionLocal() as db_session:
            for i, chunk_content in enumerate(text_chunk):
                db_chunk = DocumentChunks(
                    start_char_idx=0,
                    chunk_index=1,
                    content=chunk_content,
                    page_number=None,
                    token_count=len(chunk_content.split()),
                    vector_id=i,
                    chunk_metadata={
                        "document_id": document_id,
                        "version_number": version_number,
                        "clearance_level": clearance_level,
                    },
                    created_at=datetime.now(),
                )
                db_session.add(db_chunk)

            version = await db_session.get(DocumentVersion, document_version_id)
            if version:
                version.status = "failed"
            await db_session.commit()



            # version = await db_session.get(DocumentVersion, document_version_id)
            # if version:
            #     version.status = "failed"
            #     await db_session.commit()


@celery_app.task(name="task.process_document", bind=True, max_retries=3)
def process_document_task(self, document_version_id: int, file_name: str, file_path:str):
    #synchronous tasks that spins up an event loop to run the async ingestion layer
    print(f"[CELERY] starting ingestion for {file_name} (version ID: {document_version_id})")

    try:
        #run the async ingestion pipeline in the celery worker
        asyncio.run(process_uploaded_file(document_version_id, file_name, file_path))
        return {"status":"success", "document_version_id": document_version_id}

    except Exception as e:
        print(f"[CELERY] Task failed: {e}")
        raise self.retry(exc=e, countdown=60)