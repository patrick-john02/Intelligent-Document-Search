from celery import Celery


# Initialize Celery pointing to your Docker Redis instance.
# IMPORTANT: include=["rag.ingestion"] is required so the worker automatically imports
# and registers all @celery_app.task definitions (e.g., 'task.process_document') when started
# via `celery -A rag.worker worker`. Without this, Celery will not discover the ingestion tasks.
celery_app = Celery(
    "ingestion_worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["rag.ingestion", "rag.pipeline"],
)

#Optional: Configure Celery for better performance with long-running tasks
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    task_default_queue="default",
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,          # one heavy OCR job at a time per worker
    broker_transport_options={"visibility_timeout": 4 * 60 * 60},  # long scans won't be re-delivered
)