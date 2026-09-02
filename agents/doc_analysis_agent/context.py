from pydantic import BaseModel, Field
from typing import Literal, List
from langchain_core.prompts import ChatPromptTemplate

from core.configurations import chat_model
# from api.models.users import Users



class DocumentAnalysis(BaseModel):
    document_type: str
    summary: str | None
    topics: List[str]
    key_points: list[str]
    entities: list[str]
    is_unclear: bool
    confidence: float


class DocAnalysisService:
    def __init__(self):
        self.llm = chat_model
        self.structured_llm = self.llm.with_structured_output(DocumentAnalysis)

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """
            You are a Document Analysis Agent.
            Your responsibilities:
            1. Identify the document type.
            2. Produce a concise summary of salient information.
            3. Identify the main topics.
            4. Extract the most important factual points.
            5. Identify important people, organizations, locations, or other entities.
            6. Assess whether the document is unclear or unreadable.
            7. Estimate confidence in the analysis.

            The document may contain OCR errors, formatting artifacts, incomplete text, or extraction noise.

            Analyze only information supported by the document.
            Do not invent missing information.

            """),
            ("human", "User Prompts: {user_prompt}\n\nDocument Content:\n{document_text}")
        ])

        self.chain = self.prompt | self.structured_llm

    async def analyze(self, document_text:str, user_prompt: str = "Perform a general analysis of this document.")->DocumentAnalysis:
        return await self.chain.ainvoke({
            "document_text":document_text,
            "user_prompt": user_prompt
        })
