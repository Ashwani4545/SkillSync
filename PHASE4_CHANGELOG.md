# Phase 4 — Advanced V2: Enterprise, Global & Scale

## What was built (Month 7+)

### AI Engine — New modules

| File | Description |
|------|-------------|
| `ai-engine/analyzers/bias_scanner.py`      | Scans resume for gendered language, age signals, ability-normative phrases, and prestige markers. Pre-scans with pattern matching, then uses Claude for nuanced analysis. Returns a 0-100 inclusivity score with phrase-by-phrase neutral alternatives. |
| `ai-engine/generators/cultural_adapter.py` | Adapts resume format, length, tone, and section structure for 8 countries (US, UK, Germany, Japan, Canada, Australia, France, India). Uses a built-in country norms database plus Claude for rewriting. |
| `ai-engine/llm_client.py`                  | Updated with automatic GPT-4o fallback when Claude is rate-limited or returns 5xx, exponential backoff retry, and fallback logging. |

### Backend — New routers

| Router | Endpoints | Plan |
|--------|-----------|------|
| `routers/bias.py`       | POST /bias/scan | Career+ |
| `routers/language.py`   | POST /language/adapt, GET /language/result/{id}, GET /language/countries | Career+ |
| `routers/whitelabel.py` | GET/POST /whitelabel/config, GET /whitelabel/config/public/{tenant_id} | Team |
| `routers/admin.py`      | GET /admin/spend, /admin/spend/breakdown, /admin/alerts, /admin/health, /admin/users/stats | Internal |

### Backend — New services

| File | Description |
|------|-------------|
| `services/whitelabel_service.py` | Per-tenant branding storage and retrieval (product name, colors, logo, domain) |
| `services/cost_tracker.py`       | Token usage logging, daily/monthly spend tracking, alert thresholds |
| `middleware/rate_limiter.py`      | slowapi + Redis rate limiting: 5/hr free, 60/hr pro, 120/hr career |

### Backend — New Celery workers

| File | Task |
|------|------|
| `workers/language_task.py` | Async cultural adaptation |

### Database migrations

- `alembic/versions/phase4_001_enterprise.py`
  - Creates `whitelabel_configs` table (tenant branding JSON per user)
  - Creates `llm_usage_logs` table (token counts, cost_usd, feature, timestamp)

### Frontend — New pages

| Page | Route | Plan |
|------|-------|------|
| Bias scanner      | `/bias-scanner`     | Career |
| Cultural adapter  | `/language-adapter` | Career |
| Admin dashboard   | `/admin`            | Internal |
| Settings          | `/settings`         | All |

### Infrastructure

| File | Description |
|------|-------------|
| `infra/nginx/nginx.conf`            | Production nginx with SSL, rate limiting, security headers |
| `docker-compose.prod.yml`           | Production compose with 2x backend, 3x workers, Flower monitoring |
| `infra/.github/workflows/deploy.yml`| Full CI/CD: test → build → ECR push → SSH deploy → Sentry release |
| `frontend/tests/e2e/all_flows.spec.ts` | Playwright E2E tests covering all 4 phases (17 test suites) |

---

## Full system overview — all 4 phases

```
Frontend (Next.js 14 — Vercel)
  13 pages:  landing, dashboard, upload, result, jd-adapter,
             compare, benchmark, gap-advisor, career-path, salary,
             github, bias-scanner, language-adapter, recruiter,
             share/[token], settings, admin
  Auth:      Clerk (Google + LinkedIn OAuth)
  State:     Zustand + React Query

Backend (FastAPI — EC2 × 2)
  17 routers, 40+ endpoints
  Rate limiting: slowapi + Redis (plan-based)
  Auth:      Clerk JWT middleware
  Plan gate: require_pro / require_career / require_team decorators

Celery Workers (EC2 × 3 — auto-scale)
  analyze_task    — full Phase 1 AI pipeline
  jd_task         — JD adaptation
  compare_task    — A/B comparison
  benchmark_task  — industry benchmark
  career_task     — trajectory prediction
  salary_task     — salary estimation
  language_task   — cultural adaptation
  beat            — periodic tasks (monthly counter reset)

AI Engine (importable Python module)
  analyzers:   ats, section, tone, persona, skill, bias (Phase 4)
  generators:  bullet, jd, interview, gap, career, salary, cultural (Phase 4)
  comparators: ab_tester, benchmark
  llm_client:  Claude primary + GPT-4o fallback (Phase 4)

Database (PostgreSQL RDS)
  users, resumes, analyses, jd_matches
  interview_questions, subscriptions, api_keys
  career_predictions, whitelabel_configs, llm_usage_logs
  8 Alembic migrations across 4 phases

Storage & Cache
  AWS S3    — resume files + exports
  Redis     — task queue + rate limiter + session cache
  Pinecone  — optional resume embeddings for benchmark

Monitoring
  Sentry     — error tracking + releases
  PostHog    — product analytics
  Flower     — Celery worker dashboard
  /admin     — internal cost & usage dashboard
```

---

## How to run Phase 4 locally

```bash
unzip resumeai-phase4-complete.zip && cd resumeai
cp .env.example .env          # fill in all keys including OPENAI_API_KEY
docker-compose up --build
alembic upgrade head          # runs all 4 phase migrations
```

Services:
- Frontend:   http://localhost:3000
- API:        http://localhost:8000
- API docs:   http://localhost:8000/docs
- Flower:     http://localhost:5555

---

## Deploy to production

```bash
# Build and push to ECR
docker build -t resumeai-backend:latest -f infra/docker/Dockerfile.backend ./backend
docker build -t resumeai-frontend:latest -f infra/docker/Dockerfile.frontend ./frontend

# On EC2
docker-compose -f docker-compose.prod.yml up -d
alembic upgrade head
```

---

## Complete feature × plan matrix (all phases)

| Feature                  | Free | Pro | Career | Team |
|--------------------------|:----:|:---:|:------:|:----:|
| ATS score                | ✓    | ✓   | ✓      | ✓    |
| Section grades           | ✓    | ✓   | ✓      | ✓    |
| Bullet rewriter          | ✓    | ✓   | ✓      | ✓    |
| Shareable score card     | ✓    | ✓   | ✓      | ✓    |
| Persona analysis         |      | ✓   | ✓      | ✓    |
| Tone & confidence        |      | ✓   | ✓      | ✓    |
| Skill checker            |      | ✓   | ✓      | ✓    |
| Interview predictor      |      | ✓   | ✓      | ✓    |
| JD Adapter               |      | ✓   | ✓      | ✓    |
| A/B Tester               |      | ✓   | ✓      | ✓    |
| Industry benchmark       |      | ✓   | ✓      | ✓    |
| Gap advisor              |      | ✓   | ✓      | ✓    |
| Career trajectory        |      |     | ✓      | ✓    |
| Salary calibration       |      |     | ✓      | ✓    |
| GitHub sync              |      |     | ✓      | ✓    |
| Bias scanner             |      |     | ✓      | ✓    |
| Cultural adapter (8 countries)|  |   | ✓      | ✓    |
| Bulk screening           |      |     |        | ✓    |
| Recruiter dashboard      |      |     |        | ✓    |
| API key access           |      |     |        | ✓    |
| White-label branding     |      |     |        | ✓    |
| Admin analytics          |      |     |        | ✓    |
