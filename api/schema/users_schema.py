from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, Any
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

    model_config = ConfigDict(from_attributes=True)

    @field_validator("system_role", mode="before")
    @classmethod
    def serialize_system_role(cls, v: Any) -> str:
        if hasattr(v, "name"):
            return v.name
        return str(v) if v is not None else ""
    

class CreateUsers(BaseModel):
    username: str
    first_name: str
    password: str
    middle_name: str
    last_name: str
    email: str
    birth_date: datetime
    position: str
    employee_number: int
    office: str
    division: str
    account_status: AccountStatus
    system_role: str
    