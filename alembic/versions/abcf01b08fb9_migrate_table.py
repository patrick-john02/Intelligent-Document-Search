"""migrate table

Revision ID: abcf01b08fb9
Revises: d116e4ff4e7d
Create Date: 2026-08-24 08:54:38.532798

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'abcf01b08fb9'
down_revision: Union[str, Sequence[str], None] = 'd116e4ff4e7d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Keep vector store tables intact."""
    pass


def downgrade() -> None:
    pass
