"""
cost_tracker.py
Tracks Claude API token usage and estimated costs per analysis.
Alerts when daily/monthly spend exceeds thresholds.
Used for internal cost management and per-tenant billing insights.
"""
import json
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import text

# Claude Sonnet 4 pricing (as of 2025) — update as pricing changes
PRICE_PER_INPUT_TOKEN  = 3.00  / 1_000_000   # $3.00 per 1M input tokens
PRICE_PER_OUTPUT_TOKEN = 15.00 / 1_000_000   # $15.00 per 1M output tokens

# Cost alert thresholds
DAILY_ALERT_USD   = 50.0
MONTHLY_ALERT_USD = 500.0


def log_llm_call(
    db: Session,
    analysis_id: str,
    feature: str,
    input_tokens: int,
    output_tokens: int,
) -> dict:
    """
    Log a single LLM call with token counts and estimated cost.
    Call after every Claude API call.
    """
    cost_usd = (input_tokens * PRICE_PER_INPUT_TOKEN) + (output_tokens * PRICE_PER_OUTPUT_TOKEN)

    db.execute(
        text("""
            INSERT INTO llm_usage_logs
            (id, analysis_id, feature, input_tokens, output_tokens, cost_usd, logged_at)
            VALUES (gen_random_uuid(), :aid, :feat, :inp, :out, :cost, now())
        """),
        {
            "aid":  analysis_id,
            "feat": feature,
            "inp":  input_tokens,
            "out":  output_tokens,
            "cost": cost_usd,
        },
    )
    db.commit()
    return {"feature": feature, "cost_usd": round(cost_usd, 6)}


def get_daily_spend(db: Session) -> float:
    """Get total LLM spend for today in USD."""
    row = db.execute(
        text("SELECT COALESCE(SUM(cost_usd), 0) as total FROM llm_usage_logs WHERE logged_at::date = :today"),
        {"today": date.today().isoformat()},
    ).fetchone()
    return float(row.total) if row else 0.0


def get_monthly_spend(db: Session) -> float:
    """Get total LLM spend for the current month in USD."""
    row = db.execute(
        text("""SELECT COALESCE(SUM(cost_usd), 0) as total FROM llm_usage_logs
                WHERE DATE_TRUNC('month', logged_at) = DATE_TRUNC('month', now())"""),
    ).fetchone()
    return float(row.total) if row else 0.0


def get_spend_by_feature(db: Session, days: int = 7) -> list[dict]:
    """Get cost breakdown by feature over the last N days."""
    rows = db.execute(
        text("""
            SELECT feature,
                   COUNT(*) as calls,
                   SUM(input_tokens) as total_input,
                   SUM(output_tokens) as total_output,
                   SUM(cost_usd) as total_cost
            FROM llm_usage_logs
            WHERE logged_at >= now() - INTERVAL ':days days'
            GROUP BY feature
            ORDER BY total_cost DESC
        """),
        {"days": days},
    ).fetchall()

    return [
        {
            "feature":      r.feature,
            "calls":        r.calls,
            "total_tokens": r.total_input + r.total_output,
            "cost_usd":     round(float(r.total_cost), 4),
        }
        for r in rows
    ]


def check_alerts(db: Session) -> list[dict]:
    """Return active cost alerts."""
    alerts = []
    daily   = get_daily_spend(db)
    monthly = get_monthly_spend(db)

    if daily >= DAILY_ALERT_USD:
        alerts.append({
            "level":   "warning",
            "type":    "daily_spend",
            "message": f"Daily LLM spend ${daily:.2f} exceeded threshold ${DAILY_ALERT_USD}",
        })
    if monthly >= MONTHLY_ALERT_USD:
        alerts.append({
            "level":   "critical",
            "type":    "monthly_spend",
            "message": f"Monthly LLM spend ${monthly:.2f} exceeded threshold ${MONTHLY_ALERT_USD}",
        })

    return alerts
