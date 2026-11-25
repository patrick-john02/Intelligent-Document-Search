from typing import Annotated, Literal, cast
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from core.dependencies import get_db
import os
import uuid
import hashlib
import secrets
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
from api.models.users import Users, SystemRole, UserSession
from api.schema.authentication.auth import TokenData

load_dotenv() 

secret_key = os.getenv("SECRET_KEY")
algo = os.getenv("ALGORITHM")
access_token_expires_min = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES","15"))

# --- Session / idle settings ---
# The user is logged out after this many minutes WITHOUT keyboard/mouse activity.
idle_timeout_min = int(os.getenv("IDLE_TIMEOUT_MINUTES", "60"))
# Hard cap: even an active user must log in again after this many hours.
absolute_session_hours = int(os.getenv("ABSOLUTE_SESSION_HOURS", "12"))
# The frontend reports activity at most every ~5 minutes, so the server allows that much slack.
ACTIVITY_SYNC_GRACE = timedelta(minutes=5)
# Two tabs refreshing at the same moment both send the same (old) refresh token.
# The second one inside this window is accepted instead of being treated as token theft.
REFRESH_REUSE_GRACE = timedelta(seconds=30)

refresh_cookie_name = os.getenv("REFRESH_COOKIE_NAME", "src_rt")
refresh_cookie_path = os.getenv("REFRESH_COOKIE_PATH", "/api/token")
refresh_cookie_secure = os.getenv("REFRESH_COOKIE_SECURE", "false").lower() == "true"
refresh_cookie_samesite = cast(
    Literal["lax", "strict", "none"], os.getenv("REFRESH_COOKIE_SAMESITE", "lax").lower()
)


password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

router = APIRouter(tags=["Authentication"])

#so according to my research doing this will make every login attempts takes the exact same amount of time 
#which is for example 50 ms (upon checking the existing password) then 50 ms again (upon checking a password that does not exist on database)
#this method is usefull in terms of security since i used argon2 here which is design to be slow on hashing
 
SECURITY_DUMMY_HASH = password_hash.hash("thisisadummypa$$wordfortimingprotection")



# class UserInDB(Users):
#     hashed_password:str


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password):
    return password_hash.hash(password)

def get_user_permissions(user: Users) -> set[str]:
    if user.is_superuser:
        return {"*"}

    if not user.system_role or not user.system_role.role_permissions:
        return set()

    return {perm.permission_name for perm in user.system_role.role_permissions}


async def get_user(db: AsyncSession, username: str) -> Users | None:
    query = (
        select(Users)
        .where((Users.username == username) | (Users.email == username))
        .options(
            selectinload(Users.system_role).selectinload(SystemRole.role_permissions)
        )
    )
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

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
    session_id: uuid.UUID | str | None = None,
):
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=access_token_expires_min))
    to_encode.update({"exp": expire, "iat": now, "type": "access"})
    if session_id is not None:
        to_encode["sid"] = str(session_id)
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algo)
    return encoded_jwt


# ---------------------------------------------------------------------------
# Refresh-token sessions
# A refresh token looks like "<session_uuid>.<random_secret>". Only a SHA-256
# hash of the secret is stored, so a database leak can't be replayed.
# ---------------------------------------------------------------------------

class SessionError(Exception):
    """Raised when a refresh token can no longer be used. `detail` is safe to show."""

    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _as_aware(value: datetime) -> datetime:
    # Some drivers hand back naive datetimes; treat them as UTC.
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def _hash_secret(secret: str) -> str:
    return hashlib.sha256(secret.encode()).hexdigest()


def _new_secret() -> str:
    return secrets.token_urlsafe(48)


def _parse_refresh_token(raw: str) -> tuple[uuid.UUID, str]:
    sid, _, secret = raw.partition(".")
    try:
        return uuid.UUID(sid), secret
    except ValueError:
        raise SessionError("Invalid session")


def idle_limit() -> timedelta:
    return timedelta(minutes=idle_timeout_min) + ACTIVITY_SYNC_GRACE


async def create_session(
    db: AsyncSession,
    user: Users,
    user_agent: str | None = None,
    ip_address: str | None = None,
) -> tuple[UserSession, str]:
    now = _utcnow()
    secret = _new_secret()
    session = UserSession(
        id=uuid.uuid4(),
        user_id=user.id,
        refresh_token_hash=_hash_secret(secret),
        created_at=now,
        last_activity_at=now,
        expires_at=now + timedelta(hours=absolute_session_hours),
        user_agent=(user_agent or "")[:512] or None,
        ip_address=ip_address,
    )
    db.add(session)
    await db.commit()
    return session, f"{session.id}.{secret}"


async def _revoke(db: AsyncSession, session: UserSession) -> None:
    if session.revoked_at is None:
        session.revoked_at = _utcnow()
        await db.commit()


async def rotate_session(
    db: AsyncSession,
    raw_token: str,
    idle_ms: int | None,
) -> tuple[UserSession, Users, str | None]:
    """
    Validate a refresh token and issue a new one.

    `idle_ms` is how long the browser says the user has been idle. The server
    turns it into a timestamp (no clock-skew issues) and uses it to enforce the
    idle timeout. Background polling therefore can't keep an AFK session alive.

    Returns (session, user, new_raw_token). new_raw_token is None when a
    concurrent tab already rotated the token (cookie is already up to date).
    """
    sid, secret = _parse_refresh_token(raw_token)
    session = await db.get(UserSession, sid)
    if session is None or session.revoked_at is not None:
        raise SessionError("Session has ended. Please log in again.")

    now = _utcnow()
    if now >= _as_aware(session.expires_at):
        await _revoke(db, session)
        raise SessionError("Session expired. Please log in again.")

    last_known = _as_aware(session.last_activity_at)
    reported = now - timedelta(milliseconds=idle_ms) if idle_ms is not None else last_known
    # An idle gap between the last known activity and the new one, or right up to now, ends the session.
    if reported - last_known > idle_limit() or now - max(last_known, reported) > idle_limit():
        await _revoke(db, session)
        raise SessionError("You were logged out due to inactivity.")

    presented = _hash_secret(secret)
    new_raw: str | None = None
    if secrets.compare_digest(presented, session.refresh_token_hash):
        new_secret = _new_secret()
        session.previous_token_hash = session.refresh_token_hash
        session.refresh_token_hash = _hash_secret(new_secret)
        session.rotated_at = now
        new_raw = f"{session.id}.{new_secret}"
    elif (
        session.previous_token_hash
        and session.rotated_at
        and secrets.compare_digest(presented, session.previous_token_hash)
        and now - _as_aware(session.rotated_at) <= REFRESH_REUSE_GRACE
    ):
        pass  # concurrent refresh from another tab; keep the already-rotated token
    else:
        # An old refresh token came back: it was probably stolen. Kill the session.
        await _revoke(db, session)
        raise SessionError("Session has ended. Please log in again.")

    user = await db.get(Users, session.user_id)
    if user is None or not user.is_active:
        await _revoke(db, session)
        raise SessionError("Inactive User")

    session.last_activity_at = max(last_known, reported)
    await db.commit()
    return session, user, new_raw


async def revoke_session_by_token(db: AsyncSession, raw_token: str) -> None:
    try:
        sid, secret = _parse_refresh_token(raw_token)
    except SessionError:
        return
    session = await db.get(UserSession, sid)
    if session is None:
        return
    presented = _hash_secret(secret)
    if secrets.compare_digest(presented, session.refresh_token_hash) or (
        session.previous_token_hash and secrets.compare_digest(presented, session.previous_token_hash)
    ):
        await _revoke(db, session)


async def is_session_active(db: AsyncSession, sid: str | None) -> bool:
    if not sid:
        return False
    try:
        session = await db.get(UserSession, uuid.UUID(sid))
    except ValueError:
        return False
    if session is None or session.revoked_at is not None:
        return False
    return _utcnow() < _as_aware(session.expires_at)


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
        if username is None or payload.get("type") != "access":
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    # Logged-out / revoked / expired sessions stop working immediately.
    if not await is_session_active(db, payload.get("sid")):
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
