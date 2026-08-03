from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from sqlalchemy import String, Integer, DateTime, ForeignKey, Date
from typing import List
from datetime import datetime, date

from api.models.document import Base, DocumentModel

class SystemRole(Base):
    __tablename__ = "system_role"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime)

    role: Mapped[List["Users"]] = relationship(back_populates="system_role")

#Employee Details
class Users(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(255))
    password: Mapped[str] = mapped_column(String(255))
    first_name: Mapped[str] = mapped_column(String(255))
    middle_name: Mapped[str] = mapped_column(String(255))
    last_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255))
    birth_date: Mapped[date] = mapped_column(Date)
    position: Mapped[str] = mapped_column(String(255))
    employee_number: Mapped[str] = mapped_column(String(255))
    office: Mapped[str] = mapped_column(String(255))
    division: Mapped[str] = mapped_column(String(255))
    account_status: Mapped[str] = mapped_column(String(255))
    
    documents: Mapped[list["DocumentModel"]] =relationship(back_populates="uploaded_by")
    system_role_id: Mapped[int] = mapped_column(ForeignKey("documents.id"))
    system_role: Mapped[List] = relationship(back_populates="role")
    
    
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime)
    
    