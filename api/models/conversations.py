from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, Float, JSON, func
from sqlalchemy import Enum as ConvEnum
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from api.models.users import Users
    from api.models.document import DocumentChunks, DocumentVersion


from api.models.base import Base
from api.models.enums.conv import TaskType, ReportType

    
    

class Conversation(Base):
    __tablename__ = "conversation"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), default="New Chat...")
    created_at: Mapped[datetime] = mapped_column(DateTime, onupdate=func.now())

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user_conversations: Mapped["Users"] = relationship(back_populates="conversations")

    messages: Mapped[list["ChatMessages"]] = relationship(back_populates="conversation", cascade="all, delete-orphan")
    # message_sources: Mapped["ChatMessages"] = relationship(back_populates="messsage")

    generated_reports: Mapped[list["GeneratedReports"]] = relationship(back_populates="conversation", cascade="all, delete-orphan")



    

class ChatMessages(Base):
    __tablename__ = "chat_messages"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sender_type: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tokens_used: Mapped[int] = mapped_column(Integer)
    task_type: Mapped[TaskType] = mapped_column(
        ConvEnum(
            TaskType,
            name="conversation_chat_type",
            values_callable=lambda items: [item.value for item in items]
        ),
        default=None,
        nullable=True
    )
    agent_reasoning_chain: Mapped[dict[str, object]] = mapped_column("agent_reasoning_chain", JSON, default=dict)
    is_helpful: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=None)
    user_rating: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)



    created_at: Mapped[datetime] = mapped_column(DateTime)

    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversation.id"))
    conversation: Mapped["Conversation"] = relationship(back_populates="messages")
    
    sources: Mapped[list["ChatMessageSources"]] = relationship(back_populates="message")

class ChatMessageSources(Base):
    __tablename__ = "chat_messages_sources"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    relevance_score: Mapped[float] = mapped_column(Float)
    cited_text_snippet: Mapped[str] = mapped_column(Text)
    created_at : Mapped[datetime] = mapped_column(DateTime)

    message_id: Mapped[int] = mapped_column(ForeignKey("chat_messages.id"))
    message: Mapped["ChatMessages"] = relationship(back_populates="sources")

    chunk_id: Mapped[int] = mapped_column(ForeignKey("document_chunks.id"))
    chunk: Mapped["DocumentChunks"] = relationship(back_populates="cms_sources")

    document_version_id: Mapped[int] = mapped_column(ForeignKey("document_version.id"))
    document_version: Mapped["DocumentVersion"] = relationship(back_populates="cms_sources")

    page_number: Mapped[int] = mapped_column(Integer)
    bounding_box: Mapped[dict[str, object]] = mapped_column("bounding_box", JSON, default=dict)
    


#todo
class GeneratedReports(Base):
    __tablename__ = "generated_reports"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255))
    report_type: Mapped[ReportType | None] = mapped_column(
        ConvEnum(
            ReportType,
            name = "generated_reports_enum",
            values_callable = lambda items:[item.value for item in items]

        ),
        default=None,
        nullable=True
    )
    report_content: Mapped[str] = mapped_column(Text)

    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_by: Mapped["Users"] = relationship(back_populates="generated_reports")

    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversation.id"))
    conversation: Mapped["Conversation"] = relationship(back_populates="generated_reports")
