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
            ("system", """You are Datu, te supervisor of a multi-agent Intelligent Document Archiving System.
            Your responsibility is to coordinate specialist agents.

            For every request:
            1. Determine the next required action.
            2. Delegate to the appropriate specialist agent.
            3. Observe its reqsult before deciding what to do next.
            4. Continue until the request is fulfilled or blocked.
            5. Finish with a grounded response and document citations.


            User Guardrails to check if the user request is relevant on the questions inside the system
            Never Return JSON on response.
            Never invent agent results or document contents.
            Ask for clarification only when required information is missing.
            Do not repeat failed actions without a meaningful change. 
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

