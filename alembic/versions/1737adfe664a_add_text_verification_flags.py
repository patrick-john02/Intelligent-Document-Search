"""add text verification flags

Revision ID: 1737adfe664a
Revises: 926ce86da4af
Create Date: 2026-11-20 16:05:11.614213

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1737adfe664a'
down_revision: Union[str, Sequence[str], None] = '926ce86da4af'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. add the columns first
    op.add_column(
        "document_version",
        sa.Column("needs_text_review", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "document_version",
        sa.Column("text_review_reasons", sa.JSON(), server_default=sa.text("'[]'"), nullable=False),
    )
    op.add_column(
        "document_version",
        sa.Column("text_verified", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.create_index(
        op.f("ix_document_version_needs_text_review"),
        "document_version",
        ["needs_text_review"],
        unique=False,
    )

    # 2. then backfill existing scanned documents
    op.execute("""
        UPDATE document_version
        SET needs_text_review = true,
            text_review_reasons = '["scanned_before_review_feature"]'
        WHERE is_current = true
          AND is_scanned_pdf = true
    """)
    # ### end Alembic commands ###




def downgrade() -> None:
    op.drop_index(op.f("ix_document_version_needs_text_review"), table_name="document_version")
    op.drop_column("document_version", "text_verified")
    op.drop_column("document_version", "text_review_reasons")
    op.drop_column("document_version", "needs_text_review")
    # ### end Alembic commands ###
