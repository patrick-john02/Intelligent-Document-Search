from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, JSON, Float, Boolean
from datetime import datetime
from sqlalchemy import Enum as AgentsEnum


from api.models.base import Base
from api.models.enums.agent import AgentTasks

class AgentExecutions(Base):
    __tablename__ = "agent_executions"
    id = Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_name: Mapped[str] = mapped_column(String(255))
    task_type:Mapped[str] = mapped_column(String(255))
    status:Mapped[str] = mapped_column(String(255))
    input_params: Mapped[dict[str, object]] = mapped_column("input_params", JSON, default=dict)
    output_summary: Mapped[str] = mapped_column(Text)
    execution_time_ms: Mapped[float] = mapped_column(Float)
    model_name: Mapped[str] = mapped_column(String(255))
    error_log: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime)


class MlAnalyticsInsights(Base):
    __tablename__ = "ml_analytics_insights"
    id = Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cluster_id: Mapped[int] = mapped_column(Integer)
    insight_type: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    division: Mapped[str] = mapped_column(String(255))
    document_category_id: Mapped[int] = mapped_column(ForeignKey) #reference to document category id
    metric_data: Mapped[dict[str, object]] = mapped_column("metric_data", JSON, default=dict)

    confidence_score: Mapped[float] = mapped_column(Float)
    is_actionable: Mapped[bool] = mapped_column(Boolean)

    created_at: Mapped[datetime] = mapped_column(DateTime)


#todo new table
class EvaluationBenchMarksRuns(Base):
    __tablename__ = "evaluation_bench_marks_runs"
    id = Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    eval_type: Mapped[AgentTasks] = mapped_column(
        AgentsEnum(
            AgentTasks,
            name = "agent_tasks_enum",
            values_callable=lambda items:[item.value for item in items],

        ),
        default=None,
        nullable=True
    )
    precision_at_k: Mapped[float] = mapped_column(Float)
    recall_at_k: Mapped[float] = mapped_column(Float)
    mrr_score: Mapped[float] = mapped_column(Float) #Mean Reciprocal Rank
    tasks_completion_rate: Mapped[float] = mapped_column(Float)
    average_latency_ms: Mapped[float] = mapped_column(Float)
    test_dataset_version: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime)


    
    
