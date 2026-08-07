from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.dependencies import get_db
import os
from datetime import timedelta
from pwdlib import PasswordHash
from jose import JWTError, jwt
from dotenv import load_dotenv
from datetime import datetime, timezone
from fastapi.security import OAuth2PasswordBearer
from fastapi import (
    Depends, HTTPException, status, APIRouter
)


#imports
from api.models.users import Users
from api.schema.authentication.auth import Login

load_dotenv() 

secret_key = os.getenv("SECRET_KEY")
algo = os.getenv("ALGORITHM")
access_token_expires_min = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES","15"))


password_hash = PasswordHash()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter(tags=["Authentication"])

#so according to my research doing this will make every login attempts takes the exact same amount of time 
#which is for example 50 ms (upon checking the existing password) then 50 ms again (upon checking a password that does not exist on database)
#this method is usefull in terms of security since i used argon2 here which is design to be slow on hashing
 
SECURITY_DUMMY_HASH = password_hash.hash("thisisadummypa$$wordfortimingprotection")



class UserInDB(Users):
    hashed_password:str


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password):
    return password_hash.hash(password)


async def get_user(db: AsyncSession, username: str)->Users | None:
    query = select(Users).where(Users.username == username)
    result = await db.execute(query)
    return result.scalars().first()

async def authenticate_user(db: AsyncSession, username: str, password: str):
    user = await get_user(db, username)
    if not user:
        verify_password(password, SECURITY_DUMMY_HASH)
        return False
    if not verify_password(password, user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None=None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp":expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algo)
    return encoded_jwt


async def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        db: Annotated[AsyncSession, Depends(get_db)],
    ):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail ="Unauthorize access!!!",
        headers={"WWW-Authenticate": "Bearer"}

    )
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algo])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = Login(username=username)
    except JWTError:
        raise credentials_exception
    user = await get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[Users, Depends(get_current_user)],
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive User")

    return current_user

    
    