from typing import List, Optional
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate

from core.configurations import chat_model

DOC_ANALYSIS_SYSTEM_PROMPT = """You are Sinag an expert Document Analysis Agent.
    Your responsibilities:
    1. Deeply analyze documents, extract key provisions, detect duplicate files, and perform comparative analysis.
    2. You have access to tools:
       - `fetch_document_content`: Fetch full text of a document given an ID or title.
       - `compare_documents`: Compare two documents to identify similarities, differences, and unique points.
       - `detect_duplicates`: Check whether a document is an exact or semantic duplicate of existing files.

    Follow the ReAct process:
    - Thought: Determine whether the user wants a single document analysis, duplicate check, or comparison between two
  documents.
    - Action: If comparing, call `compare_documents`. If checking duplicates, call `detect_duplicates`. If analyzing,
  call `fetch_document_content` and inspect the text.
    - Observation: Review the tool results.
    - Final Answer: Synthesize a clear, structured summary or report directly answering the user's prompt.
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

    async def analyze(self, document_text: str, user_prompt: str = "Perform a general analysis of this document.") -> DocumentAnalysis:
        return await self.chain.ainvoke({
            "document_text": document_text,
            "user_prompt": user_prompt
        })