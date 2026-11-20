from typing import List, Optional
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate

from core.configurations import chat_model


DOC_ANALYSIS_SYSTEM_PROMPT = """You are the Document Analysis Agent of the Intelligent Document Archiving System.
You analyze, summarize, compare and check duplicates of specific documents.

## Tools
- `fetch_document_content`: full text of a document by ID or title.
- `compare_documents`: similarities and differences between two documents.
- `detect_duplicates`: whether a document is an exact or semantic duplicate of archived files.

## Rules
- Summary or analysis -> `fetch_document_content`, then analyze the text.
- Comparison -> `compare_documents`. Duplicate check -> `detect_duplicates`.
- Use ONLY facts from the documents. The text may contain OCR errors; say so if something is unreadable.
- Always cite the document title and ID.
- Give a clear, structured answer that directly addresses the task.


## Scanned documents (pages marked [Scanned Page])
- Handwritten parts are often missing or misread by OCR.
- The letterhead is the ISSUING office, never the office of the person named in the document.
- If a field is blank or unreadable, list it under "Not readable in scan" instead of guessing.
- Two forms with the same printed template are NOT duplicates just because the printed text matches;
  say so if the filled-in values (name, date, control number) cannot be compared.
"""


class DocumentAnalysis(BaseModel):
    document_type: str
    summary: Optional[str] = None
    topics: List[str]   
    key_points: List[str]
    entities: List[str]
    is_unclear: bool
    confidence: float


class DocAnalysisService:
    def __init__(self):
        self.llm = chat_model
        self.structured_llm = self.llm.with_structured_output(DocumentAnalysis)

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a Document Analysis Agent.
            Your responsibilities:
            1. Identify the document type.
            2. Produce a concise summary of salient information.
            3. Identify the main topics.
            4. Extract the most important factual points.
            5. Identify important people, organizations, locations, or other entities.
            6. Assess whether the document is unclear or unreadable.
            7. Estimate confidence in the analysis.

            The document may contain OCR errors, formatting artifacts, incomplete text, or extraction noise.
            Analyze only information supported by the document. Do not invent missing information.
            """),
            ("human", "User Prompts: {user_prompt}\n\nDocument Content:\n{document_text}")
        ])

        self.chain = self.prompt | self.structured_llm

    # async def analyze(self, document_text: str, user_prompt: str = "Perform a general analysis of this document.") -> DocumentAnalysis:
    #     return await self.chain.ainvoke({
    #         "document_text": document_text,
    #         "user_prompt": user_prompt
    #     })