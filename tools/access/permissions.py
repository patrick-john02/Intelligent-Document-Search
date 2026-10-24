from api.models.users import Users 
from api.models.enums.docs import ClearanceLevel, CLEARANCE_ORDER, get_subordinate_clearance_levels


from contextvars import ContextVar
from typing import Optional, List
from sqlalchemy import String, cast, func
from api.models.document import DocumentModel

current_allowed_clearance: ContextVar[Optional[List[str]]] = ContextVar("current_allowed_clearance", default=None)


def active_clearance_levels()->list[str]:
    levels = current_allowed_clearance.get() or [ClearanceLevel.PUBLIC.value]
    return [lvl.lower() for lvl in levels]


def clearance_filter(levels:list[str] | None=None):
    return func.lower(cast(DocumentModel.clearance_level, String)).in_(levels or active_clearance_levels())



def get_user_clearance_levels(
    user: Users | None
) -> list[str]:
    """
    Resolves the allowed clearance levels for a user based on their clearance level or superuser status.
    Hierarchical: e.g., SECRET -> [PUBLIC, INTERNAL, CONFIDENTIAL, SECRET].
    """
    if not user:
        return [ClearanceLevel.PUBLIC.value]

    if getattr(user, "is_superuser", False):
        return list(CLEARANCE_ORDER.keys())

    clearance = getattr(user, "clearance_level", None)
    if clearance:
        return get_subordinate_clearance_levels(clearance)

    # Standard default for authenticated personnel: PUBLIC and INTERNAL
    return [ClearanceLevel.PUBLIC.value, ClearanceLevel.INTERNAL.value]


