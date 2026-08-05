from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from api.models.enums.user import AccountStatus


class UserSchema(BaseModel):
    username: str
    first_name: str
    middle_name: str
    last_name: str
    email: str
    birth_date: datetime
    position: str
    employee_number: int
    office: str
    division: str

    #enum
    account_status: AccountStatus

    is_active: bool
    is_superuser: bool
    system_role: str
    

