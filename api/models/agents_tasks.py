from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime
from datetime import datetime


from api.models.base import Base

class AgentExecutions(Base):
    id = Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_name: Mapped[str] = mapped_column(String(255))
    task_type:Mapped[str] = mapped_column(String(255))
    status:Mapped[str] = mapped_column(String(255))
    input_params: Mapped[str] = mapped_column(String(255))
    output_summary: Mapped[str] = mapped_column(String(255))
    execution_time_ms: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)



