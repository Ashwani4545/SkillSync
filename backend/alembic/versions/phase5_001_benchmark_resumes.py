"""
Phase 5 migration — benchmark_resumes table (real vector-similarity data
for the benchmark engine, replacing the previous fully-simulated version).
Run: alembic upgrade head
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "phase5_001"
down_revision = "phase4_001"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "benchmark_resumes",
        sa.Column("id",                   postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("target_role",           sa.String(255), nullable=False),
        sa.Column("industry",              sa.String(100), nullable=False),
        sa.Column("embedding_json",         postgresql.JSONB, nullable=False),
        sa.Column("quantification_rate",   sa.Integer, nullable=False),
        sa.Column("bullet_count",           sa.Integer, nullable=False),
        sa.Column("skills_count",           sa.Integer, nullable=False),
        sa.Column("experience_entries",     sa.Integer, nullable=False),
        sa.Column("source_label",          sa.String(255), nullable=True),
        sa.Column("created_at",             sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_benchmark_resumes_target_role", "benchmark_resumes", ["target_role"])
    op.create_index("ix_benchmark_resumes_industry",    "benchmark_resumes", ["industry"])


def downgrade():
    op.drop_index("ix_benchmark_resumes_industry",    "benchmark_resumes")
    op.drop_index("ix_benchmark_resumes_target_role", "benchmark_resumes")
    op.drop_table("benchmark_resumes")
