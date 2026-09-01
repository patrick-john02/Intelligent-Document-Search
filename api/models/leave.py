# from sqlalchemy.orm import mapped_column, Mapped
# from sqlalchemy import Integer, String, Boolean, DateTime, Date, Text, func
# from datetime import date, datetime, time
# from typing import TYPE_CHECKING



# #imports
# if TYPE_CHECKING:
#     from api.models.base import Base

# class ApplicationForLeave(Base):
#     __tablename__ = "application_for_leave"
#     id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
#     user_id: Mapped[int] = mapped_column(Integer)
#     number_of_days: Mapped[int] = mapped_column(Integer)
#     number_of_hours: Mapped[int] = mapped_column(Integer)
#     inclusive_period: Mapped[str] = mapped_column(Text)
#     reason_for_leave: Mapped[str] = mapped_column(Text, nullable=True)
#     chargeable_against: Mapped[str] = mapped_column(String(255), null=True)
#     is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
#     viewed_by: Mapped[str] = mapped_column(String(255), nullable=True)



#     created_at: Mapped[datetime]=mapped_column(DateTime, server_default=func.now())
#     updated_at: Mapped[datetime]=mapped_column(DateTime, server_default=func.now(),nullable=True)


# class LeaveCredits(Base):
#     __tablename__ = "leave_credits"
#     id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    
