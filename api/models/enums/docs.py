from enum import Enum

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ClearanceLevel(str, Enum):
    CONFIDENTIAL = "confidential"
    PUBLIC = "public"
    INTERNAL = "internal"
