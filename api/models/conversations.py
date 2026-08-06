from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy import Enum as SQLEnum
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from api.models.users import Users
    from api.models.document import DocumentChunks, DocumentVersion


from api.models.base import Base


class SenderType(Enum):
    USER = "user"
    SUPERVISOR = "supervisor"
    SR_AGENT = "semantic_retrieval_agent"
    SYNTHESIS_AGENT = "synthesis_agent"
    ANALYTICS_AGENT = "analytics_agent"
    QA_AGENT = "quality_assurance_agent"


    
    

class Conversation(Base):
    __tablename__ = "conversation"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[int] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)

    user_id: Mapped[int] = mapped_column(ForeignKey("Users.id"))
    user_conversations: Mapped["Users"] = relationship(back_populates="conversations")

    messages: Mapped[list["ChatMessages"]] = relationship(back_populates="conversation")
    message_sources: Mapped["ChatMessages"] = relationship(back_populates="messsage")

    

class ChatMessages(Base):
    __tablename__ = "chat_messages"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sender_type: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tokens_used: Mapped[int] = mapped_column(Integer(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)

    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversation.id"))
    conversation: Mapped["Conversation"] = relationship(back_populates="messages")

class ChatMessageSources(Base):
    __tablename__ = "chat_messages_sources"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    relevance_score: Mapped[float] = mapped_column(Float)
    cited_text_snippet: Mapped[str] = mapped_column(Text)
    created_at : Mapped[datetime] = mapped_column(DateTime)

    message_id: Mapped[int] = mapped_column(ForeignKey("chat_messages.id"))
    message: Mapped["ChatMessages"] = relationship(back_populates="")

    chunk_id: Mapped[int] = mapped_column(ForeignKey("document_chunks.id"))
    chunk: Mapped["DocumentChunks"] = relationship(back_populates="d_chunks")

    document_version_id: Mapped[int] = mapped_column(ForeignKey("document_version.id"))
    document_version: Mapped["DocumentVersion"] = relationship(back_populates="cms_sources")


#todo
# class GeneratedReports(Base):