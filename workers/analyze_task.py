"""
analyze_task.py
The main async Celery task. Runs the full AI analysis pipeline:
  1. ATS scorer
  2. Section grader
  3. Tone & confidence analyzer
  4. Persona analyzer (ATS bot / HR recruiter / Hiring manager)
  5. Bullet rewriter suggestions
  6. Skill authenticity checker
  7. Interview question predictor
Results are saved to the analyses table when complete.
"""
from datetime import datetime
from workers.celery_app import celery_app

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def run_analysis(self, analysis_id: str, resume_json: dict, jd_text: str | None, user_plan: str):
    from app.db.session import SessionLocal
    from app.db.models import Analysis, AnalysisStatusEnum
    from ai_engine.pipeline import run_full_pipeline

    db = SessionLocal()
    try:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            return

        analysis.status = AnalysisStatusEnum.processing
        db.commit()

        # Run the full AI pipeline
        results = run_full_pipeline(
            resume_json=resume_json,
            jd_text=jd_text,
            user_plan=user_plan,
        )

        analysis.results_json = results
        analysis.status = AnalysisStatusEnum.done
        analysis.completed_at = datetime.utcnow()
        db.commit()

    except Exception as exc:
        db.rollback()
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if analysis:
            analysis.status = AnalysisStatusEnum.failed
            analysis.error_msg = str(exc)
            db.commit()
        raise self.retry(exc=exc)
    finally:
        db.close()
