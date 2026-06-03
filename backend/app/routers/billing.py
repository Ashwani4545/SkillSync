"""
billing.py
Stripe subscription management.
- GET  /billing/plans         — list available plans
- POST /billing/checkout      — create Stripe checkout session
- POST /billing/portal        — open Stripe customer portal
- POST /billing/webhook       — handle Stripe webhook events
"""
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import User, Subscription, PlanEnum, SubscriptionStatusEnum
from app.middleware.auth import get_current_user
from app.core.config import settings

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY


# ── Schemas ──────────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    plan: str  # "pro" | "career" | "team"
    success_url: str
    cancel_url: str


PLAN_PRICE_MAP = {
    "pro":    lambda: settings.STRIPE_PRO_PRICE_ID,
    "career": lambda: settings.STRIPE_CAREER_PRICE_ID,
    "team":   lambda: settings.STRIPE_TEAM_PRICE_ID,
}

PLAN_LIMITS = {
    "free":   {"analyses_per_month": 3,  "features": ["ats_score", "section_grades", "bullet_rewrites"]},
    "pro":    {"analyses_per_month": -1, "features": ["all_core", "persona", "tone", "skill_check", "interview", "jd_adapter", "ab_test"]},
    "career": {"analyses_per_month": -1, "features": ["all_pro", "career_path", "salary", "github_sync", "benchmark"]},
    "team":   {"analyses_per_month": -1, "features": ["all_career", "bulk_screening", "recruiter_dashboard", "api_access"]},
}


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("/plans")
def get_plans():
    return {
        "plans": [
            {"id": "free",   "name": "Free",        "price": 0,   "interval": None,    **PLAN_LIMITS["free"]},
            {"id": "pro",    "name": "Pro",          "price": 19,  "interval": "month", **PLAN_LIMITS["pro"]},
            {"id": "career", "name": "Career",       "price": 39,  "interval": "month", **PLAN_LIMITS["career"]},
            {"id": "team",   "name": "Team / B2B",   "price": 199, "interval": "month", **PLAN_LIMITS["team"]},
        ]
    }


@router.post("/checkout")
async def create_checkout(
    body: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.plan not in PLAN_PRICE_MAP:
        raise HTTPException(400, f"Invalid plan: {body.plan}")

    price_id = PLAN_PRICE_MAP[body.plan]()
    if not price_id:
        raise HTTPException(500, "Stripe price ID not configured for this plan.")

    # Get or create Stripe customer
    sub_record = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    customer_id = sub_record.stripe_customer_id if sub_record else None

    if not customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            metadata={"user_id": str(current_user.id)},
        )
        customer_id = customer.id

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=body.success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=body.cancel_url,
        metadata={"user_id": str(current_user.id), "plan": body.plan},
    )

    return {"checkout_url": session.url}


@router.post("/portal")
async def create_portal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub or not sub.stripe_customer_id:
        raise HTTPException(400, "No active subscription found.")

    portal = stripe.billing_portal.Session.create(
        customer=sub.stripe_customer_id,
        return_url=f"{settings.NEXT_PUBLIC_APP_URL}/dashboard",
    )
    return {"portal_url": portal.url}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: Session = Depends(get_db),
):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid webhook signature")

    _handle_stripe_event(event, db)
    return {"received": True}


def _handle_stripe_event(event: dict, db: Session):
    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"].get("user_id")
        plan    = session["metadata"].get("plan")
        customer_id = session.get("customer")
        sub_id  = session.get("subscription")

        if not user_id or not plan:
            return

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return

        plan_enum = PlanEnum(plan)
        user.plan = plan_enum

        sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
        if not sub:
            sub = Subscription(user_id=user.id)
            db.add(sub)

        sub.stripe_customer_id = customer_id
        sub.stripe_sub_id      = sub_id
        sub.plan               = plan_enum
        sub.status             = SubscriptionStatusEnum.active
        db.commit()

    elif event_type in ("customer.subscription.deleted", "customer.subscription.updated"):
        stripe_sub = event["data"]["object"]
        sub = db.query(Subscription).filter(
            Subscription.stripe_sub_id == stripe_sub["id"]
        ).first()

        if sub:
            if event_type == "customer.subscription.deleted":
                sub.status = SubscriptionStatusEnum.canceled
                user = db.query(User).filter(User.id == sub.user_id).first()
                if user:
                    user.plan = PlanEnum.free
            else:
                status_map = {
                    "active":   SubscriptionStatusEnum.active,
                    "canceled": SubscriptionStatusEnum.canceled,
                    "past_due": SubscriptionStatusEnum.past_due,
                }
                sub.status = status_map.get(stripe_sub["status"], SubscriptionStatusEnum.inactive)

            db.commit()
