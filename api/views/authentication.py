from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Cookie
from fastapi.responses import JSONResponse
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta, timezone
from core.dependencies import get_db

#imports
from api.schema.authentication.auth import Token, RefreshRequest, UserProfileResponses
from api.models.users import Users, UserSession
from core.security import(
    authenticate_user, create_access_token,
    access_token_expires_min, get_current_active_user,
    idle_timeout_min, create_session, rotate_session, revoke_session_by_token,
    SessionError, refresh_cookie_name, refresh_cookie_path,
    refresh_cookie_secure, refresh_cookie_samesite,
)

router = APIRouter(tags=["Authentication"])


def _issue_access_token(username: str, session: UserSession) -> Token:
    access_token = create_access_token(
        data={"sub": username},
        expires_delta=timedelta(minutes=access_token_expires_min),
        session_id=session.id,
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=access_token_expires_min * 60,
        idle_timeout=idle_timeout_min * 60,
    )


def _set_refresh_cookie(response: Response, raw_token: str, expires_at: datetime) -> None:
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    max_age = max(0, int((expires_at - datetime.now(timezone.utc)).total_seconds()))
    response.set_cookie(
        key=refresh_cookie_name,
        value=raw_token,
        max_age=max_age,
        httponly=True,                  # JavaScript can't read it (XSS-safe)
        secure=refresh_cookie_secure,   # set REFRESH_COOKIE_SECURE=true behind HTTPS
        samesite=refresh_cookie_samesite,
        path=refresh_cookie_path,       # only sent to /api/token/*
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=refresh_cookie_name,
        path=refresh_cookie_path,
        httponly=True,
        secure=refresh_cookie_secure,
        samesite=refresh_cookie_samesite,
    )


def _session_ended(detail: str) -> JSONResponse:
    response = JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": detail},
        headers={"WWW-Authenticate": "Bearer"},
    )
    _clear_refresh_cookie(response)
    return response


@router.post("/token")
async def login_for_access_token(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
)->Token:
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Username or Password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    session, refresh_token = await create_session(
        db,
        user,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    _set_refresh_cookie(response, refresh_token, session.expires_at)
    return _issue_access_token(user.username, session)


@router.post("/token/refresh", response_model=Token)
async def refresh_access_token(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    payload: RefreshRequest | None = None,
    refresh_token: Annotated[str | None, Cookie(alias=refresh_cookie_name)] = None,
):
    """
    Swap the refresh cookie for a new access token (and a rotated cookie).
    Rejected when the user has been idle too long, the session hit its
    absolute lifetime, or it was revoked.
    """
    if not refresh_token:
        return _session_ended("Not logged in")
    try:
        session, user, new_refresh_token = await rotate_session(
            db, refresh_token, payload.idle_ms if payload else None
        )
    except SessionError as exc:
        return _session_ended(exc.detail)

    if new_refresh_token:
        _set_refresh_cookie(response, new_refresh_token, session.expires_at)
    return _issue_access_token(user.username, session)


@router.post("/token/revoke", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    refresh_token: Annotated[str | None, Cookie(alias=refresh_cookie_name)] = None,
):
    """Logout: ends the server session so its tokens stop working everywhere."""
    if refresh_token:
        await revoke_session_by_token(db, refresh_token)
    _clear_refresh_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/user/me", status_code=status.HTTP_200_OK, response_model=UserProfileResponses)
async def me(
    current_user: Annotated[Users, Depends(get_current_active_user)],

):
    return current_user
