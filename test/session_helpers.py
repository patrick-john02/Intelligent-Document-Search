"""Shared helpers so older tests can mint access tokens that belong to an active session."""
import uuid
from datetime import datetime, timedelta, timezone

from api.models.users import UserSession

TEST_SID = uuid.UUID("00000000-0000-0000-0000-000000000001")


def active_session() -> UserSession:
    now = datetime.now(timezone.utc)
    return UserSession(
        id=TEST_SID, user_id=1, refresh_token_hash="x" * 64,
        created_at=now, last_activity_at=now, expires_at=now + timedelta(hours=1),
    )
