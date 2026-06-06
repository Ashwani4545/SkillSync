# Phase 3 — Career Intelligence

## What was built (Weeks 17–24)

### AI Engine — New modules

| File | Description |
|------|-------------|
| `ai-engine/generators/career_predictor.py`  | Infers current career level, predicts next 2 realistic roles with action plans, skill gaps, timelines, salary ranges, and a 3-5 year stretch goal |
| `ai-engine/generators/salary_estimator.py`  | Estimates base salary + total comp range by role, location and resume strength; returns location multipliers and negotiation tips |
| `backend/app/services/github_service.py`    | Fetches public GitHub repos (no OAuth needed) and uses Claude to match projects to resume bullets, flagging unmentioned impressive repos |

### Backend — New routers

| Router | Endpoints | Plan |
|--------|-----------|------|
| `routers/career.py`    | POST /career/trajectory, GET /career/result/{id}, POST /career/salary, GET /career/salary/result/{id} | Career+ |
| `routers/github.py`    | POST /github/connect, POST /github/match, GET /github/repos/{username} | Career+ |
| `routers/recruiter.py` | POST /recruiter/bulk-upload, POST /recruiter/screen, GET /recruiter/candidates | Team |
| `routers/api_keys.py`  | POST /keys/create, GET /keys, DELETE /keys/{id} | Team |

### Backend — New Celery workers

| File | Task |
|------|------|
| `workers/career_task.py`  | Async career trajectory prediction |
| `workers/salary_task.py`  | Async salary range estimation |

### Database migrations

- `alembic/versions/phase3_001_career.py`
  - Adds `github_username` column to `users`
  - Creates `api_keys` table (id, user_id, key_hash, name, is_active, last_used)
  - Creates `career_predictions` cache table

### Frontend — New pages

| Page | Route | Plan |
|------|-------|------|
| Career Path predictor | `/career-path`  | Career |
| Salary calibrator     | `/salary`       | Career |
| GitHub sync           | `/github`       | Career |
| Recruiter dashboard   | `/recruiter`    | Team   |

### Dashboard

- Updated with all 9 feature cards across Phase 1/2/3
- Plan-gated with lock icons for inaccessible features
- Per-resume quick-action buttons for Career Path and JD Adapter

---

## How to upgrade from Phase 2

```bash
git pull origin main
alembic upgrade head
docker-compose up --build
```

---

## Full feature × plan matrix

| Feature               | Free | Pro | Career | Team |
|-----------------------|:----:|:---:|:------:|:----:|
| ATS score             | ✓    | ✓   | ✓      | ✓    |
| Section grades        | ✓    | ✓   | ✓      | ✓    |
| Bullet rewriter       | ✓    | ✓   | ✓      | ✓    |
| Persona analysis      |      | ✓   | ✓      | ✓    |
| Tone analyzer         |      | ✓   | ✓      | ✓    |
| Skill checker         |      | ✓   | ✓      | ✓    |
| Interview predictor   |      | ✓   | ✓      | ✓    |
| JD Adapter            |      | ✓   | ✓      | ✓    |
| A/B Tester            |      | ✓   | ✓      | ✓    |
| Industry benchmark    |      | ✓   | ✓      | ✓    |
| Gap advisor           |      | ✓   | ✓      | ✓    |
| Shareable score card  | ✓    | ✓   | ✓      | ✓    |
| Career trajectory     |      |     | ✓      | ✓    |
| Salary calibration    |      |     | ✓      | ✓    |
| GitHub sync           |      |     | ✓      | ✓    |
| Bulk screening        |      |     |        | ✓    |
| Recruiter dashboard   |      |     |        | ✓    |
| API key access        |      |     |        | ✓    |

---

## Architecture overview (all 3 phases)

```
Browser
  └─ Next.js 14 (Vercel)
       ├─ 12 pages across 4 plans
       └─ Clerk auth + React Query

FastAPI (EC2)
  ├─ 13 routers, 30+ endpoints
  ├─ Clerk JWT middleware + plan gating
  └─ Celery task queue → Redis

Celery Workers (EC2 auto-scale)
  ├─ analyze_task     (full AI pipeline)
  ├─ jd_task          (JD adaptation)
  ├─ compare_task     (A/B testing)
  ├─ benchmark_task   (industry comparison)
  ├─ career_task      (trajectory prediction)
  └─ salary_task      (salary estimation)

AI Engine (importable module)
  ├─ analyzers/  (ats, persona, tone, section, skill)
  ├─ generators/ (bullet, jd, interview, gap, career, salary)
  ├─ comparators/(ab_tester, benchmark)
  └─ llm_client  (Claude API wrapper with retry)

PostgreSQL (RDS)
  ├─ users, resumes, analyses
  ├─ jd_matches, interview_questions
  ├─ subscriptions, api_keys
  └─ career_predictions

AWS S3 — file storage
Redis   — task queue + cache
Pinecone (optional) — embeddings
```
