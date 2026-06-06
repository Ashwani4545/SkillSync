"""
Phase 3 migration — adds github_username to users, api_keys table for B2B.
Run: alembic upgrade head
"""
from alembic import op
import sqlalchemy as sa

revision = "phase3_001"
down_revision = "phase2_001"
branch_labels = None
depends_on = None


def upgrade():
    # Add github_username to users
    op.add_column("users", sa.Column("github_username", sa.String(100), nullable=True))

    # API keys table for B2B/team integrations
    op.create_table(
        "api_keys",
        sa.Column("id",         sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id",    sa.dialects.postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("key_hash",   sa.String(128), nullable=False, unique=True),
        sa.Column("name",       sa.String(100), nullable=False),
        sa.Column("is_active",  sa.Boolean, default=True),
        sa.Column("last_used",  sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_api_keys_user_id", "api_keys", ["user_id"])
    op.create_index("ix_api_keys_key_hash", "api_keys", ["key_hash"])

    # Career predictions cache table
    op.create_table(
        "career_predictions",
        sa.Column("id",           sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("resume_id",    sa.dialects.postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("results_json", sa.dialects.postgresql.JSONB, nullable=True),
        sa.Column("created_at",   sa.DateTime, server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("career_predictions")
    op.drop_index("ix_api_keys_key_hash", "api_keys")
    op.drop_index("ix_api_keys_user_id", "api_keys")
    op.drop_table("api_keys")
    op.drop_column("users", "github_username")
