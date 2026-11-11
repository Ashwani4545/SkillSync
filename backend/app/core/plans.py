from dataclasses import dataclass


@dataclass(frozen=True)
class Plan:
    id: str
    name: str
    price_usd: int
    interval: str
    monthly_analyses: int | None
    features: tuple[str, ...]


PLANS = {
    "free": Plan(
        id="free",
        name="Free",
        price_usd=0,
        interval="forever",
        monthly_analyses=3,
        features=("3 resume ATS audits per month", "30+ ATS schema and format checks"),
    ),
    "pro": Plan(
        id="pro",
        name="Pro",
        price_usd=19,
        interval="month",
        monthly_analyses=None,
        features=("Unlimited resume audits", "3-reviewer simulation"),
    ),
    "career": Plan(
        id="career",
        name="Career",
        price_usd=39,
        interval="month",
        monthly_analyses=None,
        features=("Everything in Pro", "Career trajectory and benchmarks"),
    ),
    "team": Plan(
        id="team",
        name="Team",
        price_usd=99,
        interval="month",
        monthly_analyses=None,
        features=("Everything in Career", "Recruiter and API access"),
    ),
}


def entitled_plan(status: str, plan_id: str | None) -> str:
    if status in {"active", "trialing", "past_due"} and plan_id in {"pro", "career", "team"}:
        return plan_id
    return "free"
