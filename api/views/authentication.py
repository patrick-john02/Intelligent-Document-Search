from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from core.dependencies import get_db

#imports
from api.schema.authentication.auth import Token
from api.models.users import Users
from core.security import(
    authenticate_user, create_access_token,
    access_token_expires_min, get_current_active_user,
)

router = APIRouter(tags=["Authentication"])


@router.post("/token")
async def login_for_access_token(
    db: Annotated[AsyncSession, Depends(get_db)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends],
)->Token:
    user = await authenticate_user(db, form_data.username, form_data.password)
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

@router.get("/user/me")
async def me(
    current_user: Annotated[Users, Depends(get_current_active_user)],

)->Users:
    return current_user

