from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, DateTime, ForeignKey, Date, Boolean
from typing import List, TYPE_CHECKING
from datetime import datetime, date
from sqlalchemy import Enum as StatusEnum

#imports
from api.models.enums.user import AccountStatus
from api.models.base import Base

if TYPE_CHECKING:
    from api.models.document import DocumentModel, DocumentVersion, DocumentAuditLogs
    from api.models.conversations import Conversation
    



class SystemRole(Base):
    __tablename__ = "system_role"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime)

    users: Mapped[List["Users"]] = relationship(back_populates="system_role")

#Employee Details
class Users(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(255), unique=True)
    password: Mapped[str] = mapped_column(String(255))
    first_name: Mapped[str] = mapped_column(String(255))
    middle_name: Mapped[str] = mapped_column(String(255))
    last_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    birth_date: Mapped[date] = mapped_column(Date)
    position: Mapped[str] = mapped_column(String(255))
    employee_number: Mapped[str] = mapped_column(String(255), unique=True)
    office: Mapped[str] = mapped_column(String(255))
    division: Mapped[str] = mapped_column(String(255))

    # account_status: Mapped[str] = mapped_column(String(255))
    account_status: Mapped[AccountStatus] = mapped_column(
        StatusEnum(
            AccountStatus,
            name="account_status_enum",
            values_callable=lambda items: [item.value for item in items],
        ),
        default=AccountStatus.ACTIVE,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(Boolean)
    is_superuser: Mapped[bool] = mapped_column(Boolean)

    system_role_id: Mapped[int] = mapped_column(ForeignKey("system_role.id"))
    system_role: Mapped["SystemRole"] = relationship(back_populates="users")

    uploaded_versions: Mapped[list["DocumentVersion"]] = relationship(back_populates="uploaded_by")
    created_documents : Mapped[list["DocumentModel"]] = relationship(back_populates="created_by")

    d_audit_logs: Mapped["DocumentAuditLogs"] = relationship("users")

    conversations: Mapped["Conversation"] = relationship(back_populates="user_conversations")

    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True )
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)