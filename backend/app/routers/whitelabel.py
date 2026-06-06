"""
whitelabel.py — White-label config router (Phase 4)
GET  /api/v1/whitelabel/config          Get current tenant config
POST /api/v1/whitelabel/config          Update branding config
GET  /api/v1/whitelabel/config/public   Public config (no auth — for frontend theming)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.db.models import User
from app.middleware.auth import get_current_user, require_team
from app.services.whitelabel_service import get_tenant_config, upsert_tenant_config

router = APIRouter()


class WhitelabelConfigRequest(BaseModel):
    product_name:    Optional[str] = None
    primary_color:   Optional[str] = None
    logo_url:        Optional[str] = None
    favicon_url:     Optional[str] = None
    support_email:   Optional[str] = None
    hide_powered_by: Optional[bool] = None
    custom_domain:   Optional[str] = None
    welcome_message: Optional[str] = None
    footer_text:     Optional[str] = None


@router.get("/config")
def get_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team),
):
    config = get_tenant_config(db, str(current_user.id))
    return config


@router.post("/config")
def update_config(
    body: WhitelabelConfigRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team),
):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "No fields to update.")
    updated = upsert_tenant_config(db, str(current_user.id), updates)
    return {"message": "Branding updated.", "config": updated}


@router.get("/config/public/{tenant_id}")
def get_public_config(tenant_id: str, db: Session = Depends(get_db)):
    """Public endpoint for frontend to load tenant branding on init."""
    config = get_tenant_config(db, tenant_id)
    # Only return safe public fields
    return {
        "product_name":  config.get("product_name", "ResumeAI"),
        "primary_color": config.get("primary_color", "#0F6E56"),
        "logo_url":      config.get("logo_url"),
        "favicon_url":   config.get("favicon_url"),
        "hide_powered_by": config.get("hide_powered_by", False),
        "welcome_message": config.get("welcome_message"),
        "footer_text":   config.get("footer_text"),
    }
