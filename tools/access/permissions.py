from api.models.users import Users 
from api.models.enums.docs import ClearanceLevel, CLEARANCE_ORDER, get_subordinate_clearance_levels


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


