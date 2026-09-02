from pydantic import BaseModel, Field
from typing import Literal
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from core.configurations import chat_model

from api.models.users import Users

class IntentClassification(BaseModel):
    intent: Literal[
        "analyze_document",
        "retrieve_document",
        "check_leave_credits",
        "process_attachments",
        "general_conversation",
        "unclear"
    ] = Field(
        description="Classify the user's question into one of the exact intents."
    )


class IntentClassifierService:
    def __init__(self):
        self.llm = chat_model
        self.structured_llm = self.llm.with_structured_output(IntentClassification)

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Chat Supervisor coordinating a multi-agent system.
            Route the user's question to the correct agent based on these rules:
            - analyze_document: For questions asking to summarize, explain, or extract data from a document.
            - retrieve_document: For finding, searching, or fetching files/documents from a database.
            - check_leave_credits: For questions about vacation days, sick leave, or PTO balances.
            - process_attachments: For handling newly uploaded files or attachments.
            - unclear: If the request doesn't match any of the above or is ambiguous.
            
                
            """),
            ("human", "{question}")
        ])

        self.chain = self.prompt | self.structured_llm

    async def detect_intent(self, question: str) -> str:
        try:
            result = await self.chain.ainvoke({"question": question})
            return result.intent

        except Exception as e:
            print(f"Classification error: {str(e)}")
            return "unclear"

classifier_service = IntentClassifierService()

