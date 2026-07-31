from pydantic import BaseModel, Field
from typing import Literal
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from core.configurations import chat_model

class IntentClassification(BaseModel):
    intent: Literal[
        "analyze_document",
        "retrieve_document",
        "check_leave_credits",
        "process_attachments",
        "unclear"
    ] = Field(
        description="Classify the user's question into one of the exact intents."
    )


class IntentClassifierService:
    def __init__(self):
        self.llm = ChatOllama(temperature=0, model=chat_model)
        self.structured_llm = self.llm.with_structured_output(IntentClassification)

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """Your are the Chat Supervisor coordinating a multi-agent system.
            Route the user's question to the correct agent based on these rules:
            - analyze_document: For questions asking to summarize, explain, or extract data from a document.
            - retrieve_document: For finding, searching, or fetching files/documents from a database.
            - check_leave_credits: For questions about vacation days, sick leave, or PTO balances.
            - process_attachments: For handling newly uploaded files or attachments.
            - unclear: If the request doesn't match any of the above or is ambiguous.
            Note: Users may have typos or poor grammar. Focus on the core intent of their request.
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

# Instantiate the service to be imported by nodes.py
classifier_service = IntentClassifierService()

