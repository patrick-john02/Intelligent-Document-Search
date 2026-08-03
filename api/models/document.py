from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from sqlalchemy import String, Integer, DateTime, Boolean, ForeignKey, Text
from typing import List
from datetime import datetime
from api.models.users import Users

class Base(DeclarativeBase):
    pass


class DocumentModel(Base):
    __tablename__= "documents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_id: Mapped[int] = mapped_column(Integer)
    version_number: Mapped[int] = mapped_column(Integer)
    storage_path: Mapped[str] = mapped_column(String(500))
    checksum: Mapped[str] = mapped_column(String(255))
    file_name: Mapped[str] = mapped_column(String(255))
    file_extension: Mapped[str] = mapped_column(String(255))
    is_deleted: Mapped[bool] = mapped_column(Boolean)
    
    uploaded_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    uploaded_by: Mapped["Users"] = relationship(back_populates="documents")
    
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
class DocumentVersion(Base):
    __tablename__ = "document_version"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_id = Mapped["DocumentModel"] = relationship(back_populates="documents")
    version_number: Mapped[int] = mapped_column(Integer)
    file_name: Mapped[str] = mapped_column(String(255))
    file_extension: Mapped[str] = mapped_column(String(255))
    storage_path: Mapped[str] = mapped_column(Text)
    file_size: Mapped[str] = mapped_column(String(255))
    mime_type: Mapped[str] = mapped_column(String(255))
    check_sume: Mapped[str] = mapped_column(String(255))
    uploaded_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    uploaded_by: Mapped["Users"] = relationship(back_populates="documents")
    created_at: Mapped[datetime] = mapped_column(DateTime)


class DocumentType(Base):
    __tablename__ = "document_type"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    

class DocumentCategory(Base):
    __tablename__ = "document_category"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    
class DocumentTag(Base):
    __tablename__ = "document_tag"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tag_id: Mapped[str] = mapped_column(String(255))
    assigned_by_id: Mapped[str] = mapped_column(String(255))
    source: Mapped[str] = mapped_column(String(255))
    confidence_score: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    
class DocumentMetadata(Base):
    __tablename__ = "document_metadata"
    id:Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_version_id: Mapped[str] = mapped_column(String(255))
    metadata_key: Mapped[str] = mapped_column(String(255))
    metadata_value: Mapped[str] = mapped_column(String(255))
    source: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    
class DocumentPermission(Base):
    __tablename__ = "document_permission"
    id:Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_id: Mapped[str] = mapped_column(String(255))
    user_id: Mapped[str] = mapped_column(String(255))
    role_id: Mapped[str] = mapped_column(String(255))
    office_id: Mapped[str] = mapped_column(String(255))
    can_view: Mapped[str] = mapped_column(String(255))
    can_download: Mapped[str] = mapped_column(String(255))
    can_update: Mapped[str] = mapped_column(String(255))
    can_delete: Mapped[str] = mapped_column(String(255))
    can_share: Mapped[str] = mapped_column(String(255))
    granted_by_id: Mapped[str] = mapped_column(String(255))
    
    created_at: Mapped[datetime] = mapped_column(DateTime)
    
class ConfidentialityLevel(Base):
    __tablename__ = "confidentiality_level"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    
class ProcessingJob(Base):
    __tablename__ = "processing_job"
    id:Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_version_id : Mapped[str] = mapped_column(String(255))
    job_type: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(255))
    attempt_count: Mapped[str] = mapped_column(String(255))
    error_message: Mapped[str] = mapped_column(String(255))
    started_at: Mapped[str] = mapped_column(String(255))
    completed_at: Mapped[datetime] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime)
    

# class DocumentChunk(Base):
#     id:Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
#     document_version_id: Mapped[str] = mapped_column(String(255))
#     chunk_index: Mapped[str] = mapped_column(String(255))
#     content: Mapped[str] = mapped_column(String(255))
#     page_number: Mapped[str] = mapped_column(String(255))
#     section_title: Mapped[str] = mapped_column(String(255))
#     token_count: Mapped[str] = mapped_column(String(255))
#     created_at: Mapped[datetime] = mapped_column(DateTime)
    

class DocumentEmbedding(Base):
    __tablename__ = "document_embedding"
    chunk_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    embedding: Mapped[str] = mapped_column(String(255))
    embedding_model: Mapped[str] = mapped_column(String(255))
    embedding_dimension: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    

# class DocumentClassification(Base):
#     __tablename__ = "document_embedding"
    