"""
End-to-end test through the real FastAPI routes: upload -> start analysis ->
poll to completion. Adapted from the manual script that used to live at
scratch/test_api_upload.py, converted to a real pytest test using TestClient
instead of a live server + httpx.

Runs entirely against the mock LLM (USE_MOCK_LLM=true) and local-disk storage
fallback (no S3/Redis required) — see conftest.py.
"""
import io
import time

MINIMAL_PDF_TEXT = """John Doe
john.doe@example.com | 555-123-4567 | Austin, TX
linkedin.com/in/johndoe | github.com/johndoe

SUMMARY
Backend engineer with 5 years of experience in Python and FastAPI.

EXPERIENCE
Senior Backend Engineer | Acme Corp | 2021 - Present
- Built and scaled REST APIs serving 1M+ requests/day.

SKILLS
Python, FastAPI, PostgreSQL, Docker

EDUCATION
B.S. Computer Science, State University, 2016 - 2020
"""


def _make_fake_pdf_bytes(text: str) -> bytes:
    """
    A tiny hand-built single-page PDF containing `text`, good enough for
    parser_service.parse_pdf() (PyMuPDF/pdfplumber) to extract text from
    without needing a real PDF-generation library as a test dependency.
    """
    content_stream = f"BT /F1 12 Tf 50 750 Td ({text.splitlines()[0]}) Tj ET"
    pdf = f"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length {len(content_stream)}>>stream
{content_stream}
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
trailer<</Size 6/Root 1 0 R>>
startxref
0
%%EOF"""
    return pdf.encode("latin-1")


def test_upload_start_analysis_and_poll(client):
    # 1. Health check
    health = client.get("/api/v1/health")
    assert health.status_code == 200

    # 2. Upload a resume
    fake_pdf = _make_fake_pdf_bytes(MINIMAL_PDF_TEXT)
    files = {"file": ("resume.pdf", io.BytesIO(fake_pdf), "application/pdf")}
    upload_resp = client.post("/api/v1/resume/upload", files=files)
    assert upload_resp.status_code == 201, upload_resp.text
    resume_id = upload_resp.json()["id"]

    # 3. Start analysis
    start_resp = client.post(
        "/api/v1/analysis/start",
        json={
            "resume_id": resume_id,
            "jd_text": "Looking for a Python and FastAPI backend developer.",
            "target_role": "Backend Engineer",
            "demanded_skills": "Python, FastAPI",
        },
    )
    assert start_resp.status_code == 202, start_resp.text
    analysis_id = start_resp.json()["id"]

    # 4. Poll until done (the in-process thread fallback in analysis.py
    #    runs synchronously-ish since there's no real Redis in tests)
    final_status = None
    for _ in range(20):
        poll = client.get(f"/api/v1/analysis/{analysis_id}")
        assert poll.status_code == 200
        final_status = poll.json()["status"]
        if final_status in ("done", "failed"):
            break
        time.sleep(0.25)

    assert final_status == "done", f"Analysis did not complete: {final_status}"
