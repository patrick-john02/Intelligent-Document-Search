from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from sqlalchemy import String, Integer, DateTime, Boolean
from datetime import datetime

class Base(DeclarativeBase):
    pass

class DocumentModel(Base):
    __tablename__= "documents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    file_name: Mapped[str] = mapped_column(String(255))
    file_extension: Mapped[str] = mapped_column(String(255))
    is_deleted: Mapped[bool] = mapped_column(Boolean)
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
