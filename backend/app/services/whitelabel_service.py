"""
whitelabel_service.py
White-label configuration for enterprise clients.
Stores per-tenant branding, domain, and feature flags.
"""
import json
import hashlib
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text


DEFAULT_BRANDING = {
    "product_name": "ResumeAI",
    "primary_color": "#0F6E56",
    "logo_url": None,
    "favicon_url": None,
    "support_email": "support@resumeai.app",
    "hide_powered_by": False,
}


def get_tenant_config(db: Session, tenant_id: str) -> dict:
    """Get white-label config for a tenant. Falls back to defaults."""
    row = db.execute(
        text("SELECT config_json FROM whitelabel_configs WHERE tenant_id = :tid"),
        {"tid": tenant_id},
    ).fetchone()

    if not row:
        return DEFAULT_BRANDING.copy()

    config = json.loads(row.config_json) if isinstance(row.config_json, str) else row.config_json
    return {**DEFAULT_BRANDING, **config}


def upsert_tenant_config(db: Session, tenant_id: str, config: dict) -> dict:
    """Save or update white-label config for a tenant."""
    # Only allow safe keys
    allowed = {"product_name", "primary_color", "logo_url", "favicon_url",
               "support_email", "hide_powered_by", "custom_domain",
               "feature_flags", "welcome_message", "footer_text"}
    safe_config = {k: v for k, v in config.items() if k in allowed}

    existing = db.execute(
        text("SELECT id FROM whitelabel_configs WHERE tenant_id = :tid"),
        {"tid": tenant_id},
    ).fetchone()

    if existing:
        db.execute(
            text("UPDATE whitelabel_configs SET config_json = :cfg, updated_at = now() WHERE tenant_id = :tid"),
            {"cfg": json.dumps(safe_config), "tid": tenant_id},
        )
    else:
        db.execute(
            text("""INSERT INTO whitelabel_configs (id, tenant_id, config_json, created_at, updated_at)
                    VALUES (gen_random_uuid(), :tid, :cfg, now(), now())"""),
            {"tid": tenant_id, "cfg": json.dumps(safe_config)},
        )

    db.commit()
    return {**DEFAULT_BRANDING, **safe_config}
