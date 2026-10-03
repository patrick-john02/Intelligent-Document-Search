from celery import Celery


# Initialize Celery pointing to your Docker Redis instance.
# IMPORTANT: include=["rag.ingestion"] is required so the worker automatically imports
# and registers all @celery_app.task definitions (e.g., 'task.process_document') when started
# via `celery -A rag.worker worker`. Without this, Celery will not discover the ingestion tasks.
celery_app = Celery(
    "ingestion_worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["rag.ingestion"],
)

#Optional: Configure Celery for better performance with long-running tasks
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    # worker_prefetch_multiplier=1, Prevents on worker from hoarding all heavy OCR tasks
    task_acks_late=True #Ensures tasks are retried if the worker crashes mid-OCR
)

