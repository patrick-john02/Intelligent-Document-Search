from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from sqlalchemy import String, Integer, DateTime, Boolean, ForeignKey
from typing import List
from datetime import datetime

class Base(DeclarativeBase):
    pass

class SystemRole(Base):
    __tablename__ = "system_role"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime)

    role: Mapped[List["Users"]] = relationship(back_populates="system_role")


class Users(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    first_name = Mapped[str] = mapped_column(String(255))
    middle_name = Mapped[str] = mapped_column(String(255))
    last_name = Mapped[str] = mapped_column(String(255))
    age = Mapped[int] = mapped_column(Integer)
    position = Mapped[str] = mapped_column(String(255))
    
    created_at = Mapped[datetime] = mapped_column(DateTime)
    updated_at = Mapped[datetime] = mapped_column(DateTime)


    system_role = Mapped[List] = relationship(back_populates="role")


class DocumentModel(Base):
    __tablename__= "documents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    file_name: Mapped[str] = mapped_column(String(255))
    file_extension: Mapped[str] = mapped_column(String(255))
    is_deleted: Mapped[bool] = mapped_column(Boolean)
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
