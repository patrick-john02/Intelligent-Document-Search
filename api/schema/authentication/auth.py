from pydantic import BaseModel, ConfigDict
from datetime import date


class Login(BaseModel):
    username: str 
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

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
    