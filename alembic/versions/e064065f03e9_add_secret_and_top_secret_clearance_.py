"""add_secret_and_top_secret_clearance_levels

Revision ID: e064065f03e9
Revises: e77e65ec6f7b
Create Date: 2026-10-02 16:05:03.668218

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e064065f03e9'
down_revision: Union[str, Sequence[str], None] = 'e77e65ec6f7b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE document_enum ADD VALUE IF NOT EXISTS 'secret'")
    op.execute("ALTER TYPE document_enum ADD VALUE IF NOT EXISTS 'top_secret'")


def downgrade() -> None:
    """Downgrade schema."""
    # Enum values cannot be removed in PostgreSQL without recreating the enum
    pass
