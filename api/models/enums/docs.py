from enum import Enum

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ClearanceLevel(str, Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    SECRET = "secret"
    TOP_SECRET = "top_secret"


# ============================================================================
# CLEARANCE HIERARCHY
# Lower levels are strictly accessible by higher clearance levels:
# public (0) < internal (1) < confidential (2) < secret (3) < top_secret (4)
# ============================================================================
CLEARANCE_ORDER = {
    ClearanceLevel.PUBLIC.value: 0,
    ClearanceLevel.INTERNAL.value: 1,
    ClearanceLevel.CONFIDENTIAL.value: 2,
    ClearanceLevel.SECRET.value: 3,
    ClearanceLevel.TOP_SECRET.value: 4,
}


def get_subordinate_clearance_levels(user_clearance: str | ClearanceLevel | None) -> list[str]:
    """
    Returns all clearance level strings equal to or below the given user's clearance.
    E.g., for 'secret', returns ['public', 'internal', 'confidential', 'secret'].
    Defaults to ['public'] if unspecified.
    """
    if not user_clearance:
        return [ClearanceLevel.PUBLIC.value]

    raw_val = user_clearance.value if hasattr(user_clearance, "value") else str(user_clearance).lower()
    user_rank = CLEARANCE_ORDER.get(raw_val, 0)

    return [
        level for level, rank in CLEARANCE_ORDER.items()
        if rank <= user_rank
    ]

