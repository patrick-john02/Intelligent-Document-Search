from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import (
    FastAPI, Depends, HTTPException, status
)

from core.dependencies import get_db
import os
from datetime import timedelta
from jose import JWTError, jwt
from pwdlib import PasswordHash
from jose import JWTError, jwt
from dotenv import load_dotenv

from datetime import datetime, date, timezone
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm


#imports
from api.models.users import Users
from api.schema.authentication.auth import Login, Token

load_dotenv() 

secret_key = os.getenv("SECRET_KEY")
algo = os.getenv("ALGORITHM")
access_token_expires_min = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")


password_hash = PasswordHash()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()



class UserInDB(Users):
    hashed_password:str


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password):
    return password_hash.hash(password)


def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        verify_password(password, password.hash) #mark 1
        return False
    if not verify_password(password, user.hashed_password):
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
        headers={"WWWW-Authenticate": "Bearer"}

    )
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algo])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = Login(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[Users, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive User")

    return current_user

@app.post("/token")
async def login_for_access_token(
    db: Annotated[AsyncSession, Depends(get_db)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends],
)->Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Username or Password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=access_token_expires_min)
    access_token = create_access_token(
        data = {"sub": user.username}, expires_delta=access_token_expires

    )
    return Token(access_token=access_token, token_type="bearer")

@app.get("/user/me")
async def me(
    current_user: Annotated[Users, Depends(get_current_user)],

)->Users:
    return current_user


    
    