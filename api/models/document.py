from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from sqlalchemy import String, Integer, DateTime, Boolean, ForeignKey, BigInteger
from typing import List
from datetime import datetime

from api.models.users import Users
from api.models.base import Base


class DocumentModel(Base):
    __tablename__= "documents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255))
    versions: Mapped[list["DocumentVersion"]] = relationship(back_populates="document")
    status: Mapped[str] = mapped_column(String(255))
    
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    document_category_id: Mapped[int] = mapped_column(ForeignKey("document_category.id"))
    category: Mapped["DocumentCategory"] = relationship()

    created_by_id: Mapped[int] = mapped_column(ForeignKey("Users.id"))
    created_by: Mapped["Users"] = relationship(back_populates="created_documents")
    

    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

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

class DocumentCategory(Base):
    __tablename__ = "document_category"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)
