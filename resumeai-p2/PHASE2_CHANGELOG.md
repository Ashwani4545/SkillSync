# Phase 2 — Unique Differentiators

## What was built (Weeks 9–16)

### AI Engine — New modules

| File | Description |
|------|-------------|
| `ai-engine/generators/jd_adapter.py`     | Tailors resume JSON to a job description while preserving authentic voice |
| `ai-engine/comparators/ab_tester.py`     | Compares two resumes across 5 dimensions, declares a winner with reasoning |
| `ai-engine/comparators/benchmark_engine.py` | Simulates top-10% benchmark comparison for any role + industry |
| `ai-engine/generators/gap_disguiser.py`  | Detects employment gaps and generates honest reframing narratives |

### Backend — New routers

| Router | Endpoints |
|--------|-----------|
| `routers/jd.py`      | POST /jd/adapt, GET /jd/{id}, GET /jd/resume/{resume_id} |
| `routers/compare.py` | POST /compare/start, GET /compare/result/{task_id} |
| `routers/benchmark.py` | POST /benchmark/run, GET /benchmark/result/{task_id}, GET /benchmark/roles |
| `routers/gap.py`     | POST /gap/analyze |
| `routers/share.py`   | POST /share/generate/{analysis_id}, GET /share/{token} (public) |

### Backend — New Celery workers

| File | Task |
|------|------|
| `workers/jd_task.py`      | Async JD adaptation, saves to jd_matches table |
| `workers/compare_task.py` | Async A/B comparison, returns via Celery result backend |
| `workers/benchmark_task.py` | Async benchmark, returns via Celery result backend |

### Frontend — New pages

| Page | Route | Plan |
|------|-------|------|
| JD Adapter      | `/jd-adapter`  | Pro  |
| A/B Tester      | `/compare`     | Pro  |
| Benchmark       | `/benchmark`   | Pro  |
| Gap Advisor     | `/gap-advisor` | Pro  |
| Shareable card  | `/share/[token]` | All (public) |

### Database — New migration

- `alembic/versions/phase2_001_shareable.py`
  - Adds `share_token` column to `analyses`
  - Adds `status` column to `jd_matches`

### Dashboard

- Updated with Phase 2 feature cards
- Plan-gated feature access (locked icons for free users)
- Quick links from resume history to JD Adapter

---

## How to upgrade from Phase 1

```bash
# Pull latest code
git pull origin main

# Run new migration
alembic upgrade head

# Restart all services
docker-compose up --build
```

---

## Plan gating summary

| Feature           | Free | Pro | Career | Team |
|-------------------|------|-----|--------|------|
| ATS score         | ✓    | ✓   | ✓      | ✓    |
| Section grades    | ✓    | ✓   | ✓      | ✓    |
| Bullet rewriter   | ✓    | ✓   | ✓      | ✓    |
| Persona analysis  |      | ✓   | ✓      | ✓    |
| Tone analyzer     |      | ✓   | ✓      | ✓    |
| Skill checker     |      | ✓   | ✓      | ✓    |
| Interview predictor |    | ✓   | ✓      | ✓    |
| JD Adapter        |      | ✓   | ✓      | ✓    |
| A/B Tester        |      | ✓   | ✓      | ✓    |
| Benchmark         |      | ✓   | ✓      | ✓    |
| Gap Advisor       |      | ✓   | ✓      | ✓    |
| Career trajectory |      |     | ✓      | ✓    |
| Salary calibration|      |     | ✓      | ✓    |
| GitHub sync       |      |     | ✓      | ✓    |
| Bulk screening    |      |     |        | ✓    |
