# ResumeAI — AI-Powered Resume Analyzer & Career Coach

> Analyze your resume through the eyes of an ATS bot, a recruiter, and a hiring manager — all at once. Get actionable AI suggestions, predict interview questions, and benchmark against top candidates in your field.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20FastAPI%20%7C%20Claude%20AI-purple)
![Status](https://img.shields.io/badge/status-In%20Development-orange)

---

## Table of Contents

- [What is ResumeAI?](#what-is-resumeai)
- [Key Features](#key-features)
- [How It Stands Apart](#how-it-stands-apart)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Feature Deep-Dives](#feature-deep-dives)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## What is ResumeAI?

ResumeAI is a full-stack SaaS application that goes far beyond keyword matching. Instead of just checking if your resume contains the right words, it simulates three different reviewer perspectives, measures your language confidence, predicts what a recruiter will ask you in an interview, and compares your resume against top-performing candidates in your exact role and industry.

**The core insight:** Most resume tools tell you *what's missing*. ResumeAI tells you *why you're being filtered out* and exactly how to fix it.

---

## Key Features

### Core Analysis
- **ATS compatibility scoring** — parse and score your resume against applicant tracking system rules
- **Section-by-section grading** — individual scores for summary, experience, skills, and education
- **Bullet point rewriter** — transform weak, passive bullets into action-verb + metric + outcome format
- **Format & structure audit** — flag fonts, column layouts, tables, and elements that break ATS parsing

### Unique Differentiators

| Feature | What it does | Why it matters |
|---|---|---|
| **Persona-based analysis** | Views your resume as an ATS bot, HR recruiter, and hiring manager simultaneously | Shows exactly where each reviewer would stop reading |
| **Tone & confidence analyzer** | Detects passive language, hedging phrases, and filler words | Gives you a confidence score per section with rewrites |
| **Interview question predictor** | Generates likely recruiter questions from vague or weak resume spots | Lets you prepare before the interview, not after |
| **JD adapter** | Paste any job description to get a tailored version of your resume | One-click optimization for each application |
| **Resume A/B tester** | Compare two resume versions head-to-head for a specific job | Data-driven version selection, not guesswork |
| **Skill authenticity checker** | Cross-references claimed skills against your project descriptions | Flags skills you listed without evidence |
| **Industry benchmark** | Compares your resume against anonymized top 10% resumes in your role | Shows exactly where the gap is |
| **Career gap disguiser** | Suggests honest reframing strategies for employment gaps | Turns a weakness into a narrative |
| **Career trajectory predictor** | Predicts realistic next roles and skill gaps using live market data | Turns a resume tool into a career coach |

### V2 Advanced Features
- Real-time salary calibration based on resume strength + location
- GitHub / Dribbble / portfolio integration to link projects to bullets
- Multilingual + cultural adapter (US, German CV, Japanese rirekisho formats)
- Language bias and inclusivity scanner

---

## How It Stands Apart

| Existing Tool | What They Do | What We Do Differently |
|---|---|---|
| **Jobscan** | Keyword match vs JD | Persona analysis + tone scoring + interview predictor |
| **Resume Worded** | Generic tips | Role-specific benchmarking against real top candidates |
| **Rezi.ai** | ATS scoring | Full career intelligence — trajectory, salary, interviews |
| **Enhancv** | Design-focused | Deep content quality analysis, not just layout |
| **Teal HQ** | Job tracking | Resume AI as the primary product, not an afterthought |

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router) — React framework with server components
- **TypeScript** — full type safety across the codebase
- **Tailwind CSS** + **shadcn/ui** — utility-first styling with accessible components
- **Zustand** — lightweight client state management
- **React Query (TanStack)** — server state, caching, background refetching
- **Framer Motion** — animations and page transitions

### Backend
- **FastAPI** (Python) — async REST API with automatic OpenAPI docs
- **Celery** — distributed task queue for long-running AI analysis jobs
- **Redis** — task queue broker + response caching
- **Pydantic v2** — request/response validation and serialization

### AI / ML
- **Anthropic Claude API** — primary LLM for all analysis and generation
- **OpenAI GPT-4o** — optional fallback model
- **LangChain / LangGraph** — LLM orchestration and multi-step pipelines
- **Sentence-Transformers** — embedding resumes for benchmark comparison
- **spaCy + NLTK** — NLP preprocessing, entity extraction, POS tagging

### File Parsing
- **PyMuPDF / pdfplumber** — PDF text extraction with layout awareness
- **python-docx** — Word document parsing
- **unstructured.io** — fallback for complex or non-standard documents
- **Tesseract OCR** — text extraction from scanned / image-based PDFs

### Database & Storage
- **PostgreSQL** — primary relational database
- **Prisma ORM** — type-safe database access
- **pgvector / Pinecone** — vector storage for resume embeddings and benchmarks
- **AWS S3** — file storage for uploaded resumes and generated exports
- **Redis** — session cache and rate limiting

### Auth & Payments
- **Clerk** — authentication with Google and LinkedIn OAuth
- **Stripe** — subscription billing, plan management, usage metering

### DevOps
- **Docker + Docker Compose** — local development and containerized deployment
- **AWS EC2 / RDS / S3** — production infrastructure
- **Vercel** — frontend deployment with edge functions
- **GitHub Actions** — CI/CD pipelines
- **Sentry** — error tracking and performance monitoring
- **PostHog** — product analytics and feature flags

---

## Project Structure

```
resume-analyzer/
│
├── frontend/                          # Next.js 14 application
│   ├── app/
│   │   ├── (auth)/                    # Login, signup, OAuth callbacks
│   │   ├── dashboard/                 # User home, resume history
│   │   ├── analyze/
│   │   │   ├── upload/page.tsx        # Resume upload screen
│   │   │   ├── result/[id]/page.tsx   # Full analysis result
│   │   │   └── compare/page.tsx       # A/B tester
│   │   ├── jd-adapter/                # JD → tailored resume
│   │   ├── career-path/               # Trajectory predictor
│   │   ├── interview-prep/            # Predicted questions
│   │   ├── salary/                    # Salary calibration (V2)
│   │   └── billing/                   # Stripe plan management
│   ├── components/
│   │   ├── analysis/                  # ScoreCard, PersonaView, ToneChart
│   │   ├── resume/                    # ResumeEditor, BulletRewriter
│   │   ├── benchmark/                 # IndustryCompare charts
│   │   └── shared/                    # Button, Badge, Modal, Toast
│   ├── lib/                           # API client, hooks, utilities
│   └── store/                         # Zustand state slices
│
├── backend/                           # FastAPI Python service
│   ├── app/
│   │   ├── routers/
│   │   │   ├── resume.py              # Upload, parse, fetch endpoints
│   │   │   ├── analysis.py            # Trigger and retrieve analysis
│   │   │   ├── jd.py                  # Job description endpoints
│   │   │   ├── career.py              # Trajectory + gap endpoints
│   │   │   ├── benchmark.py           # Industry comparison
│   │   │   └── salary.py              # Salary calibration (V2)
│   │   ├── models/                    # SQLAlchemy database models
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── parser_service.py      # PDF/DOCX → structured JSON
│   │   │   ├── storage_service.py     # S3 upload/download
│   │   │   └── stripe_service.py      # Subscription management
│   │   ├── middleware/                # Auth, rate limiting, CORS
│   │   └── db/                        # Alembic migrations, DB session
│   └── main.py
│
├── ai-engine/                         # All LLM logic (importable module)
│   ├── analyzers/
│   │   ├── ats_analyzer.py            # Keyword match, format check
│   │   ├── persona_analyzer.py        # ATS / HR / HM perspectives
│   │   ├── tone_analyzer.py           # Confidence + passive language
│   │   ├── skill_checker.py           # Skill authenticity validation
│   │   ├── gap_disguiser.py           # Career gap strategy
│   │   └── bias_scanner.py            # Language bias detection (V2)
│   ├── generators/
│   │   ├── bullet_rewriter.py         # Weak bullet → action+metric format
│   │   ├── jd_adapter.py              # Tailored resume per JD
│   │   ├── interview_predictor.py     # Likely recruiter questions
│   │   ├── career_predictor.py        # Next roles + skill gaps
│   │   ├── salary_estimator.py        # Market salary range (V2)
│   │   └── cultural_adapter.py        # Country-specific formats (V2)
│   ├── comparators/
│   │   ├── ab_tester.py               # Version A vs B scoring
│   │   └── benchmark_engine.py        # vs top 10% in industry
│   ├── prompts/                       # Versioned prompt templates
│   ├── embeddings/                    # Vectorize resume sections
│   └── pipeline.py                    # Orchestrates full analysis run
│
├── workers/                           # Celery async task definitions
│   ├── analyze_task.py                # Full AI pipeline (async)
│   ├── benchmark_task.py              # Industry comparison job
│   ├── github_sync_task.py            # Portfolio pull (V2)
│   └── celery_app.py                  # Celery + Redis configuration
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.backend
│   │   └── Dockerfile.worker
│   ├── nginx/                         # Reverse proxy config
│   └── .github/workflows/             # CI/CD pipelines
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18.17.0 or higher
- **Python** 3.11 or higher
- **Docker** and **Docker Compose** v2+
- **Git**

You will also need API keys for:

- [Anthropic Claude](https://console.anthropic.com/) — AI analysis engine
- [Stripe](https://dashboard.stripe.com/) — payment processing
- [Clerk](https://clerk.com/) — authentication
- [AWS](https://aws.amazon.com/) — S3 file storage (or use MinIO locally)
- [Pinecone](https://www.pinecone.io/) — vector database (optional for local dev)

---

### Environment Setup

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/resume-analyzer.git
cd resume-analyzer
```

**2. Copy environment files**

```bash
cp .env.example .env
```

**3. Fill in your `.env` file**

```env
# AI
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...          # Optional fallback

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/resumeai
REDIS_URL=redis://localhost:6379

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=resumeai-uploads
AWS_REGION=us-east-1

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Vector DB
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1-aws

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

---

### Running Locally

**Option A — Docker Compose (recommended)**

This starts everything: frontend, backend, Celery worker, PostgreSQL, and Redis.

```bash
docker-compose up --build
```

Services will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`
- Redis: `localhost:6379`
- PostgreSQL: `localhost:5432`

---

**Option B — Manual setup**

*Backend*

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

*Celery worker (new terminal)*

```bash
cd backend
source venv/bin/activate
celery -A workers.celery_app worker --loglevel=info
```

*Frontend (new terminal)*

```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

All endpoints are documented via Swagger UI at `http://localhost:8000/docs` when running locally.

### Core Endpoints

```
POST   /api/v1/resume/upload          Upload and parse a resume file
GET    /api/v1/resume/{id}            Get parsed resume data
POST   /api/v1/analysis/start         Trigger full AI analysis
GET    /api/v1/analysis/{id}          Get analysis results (poll or WebSocket)
POST   /api/v1/jd/adapt               Generate JD-tailored resume variant
POST   /api/v1/analysis/compare       A/B test two resume versions
GET    /api/v1/career/trajectory      Get career path prediction
GET    /api/v1/benchmark/{role}       Get industry benchmark data
POST   /api/v1/interview/predict      Generate predicted interview questions
```

### Authentication

All endpoints (except public landing data) require a valid Clerk JWT passed as a Bearer token:

```
Authorization: Bearer <clerk_session_token>
```

---

## Feature Deep-Dives

### Persona-Based Analysis

The `persona_analyzer.py` module runs a single resume through three separate LLM prompts, each instructed to evaluate from a different perspective:

- **ATS bot** — looks for keyword density, section headers, file format compatibility, and parseable structure. Reports a pass/fail score and lists exact missing keywords.
- **HR recruiter** — scans for red flags, career gaps, unexplained job hops, and whether the candidate's experience matches the seniority level claimed.
- **Hiring manager** — evaluates whether the work described is credible, whether achievements are quantified, and whether the candidate seems capable of the role's actual responsibilities.

Each persona returns a `stop_reading_at` field — the section or line where that reviewer would likely lose interest.

### Interview Question Predictor

After analysis, every vague bullet or unsupported claim is flagged and passed to `interview_predictor.py`. The LLM is prompted to think like a senior interviewer who has read the resume and wants to probe the weakest points.

Example: a bullet saying "led a cross-functional team to deliver a product" will generate questions like:
- "How large was the team, and how did you handle conflicts between departments?"
- "What was the outcome, and how did you measure success?"
- "What would you do differently if you ran that project again?"

These questions are returned alongside the original bullet, giving the user both the fix *and* the prep material.

### Resume A/B Tester

Users upload two resume versions and optionally paste a job description. The `ab_tester.py` module scores both against the same criteria — ATS compatibility, keyword match, tone confidence, and persona scores — and returns a winner with a reasoning summary explaining exactly what version B does better (or worse) than version A.

---

## Database Schema

### Key Tables

```sql
-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  clerk_id    TEXT UNIQUE NOT NULL,
  plan        TEXT DEFAULT 'free',   -- free | pro | career | team
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Resumes
CREATE TABLE resumes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,
  s3_key      TEXT NOT NULL,
  raw_text    TEXT,
  parsed_json JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Analyses
CREATE TABLE analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id       UUID REFERENCES resumes(id),
  jd_text         TEXT,
  status          TEXT DEFAULT 'pending',  -- pending | processing | done | failed
  results_json    JSONB,
  created_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- Benchmark data (anonymized, for industry comparison)
CREATE TABLE benchmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role        TEXT NOT NULL,
  industry    TEXT NOT NULL,
  embedding   vector(1536),           -- pgvector
  score       FLOAT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- JD adaptations
CREATE TABLE jd_matches (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id           UUID REFERENCES resumes(id),
  jd_text             TEXT NOT NULL,
  adapted_resume_json JSONB,
  match_score         FLOAT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Interview questions
CREATE TABLE interview_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id),
  questions   JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  stripe_id       TEXT UNIQUE,
  plan            TEXT NOT NULL,
  status          TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## Deployment

### Frontend — Vercel

```bash
cd frontend
npx vercel --prod
```

Set all `NEXT_PUBLIC_*` environment variables in the Vercel dashboard.

### Backend — AWS EC2

```bash
# On your EC2 instance
git clone https://github.com/yourusername/resume-analyzer.git
cd resume-analyzer
cp .env.example .env   # fill in production values
docker-compose -f docker-compose.prod.yml up -d
```

### Database — AWS RDS

Provision a PostgreSQL 15 RDS instance. Run migrations:

```bash
DATABASE_URL=postgresql://user:pass@your-rds-endpoint:5432/resumeai alembic upgrade head
```

### CI/CD — GitHub Actions

The `.github/workflows/deploy.yml` pipeline runs on every push to `main`:

1. Run frontend type checks and linting
2. Run backend Python tests (`pytest`)
3. Build and push Docker images to ECR
4. Deploy backend to EC2 via SSH
5. Deploy frontend to Vercel

---

## Roadmap

### Phase 1 — MVP (Weeks 1–8)
- [x] Project setup, auth, database
- [ ] Resume upload and parsing (PDF + DOCX)
- [ ] ATS scoring + section grading
- [ ] Bullet rewriter
- [ ] Tone and confidence analyzer
- [ ] Persona-based analysis (ATS / HR / HM)
- [ ] Stripe billing (free + pro plans)
- [ ] User dashboard

### Phase 2 — Differentiators (Weeks 9–16)
- [ ] One-click JD adapter
- [ ] Interview question predictor
- [ ] Resume A/B tester
- [ ] Skill authenticity checker
- [ ] Career gap advisor
- [ ] Industry benchmark comparison
- [ ] Shareable score cards

### Phase 3 — Career Intelligence (Weeks 17–24)
- [ ] Career trajectory predictor
- [ ] Real-time salary calibration
- [ ] GitHub / portfolio integration
- [ ] LinkedIn OAuth + profile sync
- [ ] Expanded benchmark database

### Phase 4 — V2 Advanced (Month 7+)
- [ ] Multilingual + cultural format adapter
- [ ] Bias and inclusivity language scanner
- [ ] Recruiter / team dashboard (B2B)
- [ ] Bulk resume screening API
- [ ] White-label licensing

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clear, atomic commits
4. Add or update tests as needed
5. Open a pull request with a clear description of what changed and why

### Code Style

- **Frontend**: ESLint + Prettier (config included). Run `npm run lint` before committing.
- **Backend**: Black + isort for Python formatting. Run `black . && isort .` before committing.
- **Commits**: Use conventional commits — `feat:`, `fix:`, `docs:`, `refactor:`, etc.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

Built with [Anthropic Claude](https://anthropic.com), [Next.js](https://nextjs.org), [FastAPI](https://fastapi.tiangolo.com), and a lot of frustration with bad resume advice on the internet.

---

*Have a question or idea? Open an issue or reach out at your@email.com*


# SkillSync
echo "# SkillSync" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Ashwani4545/SkillSync.git
git push -u origin main
