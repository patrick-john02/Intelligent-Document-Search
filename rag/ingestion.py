from langchain_ollama import OllamaEmbeddings
from pypdf import PdfReader
from docx import Document as DocxDocument
from langchain_core.documents import Document
from pptx import Presentation
from fastapi import File, UploadFile
from typing import Dict, Any, AsyncGenerator
from langchain_ollama import OllamaLLM
from dataclasses import dataclass, field
from openpyxl import load_workbook
from PIL import Image
from core.dependencies import Deps
from langchain_text_splitters import RecursiveCharacterTextSplitter

import pandas as pd
import uuid
import numpy as np
import asyncio
import io
import anydoc

@dataclass
class FileChunk:
    file_name: str
    chunk_id: str
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def embedding_content(self)->str:
        return f"File: {self.file_name}\n\n{self.content}"


#Extraction of text we need to identify the extension name
#split the file name and .pdf for example
#i will be using the anydoc library for text extraction, rather than doing if else
async def extract_text(file_name: str, file_bytes:bytes)->tuple[str, Dict[str,Any]]:
    
    
    markdown = anydoc.to_markdown_bytes(file_bytes)
    return markdown

#     if extension == 'pdf':
#         pdf_reader = PdfReader(io.BytesIO(file_bytes))
#         text = "\n".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])

#         if pdf_reader.metadata:
#             metadata = {key.strip('/'): value for key, value in pdf_reader.metadata.items()}


#     elif extension == "docx":
#         word_reader = DocxDocument(io.BytesIO(file_bytes))

#         text = "\n".join([paragraph.text for paragraph in word_reader.paragraphs])

#         core_props = word_reader.core_properties
#         metadata = {
#             "author": core_props.author,
#             "title": core_props.title,
#             "subject": core_props.subject,
#             "created": core_props.created,
#             "modified": core_props.modified
#         }

#         metadata = {key: value for key, value in metadata.items() if value is not None}


#     elif extension == "xlsx":
#         excel_reader = io.BytesIO(file_bytes)
#         dataframe = pd.read_excel(excel_reader)

#         text = dataframe.to_string(index=False)

#         excel_reader.seek(0)
#         workbook = load_workbook(excel_reader, read_only=True)
#         core_props = workbook.properties

#         metadata = {
#             "creator": core_props.creator or "Unknown",
#             "title": core_props.title or "Unknown",
#             "created": core_props.created or "Unknown",
#             "modified": core_props.modified or "Unknown"
#         }

    # if extension in ["jpg", "jpeg", "png"]:
    #     image_reader = Image.open(io.BytesIO(file_bytes))

    #     metadata = {
    #         "format": image_reader.format,
    #         "width": image_reader.width,
    #         "height": image_reader.height,
    #         "mode": image_reader.mode,
    #     }

    # else:
    #     raise ValueError(f"Unsupport file extension {extension}")

    # return text, metadata
    



def chunk_text(
        text:str,
        chunk_size: int = 1000,
        overlap: int = 200 
)->list[str]:
    
    if not text:
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size = chunk_size, 
        chunk_overlap = overlap,
        separators=["\n\n", "\n", " ", ""]

    )
    return splitter.split_text(text)

async def insert_file_chunk(
        sem: asyncio.Semaphore,
        deps:Deps,
        chunk: FileChunk,
)->None:
    async with sem:
        unique_string =  f"{chunk.file_name}_chunk_{chunk.chunk_id}"
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, unique_string))
        
        try:
            # embedding_response = await deps.embedding_client.aembed_documents(
            #     [chunk.embedding_content()]
            # )
            
            # vector = embedding_response[0]
            
            document = Document(
                page_content=chunk.content,
                metadata={
                **chunk.metadata,
                "file_name": chunk.file_name,
                "chunk_id": chunk.chunk_id
                },
        )
            
            await deps.vector_store.aadd_documents(
                documents=[document],
                ids=[point_id],
            )


        except Exception as e:
            return f"Failed to upload the embeddings"

async def process_uploaded_file(file_name: str, file_bytes: bytes, deps=Deps):

    print(f"Extracting Text from {file_name}")

    try:
        raw_text, metadata = await extract_text(file_name, file_bytes)

    except Exception as e:
        print(f"Failed to Processs the uploaded File") 
        return


    text_chunk = chunk_text(raw_text)

    file_chunks = [
        FileChunk(file_name=file_name, chunk_id=str(i), content=chunk, metadata=metadata)

        for i, chunk in enumerate(text_chunk)


    ]

    sem = asyncio.Semaphore(5)
    task = [insert_file_chunk(sem, deps, chunk) for chunk in file_chunks]
    await asyncio.gather(*task)

