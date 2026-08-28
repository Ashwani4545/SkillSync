# SkillSync — AI-Powered Resume Analyzer & Career Coach

> Analyze your resume through the eyes of an ATS bot, a recruiter, and a hiring manager — all at once. Get actionable AI suggestions, predict interview questions, and benchmark against top candidates in your field.

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE) [![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20FastAPI%20%7C%20Claude%20AI-purple)](#tech-stack) [![Status](https://img.shields.io/badge/status-In%20Development-orange)](#roadmap)

**Live demo:** [skill-sync-hazel.vercel.app](https://skill-sync-hazel.vercel.app)

> **Note on naming:** this project was originally scaffolded as "ResumeAI" — that name still shows up in some internal config (Docker image tags, CI job name, deploy paths). It's the same project as `SkillSync`. Cleaning this up is tracked in [Known Issues](#known-issues).

---

## Table of Contents

- [What is SkillSync?](#what-is-skillsync)
- [Key Features](#key-features)
- [How It Stands Apart](#how-it-stands-apart)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Feature Deep-Dives](#feature-deep-dives)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Known Issues](#known-issues)
- [Contributing](#contributing)
- [License](#license)

---

## What is SkillSync?

SkillSync is a full-stack SaaS application that goes beyond keyword matching. It simulates three reviewer perspectives on a resume, scores language confidence, predicts likely interview questions, and compares a resume against top-performing candidates in a given role and industry.

**The core insight:** most resume tools tell you *what's missing*. SkillSync tells you *why you're being filtered out* and how to fix it.

---

## Key Features

### Core Analysis
- **ATS compatibility scoring** — parses and scores a resume against applicant-tracking-system rules (`ats_analyzer.py`)
- **Section-by-section grading** — individual scores for summary, experience, skills, education (`section_grader.py`)
- **Bullet point rewriter** — turns weak, passive bullets into action-verb + metric + outcome format (`bullet_rewriter.py`)
- **Format & structure audit** — flags fonts, columns, tables, and anything that breaks ATS parsing (`audit_analyzer.py`)

### Differentiators
| Feature | What it does | Source |
|---|---|---|
| **Persona-based analysis** | Views the resume as an ATS bot, HR recruiter, and hiring manager simultaneously | `persona_analyzer.py` |
| **Tone & confidence analyzer** | Detects passive language, hedging, filler words | `tone_analyzer.py` |
| **Interview question predictor** | Generates likely recruiter questions from vague or weak resume spots | `interview_predictor.py` |
| **JD adapter** | Tailors a resume to a pasted job description | `jd_adapter.py` |
| **Resume A/B tester** | Compares two resume versions head-to-head for a specific job | `ab_tester.py` |
| **Skill authenticity checker** | Cross-references claimed skills against project descriptions | `skill_checker.py` |
| **Industry benchmark** | Compares a resume against anonymized top-10% resumes in the same role | `benchmark_engine.py` |
| **Career gap advisor** | Suggests honest reframing strategies for employment gaps | `gap_disguiser.py` |
| **Career trajectory predictor** | Predicts realistic next roles and skill gaps | `career_predictor.py` |
| **Salary calibration** | Estimates market salary range from resume strength + location | `salary_estimator.py` |
| **Bias & inclusivity scanner** | Flags biased or non-inclusive language | `bias_scanner.py` |
| **Multilingual / cultural adapter** | Adapts a resume to region-specific CV formats | `cultural_adapter.py` |
| **GitHub portfolio sync** | Pulls projects from GitHub to back up resume bullets with evidence | `github_service.py`, `github_task.py`* |
| **Recruiter view / dashboard** | Separate recruiter-facing surface (`/recruiter`, `recruiter.py` router) | — |
| **Shareable score cards** | Public share links for a resume's score (`/share/[token]`, `share.py` router) | — |
| **White-label support** | `whitelabel_service.py` + `whitelabel.py` router for B2B/team usage | — |
| **Two-factor auth** | `two_factor.py` router | — |
| **API key management** | `api_keys.py` router for programmatic access | — |

\* Several of these (recruiter, share, white-label, 2FA, API keys) exist as working backend routers/services but currently have little or no accompanying documentation — see [Known Issues](#known-issues).

---

## How It Stands Apart

| Existing Tool | What They Do | What We Do Differently |
|---|---|---|
| **Jobscan** | Keyword match vs. JD | Persona analysis + tone scoring + interview predictor |
| **Resume Worded** | Generic tips | Role-specific benchmarking against real top candidates |
| **Rezi.ai** | ATS scoring | Full career intelligence — trajectory, salary, interviews |
| **Enhancv** | Design-focused | Deep content quality analysis, not just layout |
| **Teal HQ** | Job tracking | Resume AI as the primary product, not an afterthought |

---

## Tech Stack

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS + shadcn/ui, Zustand, React Query, Framer Motion
**Backend:** FastAPI (Python), Celery, Redis, Pydantic v2
**AI / ML:** Anthropic Claude API (primary), OpenAI GPT-4o (fallback), LangChain/LangGraph, Sentence-Transformers, spaCy + NLTK
**File Parsing:** PyMuPDF / pdfplumber, python-docx, unstructured.io, Tesseract OCR
**Database & Storage:** PostgreSQL, Prisma/SQLAlchemy, pgvector/Pinecone, AWS S3, Redis
**Auth & Payments:** Clerk, Stripe
**DevOps:** Docker + Docker Compose, AWS EC2/RDS/S3, Vercel, GitHub Actions, Sentry, PostHog

---

## Project Structure

```
SkillSync/
├── frontend/               Next.js 14 app (14 route pages incl. dashboard,
│                            analyze, jd-adapter, career-path, benchmark,
│                            bias-scanner, gap-advisor, github, language-adapter,
│                            recruiter, salary, settings, share, admin)
├── backend/                FastAPI service
│   └── app/routers/        19 routers: resume, analysis, jd, career, benchmark,
│                            salary, compare, gap, bias, github, language,
│                            recruiter, share, two_factor, whitelabel, admin,
│                            api_keys, billing, health
├── ai-engine/               All LLM logic (importable module)
│   ├── analyzers/           ats, audit, bias, persona, section_grader,
│   │                         skill_checker, tone
│   ├── generators/          bullet_rewriter, career_predictor, cultural_adapter,
│   │                         gap_disguiser, interview_predictor, jd_adapter,
│   │                         salary_estimator
│   ├── comparators/         ab_tester, benchmark_engine
│   ├── prompts/             ⚠ currently only 1 of ~13 modules has a
│   │                         dedicated prompt file — see Known Issues
│   ├── llm_client.py
│   └── pipeline.py          Orchestrates the full analysis run
├── workers/                 Celery task definitions (analyze, benchmark, career,
│                            compare, jd, language, salary)
├── infra/                   Dockerfiles, nginx config, GitHub Actions workflow
├── scratch/                 ⚠ ad hoc debug/test scripts — not a real test
│                            suite, see Known Issues
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## Getting Started

### Prerequisites
- **Node.js** v18.17.0+
- **Python** 3.11+
- **Docker** and **Docker Compose** v2+
- **Git**

API keys needed: [Anthropic Claude](https://console.anthropic.com/), [Stripe](https://dashboard.stripe.com/), [Clerk](https://clerk.com/), AWS (or local MinIO), [Pinecone](https://www.pinecone.io/) (optional locally).

### Environment Setup

```bash
git clone https://github.com/Ashwani4545/SkillSync.git
cd SkillSync
cp .env.example .env
# fill in ANTHROPIC_API_KEY, CLERK keys, DATABASE_URL, AWS/S3, STRIPE keys, etc.
```

### Running Locally

**Option A — Docker Compose (recommended)**

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`

**Option B — Manual setup**

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Celery worker (new terminal)
cd backend && source venv/bin/activate
celery -A workers.celery_app worker --loglevel=info

# Frontend (new terminal)
cd frontend
npm install && npm run dev
```

---

## API Reference

Full interactive docs at `http://localhost:8000/docs` when running locally.

```
POST   /api/v1/resume/upload          Upload and parse a resume file
GET    /api/v1/resume/{id}            Get parsed resume data
POST   /api/v1/analysis/start         Trigger full AI analysis
GET    /api/v1/analysis/{id}          Get analysis results
POST   /api/v1/jd/adapt               Generate JD-tailored resume variant
POST   /api/v1/analysis/compare       A/B test two resume versions
GET    /api/v1/career/trajectory      Get career path prediction
GET    /api/v1/benchmark/{role}       Get industry benchmark data
POST   /api/v1/interview/predict      Generate predicted interview questions
GET    /api/v1/salary/estimate        Salary calibration
POST   /api/v1/bias/scan              Bias & inclusivity scan
POST   /api/v1/language/adapt         Cultural/format adapter
GET    /api/v1/github/sync            Pull GitHub portfolio projects
GET    /api/v1/recruiter/*            Recruiter-facing endpoints
POST   /api/v1/share/create           Create a public share link
```

All endpoints (except public landing data) require a Clerk JWT: `Authorization: Bearer <clerk_session_token>`.

---

## Feature Deep-Dives

### Persona-Based Analysis
`persona_analyzer.py` runs a resume through three separate LLM prompts, each evaluating from a different angle:
- **ATS bot** — keyword density, section headers, parseable structure; returns pass/fail + missing keywords
- **HR recruiter** — red flags, career gaps, job hops, seniority mismatch
- **Hiring manager** — credibility of claims, whether achievements are quantified

Each persona returns a `stop_reading_at` field marking where that reviewer would likely lose interest.

### Interview Question Predictor
Every vague bullet or unsupported claim is flagged and passed to `interview_predictor.py`, which is prompted to think like a senior interviewer probing the weakest points — returning both the fix and the likely follow-up questions.

### Resume A/B Tester
`ab_tester.py` scores two resume versions against the same criteria (ATS compatibility, keyword match, tone, persona scores) and returns a winner with a reasoning summary.

---

## Database Schema

Key tables: `users`, `resumes`, `analyses`, `benchmarks` (pgvector embeddings), `jd_matches`, `interview_questions`, `subscriptions`. See `backend/alembic/versions/` for the full migration history (phase2/3/4 migrations add sharing, career, and enterprise tables).

---

## Deployment

- **Frontend:** Vercel (`cd frontend && npx vercel --prod`)
- **Backend:** Docker on AWS EC2, migrations via `alembic upgrade head` against RDS
- **CI/CD:** `infra/.github/workflows/deploy.yml` — type-check + lint the frontend, run backend tests, build/push Docker images to ECR, deploy via SSH, notify Sentry

> ⚠ The backend test step (`pytest tests/ -v`) currently has no `backend/tests/` directory to run against — see [Known Issues](#known-issues).

---

## Roadmap

### Phase 1 — MVP
- [x] Project setup, auth, database
- [x] Resume upload and parsing (PDF + DOCX)
- [x] ATS scoring + section grading
- [x] Bullet rewriter
- [x] Tone and confidence analyzer
- [x] Persona-based analysis (ATS / HR / HM)
- [ ] Stripe billing (routes scaffolded, not fully wired)
- [x] User dashboard

### Phase 2 — Differentiators
- [x] One-click JD adapter
- [x] Interview question predictor
- [x] Resume A/B tester
- [x] Skill authenticity checker
- [x] Career gap advisor
- [x] Industry benchmark comparison
- [x] Shareable score cards

### Phase 3 — Career Intelligence
- [x] Career trajectory predictor
- [x] Salary calibration
- [x] GitHub portfolio integration
- [ ] LinkedIn OAuth + profile sync
- [ ] Expanded benchmark database

### Phase 4 — Advanced
- [x] Multilingual + cultural format adapter
- [x] Bias and inclusivity language scanner
- [x] Recruiter dashboard (B2B) — backend + page scaffolded
- [ ] Bulk resume screening API
- [ ] White-label licensing — service scaffolded, not documented

*(Checked items reflect code present in `ai-engine/`, `backend/app/routers/`, and `frontend/src/app/` as of this writeup — treat as an implementation status, not a guarantee every flow is production-hardened end-to-end.)*

---

## Known Issues

Tracked here instead of silently left out of the roadmap:

- **No backend test suite.** CI invokes `pytest tests/` but `backend/tests/` doesn't exist — the test-backend CI job currently fails on every commit. The scripts in `scratch/` (`test_ats_accuracy.py`, `test_pipeline_e2e.py`, `test_mock_analysis.py`, etc.) look like the start of one but aren't wired into pytest or CI.
- **No `LICENSE` file** despite the MIT badge — needs to be added.
- **Naming inconsistency** between the repo (`SkillSync`), the product name in this README, and internal config (Docker image tags `resumeai-*`, CI workflow name "ResumeAI CI/CD", deploy path `/opt/resumeai`).
- **Sparse prompt library.** `ai-engine/prompts/` has one file (`ats_prompt.py`) for ~13 analyzer/generator modules — the rest appear to have prompts inlined in code rather than versioned separately.
- **Recruiter, white-label, share, 2FA, and API-key features** have backend routers and (mostly) frontend pages but no user-facing documentation yet.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make changes with clear, atomic commits
4. Add or update tests as needed
5. Open a pull request describing what changed and why

**Code style:** Frontend uses ESLint + Prettier (`npm run lint`); backend uses Black + isort (`black . && isort .`); commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`).

---

## License

MIT License — a `LICENSE` file needs to be added to the repo root to make this enforceable (see [Known Issues](#known-issues)).

---

*Have a question or idea? Open an issue or reach out at ashwanipandey4545@gmail.com*
