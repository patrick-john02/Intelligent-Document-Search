from enum import Enum

class AgentTasks(str, Enum):
    RETRIEVAL_ACCURACY = "retrieval_accuracy"
    TASK_COMPLETION = "task_completion"
    RESPONSE_QUALITY = "response_quality"
    PROCESSING_SPEED = "processing_speed"
    