"""
Phase 2 migration — adds shareable token to analyses table.
Run: alembic upgrade head
"""
from alembic import op
import sqlalchemy as sa

revision = "phase2_001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "analyses",
        sa.Column("share_token", sa.String(64), nullable=True, unique=True),
    )
    op.create_index("ix_analyses_share_token", "analyses", ["share_token"])

    op.add_column(
        "jd_matches",
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
    )


def downgrade():
    op.drop_index("ix_analyses_share_token", "analyses")
    op.drop_column("analyses", "share_token")
    op.drop_column("jd_matches", "status")
