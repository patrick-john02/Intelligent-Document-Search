from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import ChatPromptTemplate

#imports
from core.dependencies import chat_model

class DocumentSearching(BaseModel):
    answer: str=Field(description="The conversational, natural answer to the user's questions")
    citations: List[str] = Field(default_factory=list, description="Document title, versions , or page numbers cited")
    topics: List[str] = Field(default_factory=list, description="Key topics covered in this response")
    is_unclear: bool = Field(default=False, description="True if question is ambiguous or documents lack information")
    confidence: float = Field(default=1.0, description="Confidence score between 0.0 and 1.0")


class DocumentSearchingService:
    def __init__(self):
        self.llm=chat_model
        self.structured_llm = self.llm.with_structured_output(DocumentSearching)

        self.prompt = ChatPromptTemplate.from_messages([
            ("System", """ 
            You are a Researcher Agent that has knowledge about document uploaded on the database or vector database.
            
            Your responsibilities:
            1. Answer conversationally, warmly, and clearly.
            2. If the user asks follow-up questions, use the conversation context.
            3. always cite whic document title and page number you found in the information in.
            4. If the retrieved documents do not contain the answer, politely state: "I coundn't find any documents dicussing that topic in our archive.


            """),
            ("Human", "Conversation History:\n{chat_history}\n\nRetrieved Excerpts:\n}retrieved_docs}\n\nUser Question:{question}")

        ])

        self.chain = self.prompt | self.structured_llm


    async def search(
        self, 
        question: str,
        retrieved_docs: str="",
        chat_history: str=""
    )->DocumentSearching:

        return await self.chain.ainvoke({
            "question":question,
            "retrieved_docs":retrieved_docs if retrieved_docs.strip() else "No document excepts retrieved",
            "chat_history":chat_history if chat_history.strip() else "No prior history.",
        })
    

researcher_service = DocumentSearchingService()


    


        
