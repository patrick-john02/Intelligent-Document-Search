from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from sqlalchemy import String, Integer, DateTime, Boolean, ForeignKey, BigInteger, Text, JSON
from typing import List, TYPE_CHECKING
from datetime import datetime
from sqlalchemy import Enum as DocumentStatusEnum
from enum import Enum


if TYPE_CHECKING:
    from api.models.users import Users
    from api.models.conversations import ChatMessageSources



from api.models.base import Base

class DocumentStatus(Base):
    __tablename__ = "document_status"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))

    documents: Mapped[list["DocumentModel"]] = relationship(back_populates="status")


class DocumentModel(Base):
    __tablename__= "documents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255))
    versions: Mapped[list["DocumentVersion"]] = relationship(back_populates="document")

    document_status_id: Mapped[int | None] = mapped_column(ForeignKey("document_status.id"))
    status: Mapped["DocumentStatus"] = relationship(back_populates="documents")

    
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    document_category_id: Mapped[int] = mapped_column(ForeignKey("document_category.id"))
    document_tag_assignments: Mapped["DocumentTagAssignments"] = relationship(back_populates="document")
    category: Mapped["DocumentCategory"] = relationship()
    

    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_by: Mapped["Users"] = relationship(back_populates="created_documents")
    

    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime) 

class DocumentVersion(Base):
    __tablename__ = "document_version"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    storage_path: Mapped[str] = mapped_column(String(500))
    file_name: Mapped[str] = mapped_column(String(255))
    file_extension: Mapped[str] = mapped_column(String(255))
    mime_type: Mapped[str] = mapped_column(String(255))
    file_size: Mapped[int] = mapped_column(BigInteger)
    checksum: Mapped[str] = mapped_column(String(64), index=True)
    version_number: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(255))

    is_current: Mapped[bool] = mapped_column(Boolean, default=True)

    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"), index=True)
    document: Mapped["DocumentModel"] = relationship(back_populates="versions")

    uploaded_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    uploaded_by: Mapped["Users"] = relationship(back_populates="uploaded_versions")

    cms_sources: Mapped["ChatMessageSources"] = relationship(back_populates="document_version")

    d_audit: Mapped["DocumentAuditLogs"] = relationship(back_populates="document")

class DocumentTag(Base):
    __tablename__ = "document_tag"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    color_code: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)

    d_tag: Mapped[int] = relationship(back_populates="document_tag")


class DocumentTagAssignments(Base):
    __tablename__ = "document_tag_assignments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    confidence_score: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime)

    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"))
    document: Mapped["DocumentModel"] = relationship(back_populates="document_tag_assignements")

    document_tag_id: Mapped[int] = mapped_column(ForeignKey("document_tag.id"))
    document_tag: Mapped["DocumentTag"] = relationship(back_populates="d_tag")



class DocumentCategory(Base):
    __tablename__ = "document_category"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)



class DocumentAuditLogs(Base):
    __tablename__ = "document_audit_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    actions: Mapped[str] = mapped_column(String(255))
    query_text: Mapped[str] = mapped_column(Text)
    ip_address: Mapped[str] = mapped_column(String(255))
    user_agent: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user: Mapped["Users"] = relationship(back_populates="d_audit_log.id")

    document_id: Mapped[int | None] = mapped_column(ForeignKey("documents.id"))
    document: Mapped["DocumentModel" | None] = relationship(back_populates="d_audit")



class DocumentChunks(Base):
    __tablename__ = "document_chunks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_version_id: Mapped[int] = mapped_column(ForeignKey("document_version.id"))
    chunk_index: Mapped[int] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text)
    page_number: Mapped[int | None] = mapped_column(Integer)
    token_count: Mapped[int] = mapped_column(Integer)
    vector_id: Mapped[int] = mapped_column(Integer)
    metadata: Mapped[dict[str, object]] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime)

    d_chunks: Mapped["ChatMessageSources"] = relationship(back_populates="chunk")



