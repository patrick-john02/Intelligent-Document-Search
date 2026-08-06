from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, JSON
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


class MlAnalyticsInsights(Base):
    __tablename__ = "ml_analytics_insights"
    id = Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    insight_type: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    division: Mapped[str] = mapped_column(String(255))
    document_category_id: Mapped[int] = mapped_column(ForeignKey) #reference to document category id
    metric_data: Mapped[dict[str, object]] = mapped_column("metric_data", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime)


#todo new table
# class EvaluationBenchMarksRuns(Base):

