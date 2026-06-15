# Resume Deep Analysis: Ashwani Pandey

This document contains a structured, high-fidelity analysis of the resume **[Ashwani_CV.pdf](file:///e:/going%20on%20works/SkillSync/code/backend/venv/../app/db/models.py)** based on the raw text extracted from the database.

---

## 1. Targeted Role Profiles

This resume is highly versatile and fits into a hybrid space between technical implementation and product/project delivery. It is primarily built for three target profiles:

### Target A: Associate Data Scientist / Product Analyst (Primary Match)
- **Why**: The projects specifically focus on statistical data analysis (70k-user subscription churn), dashboard reporting (Tableau), exploratory data analysis (EDA), and A/B testing frameworks.
- **Alignment**: High. The blend of data manipulation (Pandas, NumPy) and data visualization (Seaborn, Tableau) matches the core competencies of data and product analytics.

### Target B: Junior Machine Learning Engineer / MLOps Developer
- **Why**: Demonstrates model development (XGBoost, LightGBM, Scikit-learn), evaluation (AUC-ROC), model explainability (SHAP), and production deployments (FastAPI, Flask, Docker, MLflow, DVC, Prefect).
- **Alignment**: High. It covers the full lifecycle from raw data parsing to hosting live prediction APIs.

### Target C: Technical Product Manager (AI/Data Products)
- **Why**: Includes Agile/Scrum certifications, Jira workflow knowledge, roadmap definition, and a Coursera Project Management certificate. The bullets highlight translating ML outputs into user/business stories.
- **Alignment**: Medium-to-High. The lack of commercial industry experience is compensated by structured project ownership.

---

## 2. Core Strengths & Value Propositions

> [!NOTE]
> These are the key highlights that will stand out to recruiters and hiring managers.

- **Practical MLOps Tooling**: Mention of MLflow, DVC, and Prefect shows familiarity with modern model lifecycle management, which is rare for fresh graduates.
- **Business-focused Metrics**: The projects are not just code dumps; they describe solving business problems (e.g. *reducing cancellation rates by ~12%*, *cutting credit risk audit time per borrower*).
- **Certified Agile & Project Management Foundation**: Having formal certifications in Agile/Atlassian Jira and Coursera Project Management adds structural credibility.
- **Strong Academic Trajectory**: Consistent academic performance at Lovely Professional University (BCA followed by MCA) maintaining high academic scores (8.00 and 8.08 TGPA).

---

## 3. Gaps and Areas for Improvement

> [!WARNING]
> These issues could lead to the resume being filtered out by ATS systems or rejected by HR.

### A. Lack of Professional Corporate Experience
- **Problem**: There are no company listings or internships in the experience section (which is why the database experience titles are empty). All achievements are listed under "Projects".
- **ATS Impact**: Many corporate ATS parsers look specifically for standard work history tags (e.g. "Software Engineer at [Company]"). A resume containing only projects may get auto-filtered as having 0 years of experience.
- **Fix**: Frame these projects under a structured freelance or professional contract developer header (e.g. "Freelance Data Analyst" or "Independent Developer") to establish a chronological work history.

### B. Missing Core Cloud Infrastructure Exposure
- **Problem**: While FastAPI, Docker, and PostgreSQL are listed, there is no mention of cloud providers (like AWS, GCP, Azure) or infrastructure orchestration.
- **MLOps/Data Eng Impact**: Modern data roles expect models to run in the cloud. Lack of AWS/GCP keywords will filter the resume out for Cloud/ML Engineer positions.
- **Fix**: Integrate any cloud experience (e.g., deploying Flask APIs to AWS EC2, or storing datasets in AWS S3).

### C. Bullet Point Structuring (Action Verbs & Verification)
- **Problem**: Some bullets start with passive terms (e.g., "Analysed financial behaviour data...", "Proposed 3 prioritised feature interventions...").
- **Fix**: Rephrase with strong action verbs (e.g. *Spearheaded*, *Optimized*, *Architected*) and quantify achievements.

---

## 4. Section-by-Section Grades

| Section | Grade | Score | Critical Findings | Actionable Tips |
| --- | --- | --- | --- | --- |
| **Professional Summary** | **F** | 0/100 | **Missing entirely** in the resume text. | Add a 3-line summary at the top outlining your target role, years of project experience, and core technical competencies. |
| **Technical Skills** | **A** | 90/100 | Highly organized and grouped logically by technical layers (ML, MLOps, Data Eng). | Standardize formatting (fix unicode characters like `\uf0b7` which represent bullets that failed to render). |
| **Projects & Experience** | **C** | 70/100 | Good projects with strong technical stacks but lacks corporate structure. | Restructure the Projects section to look like a chronological work timeline. |
| **Education** | **A** | 95/100 | Clear academic history, graduation years, and GPAs included. | Keep as is; clear formatting. |

---

## 5. ATS Keyword Recommendations for Target Roles

### For ML / MLOps Engineer Roles:
- **Missing Keywords to Add**: `AWS`, `SageMaker`, `Kubernetes`, `PyTorch` / `TensorFlow`, `CI/CD` (GitHub Actions).

### For Data / Product Analyst Roles:
- **Missing Keywords to Add**: `Power BI`, `A/B Significance Testing` (Hypothesis testing, z-score), `KPI Metrics`.
