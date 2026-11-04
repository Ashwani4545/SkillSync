"""
billing.py - Stripe subscription management
GET  /billing/plans      list plans
POST /billing/checkout   create Stripe checkout session
POST /billing/portal     open Stripe customer portal
POST /billing/webhook    Stripe webhook

Fixes vs the original (money-affecting ones first):
  * Plan changes in the Stripe portal (pro -> career, or a downgrade) were
    ignored: `customer.subscription.updated` only touched the status, never the
    plan. Users kept the wrong plan.
  * Non-payment never removed access. Only `subscription.deleted` downgraded
    users; `unpaid` / `incomplete_expired` / `canceled` via `updated` left
    user.plan on a paid tier. Entitlement is now derived from live Stripe state
    (see plans.entitled_plan).
  * Event ordering / duplicates: every subscription-related event now re-reads
    the subscription from Stripe and applies that snapshot, so late, duplicated
    or out-of-order webhooks all converge to the same correct state.
  * Checkout could be started while already subscribed (double billing). It now
    returns 409 and points to the portal.
  * success_url / cancel_url were taken from the request body unchecked (open
    redirect). They must now start with NEXT_PUBLIC_APP_URL.
  * A new Stripe customer was created on every checkout attempt and never saved.
    The customer id is now persisted straight away.
  * `async def` handlers called the blocking Stripe SDK and the DB on the event
    loop. Handlers are plain `def` (threadpool); the webhook only awaits the body.
  * Webhook: missing header / bad payload returned HTTP 500 instead of 400; an
    unset STRIPE_WEBHOOK_SECRET is now refused explicitly.
"""
import logging
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.plans import PLANS, entitled_plan
from app.db.models import PlanEnum, Subscription, SubscriptionStatusEnum, User
from app.db.session import get_db
from app.middleware.auth import get_current_user

try:
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
except ImportError:  # pragma: no cover
    stripe = None

logger = logging.getLogger(__name__)
router = APIRouter()


class CheckoutRequest(BaseModel):
    plan: Literal["pro", "career", "team"]
    success_url: str = Field(max_length=500)
    cancel_url: str = Field(max_length=500)


def _price_to_plan() -> dict[str, str]:
    mapping = {
        settings.STRIPE_PRO_PRICE_ID: "pro",
        settings.STRIPE_CAREER_PRICE_ID: "career",
        settings.STRIPE_TEAM_PRICE_ID: "team",
    }
    return {price: plan for price, plan in mapping.items() if price}


def _plan_to_price(plan: str) -> str:
    return {v: k for k, v in _price_to_plan().items()}.get(plan, "")


def _url_allowed(url: str) -> bool:
    base = settings.NEXT_PUBLIC_APP_URL.rstrip("/")
    return url == base or url.startswith(base + "/")


def _require_stripe():
    if stripe is None or not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Billing is not available right now.")


_STATUS_MAP = {
    "active": SubscriptionStatusEnum.active,
    "trialing": SubscriptionStatusEnum.active,
    "past_due": SubscriptionStatusEnum.past_due,
    "canceled": SubscriptionStatusEnum.canceled,
}


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/plans")
def get_plans():
    return {
        "plans": [
            {
                "id": p.id, "name": p.name, "price": p.price_usd, "interval": p.interval,
                "analyses_per_month": p.monthly_analyses, "features": list(p.features),
            }
            for p in PLANS.values()
        ]
    }


@router.post("/checkout")
def create_checkout(
    body: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_stripe()
    if not (_url_allowed(body.success_url) and _url_allowed(body.cancel_url)):
        raise HTTPException(status_code=400, detail="Invalid return URL.")

    price_id = _plan_to_price(body.plan)
    if not price_id:
        raise HTTPException(status_code=503, detail="This plan is not available right now.")

    sub_record = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if sub_record and sub_record.status in (SubscriptionStatusEnum.active, SubscriptionStatusEnum.past_due):
        raise HTTPException(
            status_code=409,
            detail="You already have a subscription. Use the billing portal to change or cancel it.",
        )

    customer_id = sub_record.stripe_customer_id if sub_record else None
    if not customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            metadata={"user_id": str(current_user.id)},
            idempotency_key=f"customer-{current_user.id}",
        )
        customer_id = customer.id
        if sub_record is None:
            sub_record = Subscription(
                user_id=current_user.id, plan=PlanEnum.free, status=SubscriptionStatusEnum.inactive
            )
            db.add(sub_record)
        sub_record.stripe_customer_id = customer_id
        db.commit()

    sep = "&" if "?" in body.success_url else "?"
    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        client_reference_id=str(current_user.id),
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{body.success_url}{sep}session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=body.cancel_url,
        metadata={"user_id": str(current_user.id), "plan": body.plan},
        subscription_data={"metadata": {"user_id": str(current_user.id), "plan": body.plan}},
    )
    return {"checkout_url": session.url}


@router.post("/portal")
def create_portal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_stripe()
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub or not sub.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found.")
    portal = stripe.billing_portal.Session.create(
        customer=sub.stripe_customer_id,
        return_url=f"{settings.NEXT_PUBLIC_APP_URL.rstrip('/')}/dashboard",
    )
    return {"portal_url": portal.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    _require_stripe()
    if not settings.STRIPE_WEBHOOK_SECRET:
        logger.error("STRIPE_WEBHOOK_SECRET is not set; refusing webhook")
        raise HTTPException(status_code=503, detail="Webhook not configured")

    signature = request.headers.get("stripe-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, signature, settings.STRIPE_WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except Exception:  # SignatureVerificationError (class path differs across stripe versions)
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        await run_in_threadpool(_handle_stripe_event, event, db)
    except Exception:
        db.rollback()
        logger.exception("Webhook handling failed for event %s", event.get("id"))
        raise HTTPException(status_code=500, detail="Webhook processing error")  # Stripe will retry
    return {"received": True}


# ── Event handling ────────────────────────────────────────────────────────────

def _handle_stripe_event(event, db: Session) -> None:
    etype = event["type"]
    obj = event["data"]["object"]

    if etype == "checkout.session.completed":
        if obj.get("mode") == "subscription" and obj.get("subscription"):
            _sync_subscription(db, obj["subscription"], (obj.get("metadata") or {}).get("user_id"))
    elif etype in (
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    ):
        _sync_subscription(db, obj["id"], (obj.get("metadata") or {}).get("user_id"))
    # Other events are acknowledged and ignored.


def _sync_subscription(db: Session, stripe_sub_id: str, user_id_hint: str | None) -> None:
    """Re-read the subscription from Stripe (source of truth) and apply it."""
    s = stripe.Subscription.retrieve(stripe_sub_id)
    status = s["status"]
    customer_id = s["customer"]
    items = (s.get("items") or {}).get("data") or []
    price_id = items[0]["price"]["id"] if items else None
    plan_id = _price_to_plan().get(price_id)
    user_id_hint = user_id_hint or (s.get("metadata") or {}).get("user_id")

    sub = db.query(Subscription).filter(Subscription.stripe_sub_id == stripe_sub_id).first()
    if sub is None:
        sub = db.query(Subscription).filter(Subscription.stripe_customer_id == customer_id).first()
    if sub is None and user_id_hint:
        sub = db.query(Subscription).filter(Subscription.user_id == user_id_hint).first()

    user = None
    if sub is not None:
        user = db.query(User).filter(User.id == sub.user_id).first()
    elif user_id_hint:
        user = db.query(User).filter(User.id == user_id_hint).first()
        if user is not None:
            sub = Subscription(user_id=user.id)
            db.add(sub)

    if user is None or sub is None:
        logger.warning("Stripe subscription %s matches no user; ignoring", stripe_sub_id)
        return

    entitled = entitled_plan(status, plan_id)
    if plan_id is None and status in ("active", "trialing", "past_due"):
        logger.error("Subscription %s has unknown price %s; granting no paid plan", stripe_sub_id, price_id)

    sub.stripe_customer_id = customer_id
    sub.stripe_sub_id = stripe_sub_id
    sub.plan = PlanEnum(entitled)
    sub.status = _STATUS_MAP.get(status, SubscriptionStatusEnum.inactive)
    user.plan = PlanEnum(entitled)
    db.commit()
    logger.info("Subscription %s -> user %s plan=%s (stripe status=%s)", stripe_sub_id, user.id, entitled, status)