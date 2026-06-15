import os, sys
from datetime import datetime

# Setup paths
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set env
os.environ["ENVIRONMENT"] = "development"
os.environ["DATABASE_URL"] = "postgresql://postgres:Ashwani%404545@localhost:5432/resumeai"

from app.db.session import SessionLocal
from app.db.models import User, Resume, Analysis, PlanEnum, AnalysisStatusEnum
from workers.analyze_task import run_analysis

def run_test():
    db = SessionLocal()
    try:
        # 1. Get or create test user
        user = db.query(User).filter(User.email == "test@example.com").first()
        if not user:
            user = User(
                email="test@example.com",
                clerk_id="user_test_123",
                plan=PlanEnum.free
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # 2. Get or create test resume
        resume = db.query(Resume).filter(Resume.user_id == user.id).first()
        if not resume:
            resume = Resume(
                user_id=user.id,
                filename="test_resume.pdf",
                file_type="pdf",
                s3_key="resumes/test_resume.pdf",
                file_size=1024,
                parsed_json={
                    "personal_info": {"name": "John Doe", "email": "john@example.com"},
                    "education": [{"degree": "B.S. Computer Science", "school": "State University"}],
                    "experience": [{"role": "Software Engineer", "company": "Tech Corp", "description": "Developed web applications."}],
                    "skills": ["python", "javascript", "fastapi"]
                }
            )
            db.add(resume)
            db.commit()
            db.refresh(resume)

        # 3. Create analysis
        analysis = Analysis(
            resume_id=resume.id,
            jd_text="Looking for a Python and FastAPI developer with javascript experience.",
            status=AnalysisStatusEnum.pending
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        print(f"Created pending analysis: {analysis.id}")

        # 4. Run analysis task
        print("Running run_analysis task...")
        run_analysis(
            analysis_id=str(analysis.id),
            resume_json=resume.parsed_json,
            jd_text=analysis.jd_text,
            user_plan=user.plan.value
        )

        # 5. Check results
        db.refresh(analysis)
        print(f"Analysis status after run: {analysis.status}")
        if analysis.status == AnalysisStatusEnum.done:
            print("SUCCESS! Results JSON keys:")
            print(list(analysis.results_json.keys()))
        else:
            print("FAILED! Error message:", analysis.error_msg)

    except Exception as e:
        print("Exception during test:", e)
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    run_test()
