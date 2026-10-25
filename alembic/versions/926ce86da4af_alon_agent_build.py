"""alon agent build

Revision ID: 926ce86da4af
Revises: 682348385b28
Create Date: 2026-10-25 16:10:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "926ce86da4af"
down_revision: Union[str, Sequence[str], None] = "682348385b28"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: archive_proposals table for Alon (archiving agent)."""
    op.create_table(
        "archive_proposals",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("document_version_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("proposal", sa.JSON(), nullable=True),
        sa.Column("final_values", sa.JSON(), nullable=True),
        sa.Column("needs_human_review", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("model_name", sa.String(length=100), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("agent_execution_id", sa.Integer(), nullable=True),
        sa.Column("reviewed_by_id", sa.Integer(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("review_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["agent_execution_id"], ["agent_executions.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["document_version_id"], ["document_version.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_archive_proposals_document_version_id"), "archive_proposals", ["document_version_id"], unique=False)
    op.create_index(op.f("ix_archive_proposals_status"), "archive_proposals", ["status"], unique=False)
    op.create_index(
        "uq_archive_proposals_one_pending",
        "archive_proposals",
        ["document_version_id"],
        unique=True,
        postgresql_where=sa.text("status = 'pending'"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("uq_archive_proposals_one_pending", table_name="archive_proposals", postgresql_where=sa.text("status = 'pending'"))
    op.drop_index(op.f("ix_archive_proposals_status"), table_name="archive_proposals")
    op.drop_index(op.f("ix_archive_proposals_document_version_id"), table_name="archive_proposals")
    op.drop_table("archive_proposals")