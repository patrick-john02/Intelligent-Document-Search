from pydantic import BaseModel, ConfigDict, Field
from datetime import date


class Login(BaseModel):
    username: str 
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int | None = None      # access token lifetime, seconds
    idle_timeout: int | None = None    # auto-logout after this many idle seconds


class RefreshRequest(BaseModel):
    # How long (ms) the browser has seen no keyboard/mouse activity.
    idle_ms: int | None = Field(default=None, ge=0)

class TokenData(BaseModel):
    username: str | None = None


class UserProfileResponses(BaseModel):
    username: str
    first_name: str
    middle_name: str
    last_name: str
    email:str
    birth_date: date
    employee_number: str
    office: str
    division: str
    is_active: bool
    is_superuser: bool
    system_role_id: int
    


    model_config = ConfigDict(from_attributes=True)
    