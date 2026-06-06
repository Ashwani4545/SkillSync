"""
Phase 4 migration — whitelabel_configs, llm_usage_logs tables.
Run: alembic upgrade head
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "phase4_001"
down_revision = "phase3_001"
branch_labels = None
depends_on = None


def upgrade():
    # White-label branding configs per tenant
    op.create_table(
        "whitelabel_configs",
        sa.Column("id",          postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id",   sa.String(128), nullable=False, unique=True, index=True),
        sa.Column("config_json", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at",  sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at",  sa.DateTime, server_default=sa.func.now()),
    )

    # LLM usage / cost tracking
    op.create_table(
        "llm_usage_logs",
        sa.Column("id",           postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("analysis_id",  sa.String(128), nullable=True),
        sa.Column("feature",      sa.String(64),  nullable=False),
        sa.Column("input_tokens", sa.Integer,     nullable=False),
        sa.Column("output_tokens",sa.Integer,     nullable=False),
        sa.Column("cost_usd",     sa.Numeric(12, 8), nullable=False),
        sa.Column("logged_at",    sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_llm_usage_logs_logged_at", "llm_usage_logs", ["logged_at"])
    op.create_index("ix_llm_usage_logs_feature",   "llm_usage_logs", ["feature"])


def downgrade():
    op.drop_index("ix_llm_usage_logs_feature",   "llm_usage_logs")
    op.drop_index("ix_llm_usage_logs_logged_at", "llm_usage_logs")
    op.drop_table("llm_usage_logs")
    op.drop_table("whitelabel_configs")
