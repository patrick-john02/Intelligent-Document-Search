# api/enums/user.py
from enum import Enum

class AccountStatus(str, Enum):
    ACTIVE = "active"
    DISABLED = "disabled"