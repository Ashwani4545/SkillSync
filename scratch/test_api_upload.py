import httpx
import time

def test_upload_and_analysis():
    base_url = "http://127.0.0.1:8000/api/v1"
    
    client = httpx.Client(timeout=60.0)
    
    # 1. Health check
    res_health = client.get(f"{base_url}/health")
    print("Health check response:", res_health.json())

    # 2. Upload test resume (Actual PDF)
    import os
    pdf_path = os.path.abspath("../ResumeAI_Project_Plan.pdf")
    if not os.path.exists(pdf_path):
        pdf_path = os.path.abspath("ResumeAI_Project_Plan.pdf")
    
    with open(pdf_path, "rb") as f:
        test_pdf_content = f.read()
    files = {"file": ("ResumeAI_Project_Plan.pdf", test_pdf_content, "application/pdf")}
    
    res_upload = client.post(f"{base_url}/resume/upload", files=files)
    print("\nUpload response status:", res_upload.status_code)
    upload_data = res_upload.json()
    print("Upload data:", upload_data)
    assert res_upload.status_code == 201, f"Upload failed: {upload_data}"
    
    resume_id = upload_data["id"]

    # 3. Start analysis
    analysis_payload = {
        "resume_id": resume_id,
        "jd_text": "Looking for a Python and FastAPI developer with PostgreSQL experience.",
        "target_role": "Backend Engineer",
        "demanded_skills": "Python, FastAPI, PostgreSQL"
    }
    
    res_start = client.post(f"{base_url}/analysis/start", json=analysis_payload)
    print("\nStart Analysis status:", res_start.status_code)
    start_data = res_start.json()
    print("Start Analysis data:", start_data)
    assert res_start.status_code == 202, f"Start Analysis failed: {start_data}"

    analysis_id = start_data["id"]

    # 4. Poll analysis until done
    for _ in range(10):
        time.sleep(1)
        res_poll = client.get(f"{base_url}/analysis/{analysis_id}")
        poll_data = res_poll.json()
        print(f"Poll status ({poll_data.get('status')}):", poll_data.get("error_msg") or "in progress / done")
        if poll_data.get("status") in ["done", "failed"]:
            break

    print("\nFinal Poll Result Status:", poll_data.get("status"))
    if poll_data.get("status") == "done":
        print("SUCCESS! Results JSON keys:", list((poll_data.get("results_json") or {}).keys()))

if __name__ == "__main__":
    test_upload_and_analysis()
