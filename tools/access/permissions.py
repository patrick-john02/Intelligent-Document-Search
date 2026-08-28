from api.models.users import Users 
from api.models.enums.docs import ClearanceLevel


def get_user_clearance_levels(
    user:Users
)->list[str]:

    if user.is_superuser:
        return [ClearanceLevel.PUBLIC.value, ClearanceLevel.INTERNAL.value, ClearanceLevel.CONFIDENTIAL.value]

    return [ClearanceLevel.PUBLIC.value, ClearanceLevel.INTERNAL.value]

