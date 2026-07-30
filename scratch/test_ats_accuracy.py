import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_engine.pipeline import run_full_pipeline

def test_ats_analysis():
    print("=== Test 1: Full Resume with LinkedIn, GitHub, FastAPI, C++, Docker ===")
    sample_resume_1 = {
        "contact": {
            "name": "Jane Developer",
            "email": "jane@example.com",
            "phone": "+1-555-0199",
            "location": "San Francisco, CA",
            "linkedin": "linkedin.com/in/janedev",
            "github": "github.com/janedev"
        },
        "summary": "Senior Software Engineer with 6 years of experience building high performance microservices with C++, Python, and FastAPI.",
        "skills": ["C++", "Python", "FastAPI", "Docker", "PostgreSQL", "Git", "CI/CD"],
        "experience": [
            {
                "title": "Senior Backend Engineer",
                "company": "Tech Innovations",
                "start": "2021",
                "end": "Present",
                "bullets": [
                    "Architected high-throughput microservices using C++ and FastAPI, processing 50k requests/sec.",
                    "Set up CI/CD pipelines and deployed containerized services using Docker and PostgreSQL."
                ]
            }
        ],
        "projects": [
            {
                "name": "Distributed Cache",
                "description": "High speed memory cache written in C++ with Python bindings.",
                "bullets": ["Optimized memory allocation, reducing latency by 40%."]
            }
        ],
        "education": [
            {"degree": "B.S.", "field": "Computer Science", "institution": "UC Berkeley", "gpa": "3.8", "start": "2015", "end": "2019"}
        ],
        "certifications": ["AWS Certified Solutions Architect"]
    }

    jd_text = """
    Looking for a Senior Backend Engineer with strong expertise in C++, Python, FastAPI, Docker, and PostgreSQL.
    Experience with Redis, Kubernetes, and CI/CD pipelines is a huge plus.
    """

    res1 = run_full_pipeline(sample_resume_1, jd_text=jd_text, user_plan="pro", target_role="Backend Engineer", demanded_skills="C++, Python, FastAPI")

    print("\n--- ATS RESULT 1 ---")
    ats1 = res1.get("ats", {})
    print("Score:", ats1.get("score"))
    print("Pass:", ats1.get("pass"))
    print("Format Issues:", ats1.get("format_issues"))
    print("Found Keywords:", ats1.get("found_keywords"))
    print("Missing Keywords:", ats1.get("missing_keywords"))
    print("Improvements:", ats1.get("improvements"))
    print("Keyword Density:", ats1.get("keyword_density"))

    assert "Missing LinkedIn profile link in header." not in ats1.get("format_issues", []), "False LinkedIn warning present!"
    assert "Missing GitHub or portfolio link in header." not in ats1.get("format_issues", []), "False GitHub warning present!"

    print("\n=== Test 2: Minimal Resume without JD ===")
    sample_resume_2 = {
        "contact": {
            "name": "John Smith",
            "email": "john@example.com",
            "phone": "555-1234"
        },
        "skills": ["JavaScript", "HTML", "CSS"],
        "experience": [
            {
                "title": "Frontend Developer",
                "company": "Web Agency",
                "bullets": ["Built responsive web pages using HTML, CSS, and JavaScript."]
            }
        ]
    }

    res2 = run_full_pipeline(sample_resume_2, jd_text=None, user_plan="free", target_role="Frontend Engineer")

    print("\n--- ATS RESULT 2 ---")
    ats2 = res2.get("ats", {})
    print("Score:", ats2.get("score"))
    print("Format Issues:", ats2.get("format_issues"))
    print("Found Keywords:", ats2.get("found_keywords"))
    print("Missing Keywords:", ats2.get("missing_keywords"))
    print("Improvements:", ats2.get("improvements"))

    print("\nAll ATS checks passed successfully!")

if __name__ == "__main__":
    test_ats_analysis()
