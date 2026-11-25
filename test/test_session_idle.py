"""Tests for refresh-token sessions and the idle (AFK) auto-logout."""
import uuid
import pytest
from datetime import date, datetime, timedelta, timezone
from httpx import AsyncClient, ASGITransport

import api.models
from api.models.users import Users, UserSession
from api.models.enums.user import AccountStatus
from core import security
from core.security import get_password_hash
from core.dependencies import get_db
from fastapi import FastAPI
from api.views import authentication

# main.py builds a Postgres checkpointer at import time, so mount only the auth router here.
app = FastAPI()
app.include_router(authentication.router, prefix="/api")

COOKIE = security.refresh_cookie_name
MIN = 60_000

user = Users(
    id=1, username="juan", password=get_password_hash("meowmeowmeow"),
    first_name="Juan", middle_name="Dela", last_name="Cruz", email="juan@gmail.com",
    birth_date=date(1990, 1, 1), position="Programmer", employee_number="12345",
    office="IT Office", division="IT Division", account_status=AccountStatus.ACTIVE,
    is_active=True, is_superuser=False, system_role_id=1, created_at=datetime.now(),
)


class FakeDB:
    """In-memory stand-in for AsyncSession: one user, any number of sessions."""

    def __init__(self):
        self.sessions: dict[uuid.UUID, UserSession] = {}

    async def execute(self, query):
        class Result:
            def scalars(self_inner):
                class Scalars:
                    def first(self_inner2):
                        return user
                return Scalars()
        return Result()

    async def get(self, model, key):
        if model is UserSession:
            return self.sessions.get(key)
        if model is Users:
            return user if key == user.id else None
        return None

    def add(self, obj):
        if isinstance(obj, UserSession):
            self.sessions[obj.id] = obj

    async def commit(self):
        pass


@pytest.fixture
def db():
    fake = FakeDB()

    async def override():
        yield fake

    app.dependency_overrides[get_db] = override
    yield fake
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture
def anyio_backend():
    return "asyncio"


def client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


async def login(c):
    r = await c.post("/api/token", data={"username": "juan", "password": "meowmeowmeow"})
    assert r.status_code == 200
    return r


def only_session(db) -> UserSession:
    assert len(db.sessions) == 1
    return next(iter(db.sessions.values()))


def shift(session: UserSession, **delta):
    """Pretend the session's clocks happened earlier."""
    d = timedelta(**delta)
    session.created_at -= d
    session.last_activity_at -= d
    session.expires_at -= d


@pytest.mark.anyio
async def test_login_sets_httponly_refresh_cookie(db):
    async with client() as c:
        r = await login(c)
        body = r.json()
        assert body["access_token"] and body["idle_timeout"] == security.idle_timeout_min * 60
        set_cookie = r.headers["set-cookie"]
        assert COOKIE in set_cookie and "HttpOnly" in set_cookie and "Path=/api/token" in set_cookie

        me = await c.get("/api/user/me", headers={"Authorization": f"Bearer {body['access_token']}"})
        assert me.status_code == 200


@pytest.mark.anyio
async def test_active_user_refresh_rotates_and_extends(db):
    async with client() as c:
        await login(c)
        old_cookie = c.cookies.get(COOKIE)
        session = only_session(db)
        shift(session, minutes=50)  # last refresh 50 min ago, user was active 1 min ago

        r = await c.post("/api/token/refresh", json={"idle_ms": 1 * MIN})
        assert r.status_code == 200
        assert c.cookies.get(COOKIE) != old_cookie  # rotated
        assert datetime.now(timezone.utc) - session.last_activity_at < timedelta(minutes=2)


@pytest.mark.anyio
async def test_afk_user_is_rejected(db):
    async with client() as c:
        await login(c)
        shift(only_session(db), minutes=security.idle_timeout_min + 10)  # logged in 70 min ago, then AFK
        r = await c.post("/api/token/refresh", json={"idle_ms": (security.idle_timeout_min + 10) * MIN})
        assert r.status_code == 401
        assert "inactivity" in r.json()["detail"]
        assert only_session(db).revoked_at is not None


@pytest.mark.anyio
async def test_background_polling_does_not_keep_afk_session_alive(db):
    async with client() as c:
        await login(c)
        session = only_session(db)
        shift(session, minutes=40)
        # Polling triggers a refresh, but the user has been idle the whole 40 min.
        r = await c.post("/api/token/refresh", json={"idle_ms": 40 * MIN})
        assert r.status_code == 200
        shift(session, minutes=30)  # 70 min idle in total now
        r = await c.post("/api/token/refresh", json={"idle_ms": 70 * MIN})
        assert r.status_code == 401


@pytest.mark.anyio
async def test_absolute_lifetime(db):
    async with client() as c:
        await login(c)
        only_session(db).expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        r = await c.post("/api/token/refresh", json={"idle_ms": 0})
        assert r.status_code == 401


@pytest.mark.anyio
async def test_reused_refresh_token_revokes_session(db):
    async with client() as c:
        await login(c)
        stolen = c.cookies.get(COOKIE)
        assert (await c.post("/api/token/refresh", json={"idle_ms": 0})).status_code == 200
        session = only_session(db)
        session.rotated_at -= timedelta(minutes=5)  # outside the multi-tab grace window

        c.cookies.set(COOKIE, stolen, path="/api/token")
        r = await c.post("/api/token/refresh", json={"idle_ms": 0})
        assert r.status_code == 401
        assert session.revoked_at is not None


@pytest.mark.anyio
async def test_concurrent_tab_refresh_is_tolerated(db):
    async with client() as c:
        await login(c)
        old = c.cookies.get(COOKIE)
        assert (await c.post("/api/token/refresh", json={"idle_ms": 0})).status_code == 200
        c.cookies.set(COOKIE, old, path="/api/token")  # second tab still sent the old cookie
        r = await c.post("/api/token/refresh", json={"idle_ms": 0})
        assert r.status_code == 200
        assert only_session(db).revoked_at is None


@pytest.mark.anyio
async def test_logout_revokes_access_token_immediately(db):
    async with client() as c:
        token = (await login(c)).json()["access_token"]
        assert (await c.post("/api/token/revoke")).status_code == 204
        me = await c.get("/api/user/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 401
        assert (await c.post("/api/token/refresh", json={"idle_ms": 0})).status_code == 401
