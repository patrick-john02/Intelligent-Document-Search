# api/enums/user.py
from enum import Enum

class AccountStatus(str, Enum):
    ACTIVE = "active"
    DISABLED = "disabled"

# class RolePermissions(str, Enum):
#     ACCESS = "access_all"
#     DOWNLOAD = "download_all"
#     VIEW = "view_all"
#     UPLOAD = "can_upload"
#     DELETE = "can_delete"

    