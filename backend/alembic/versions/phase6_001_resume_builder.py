"""
Phase 6 migration — adds `source` and `template` to resumes, so a single
table serves both uploaded and from-scratch (builder) resumes rather than
duplicating storage/analysis logic for a second resume type.
Run: alembic upgrade head
"""
from alembic import op
import sqlalchemy as sa

revision = "phase6_001"
down_revision = "phase5_001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("resumes", sa.Column("source", sa.String(20), nullable=False, server_default="uploaded"))
    op.add_column("resumes", sa.Column("template", sa.String(50), nullable=True))
    op.add_column("resumes", sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()))


def downgrade():
    op.drop_column("resumes", "updated_at")
    op.drop_column("resumes", "template")
    op.drop_column("resumes", "source")
