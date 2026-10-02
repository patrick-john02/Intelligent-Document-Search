"""add lexical search vector and trgm indexes

Revision ID: e2a4b8c9d10e
Revises: abcf01b08fb9
Create Date: 2026-10-02 14:05:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'e2a4b8c9d10e'
down_revision: Union[str, Sequence[str], None] = 'abcf01b08fb9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable pg_trgm extension for exact code & partial keyword matching (DV-2026-00128, AO No. 14)
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

    # 2. Add search_vector computed tsvector column to document_chunks
    op.execute(
        "ALTER TABLE document_chunks "
        "ADD COLUMN IF NOT EXISTS search_vector tsvector "
        "GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;"
    )

    # 3. Create GIN index on search_vector for fast natural language keyword queries
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_document_chunks_search_vector "
        "ON document_chunks USING GIN(search_vector);"
    )

    # 4. Create GIN trigram index on content for exact code / voucher ID searches
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_document_chunks_trgm "
        "ON document_chunks USING GIN(content gin_trgm_ops);"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_document_chunks_trgm;")
    op.execute("DROP INDEX IF EXISTS idx_document_chunks_search_vector;")
    op.execute("ALTER TABLE document_chunks DROP COLUMN IF EXISTS search_vector;")
