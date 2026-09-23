from celery import Celery


#initialize celery point to your docker redis instance
celery_app = Celery(
    "ingestion_worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

#Optional: Configure Celery for better performance with long-running tasks
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    # worker_prefetch_multiplier=1, Prevents on worker from hoarding all heavy OCR tasks
    task_acks_late=True #Ensures tasks are retried if the worker crashes mid-OCR
)

