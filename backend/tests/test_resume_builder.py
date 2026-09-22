"""
Tests for backend/app/routers/builder.py — create/autosave/export a
from-scratch resume, and the isolation check that a builder resume can
never be read or written by anyone other than its owner (spec section 15).
"""
from app.db.models import Resume, User, PlanEnum


def test_create_builder_resume(client):
    resp = client.post("/api/v1/builder", json={"template": "modern"})
    assert resp.status_code == 201
    body = resp.json()
    assert body["template"] == "modern"
    assert body["parsed_json"]["contact"]["name"] == ""


def test_create_with_unknown_template_rejected(client):
    resp = client.post("/api/v1/builder", json={"template": "not-a-real-template"})
    assert resp.status_code == 400


def test_autosave_persists_and_reads_back(client):
    created = client.post("/api/v1/builder", json={"template": "minimal"}).json()
    resume_id = created["id"]

    draft = {
        "contact": {"name": "Jane Doe", "email": "jane@example.com", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": ""},
        "summary": "Backend engineer.",
        "experience": [{"title": "Engineer", "company": "Acme", "start": "2021", "end": "Present", "bullets": ["Built APIs."]}],
        "projects": [], "skills": ["Python"], "education": [], "certifications": [],
    }
    patch_resp = client.patch(f"/api/v1/builder/{resume_id}", json={"parsed_json": draft, "template": "professional"})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["template"] == "professional"
    assert patch_resp.json()["filename"] == "Jane Doe - Resume"

    fetched = client.get(f"/api/v1/builder/{resume_id}").json()
    assert fetched["parsed_json"]["contact"]["name"] == "Jane Doe"
    assert fetched["parsed_json"]["experience"][0]["title"] == "Engineer"


def test_export_pdf_returns_valid_pdf_bytes(client):
    created = client.post("/api/v1/builder", json={"template": "minimal"}).json()
    resume_id = created["id"]
    draft = {"contact": {"name": "Jane Doe"}, "summary": "", "experience": [], "projects": [], "skills": ["Python"], "education": [], "certifications": []}
    client.patch(f"/api/v1/builder/{resume_id}", json={"parsed_json": draft})

    resp = client.post(f"/api/v1/builder/{resume_id}/export?format=pdf")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content[:4] == b"%PDF"


def test_export_docx_returns_valid_docx_bytes(client):
    created = client.post("/api/v1/builder", json={"template": "minimal"}).json()
    resume_id = created["id"]

    resp = client.post(f"/api/v1/builder/{resume_id}/export?format=docx")
    assert resp.status_code == 200
    assert resp.content[:2] == b"PK"  # docx is a zip container


def test_export_invalid_format_rejected(client):
    created = client.post("/api/v1/builder", json={"template": "minimal"}).json()
    resp = client.post(f"/api/v1/builder/{created['id']}/export?format=txt")
    assert resp.status_code == 400


def test_delete_builder_resume(client):
    created = client.post("/api/v1/builder", json={"template": "minimal"}).json()
    resume_id = created["id"]

    del_resp = client.delete(f"/api/v1/builder/{resume_id}")
    assert del_resp.status_code == 204

    get_resp = client.get(f"/api/v1/builder/{resume_id}")
    assert get_resp.status_code == 404


def test_user_cannot_access_another_users_builder_resume(client, db_session):
    """
    Spec section 15: "A user must never be able to access another user's
    private resume or analysis through a modified ID or API request."
    Creates a second user's builder resume directly in the DB (bypassing
    the authenticated `client` fixture, which is always the test user),
    then confirms the test user's client gets 404, not the other user's data.
    """
    other_user = User(email="other@example.com", clerk_id="user_other_999", plan=PlanEnum.free)
    db_session.add(other_user)
    db_session.commit()
    db_session.refresh(other_user)

    other_resume = Resume(
        user_id=other_user.id,
        filename="Other User's Resume",
        file_type="builder",
        parsed_json={"contact": {"name": "Someone Else"}},
        source="builder",
        template="minimal",
    )
    db_session.add(other_resume)
    db_session.commit()
    db_session.refresh(other_resume)

    # test_user (the authenticated client) tries to read/write/export/delete it
    assert client.get(f"/api/v1/builder/{other_resume.id}").status_code == 404
    assert client.patch(f"/api/v1/builder/{other_resume.id}", json={"parsed_json": {}}).status_code == 404
    assert client.post(f"/api/v1/builder/{other_resume.id}/export?format=pdf").status_code == 404
    assert client.delete(f"/api/v1/builder/{other_resume.id}").status_code == 404


def test_uploaded_resume_not_reachable_via_builder_endpoint(client, db_session, test_user):
    """A resume uploaded via the normal /resume/upload flow (source="uploaded")
    should not be editable through the builder endpoints — different
    lifecycle, different guarantees (an uploaded resume is the user's real
    document; silently letting the builder overwrite it would be a data-loss bug)."""
    uploaded = Resume(
        user_id=test_user.id,
        filename="real_resume.pdf",
        file_type="pdf",
        parsed_json={"contact": {"name": "Test User"}},
        source="uploaded",
    )
    db_session.add(uploaded)
    db_session.commit()
    db_session.refresh(uploaded)

    assert client.get(f"/api/v1/builder/{uploaded.id}").status_code == 404


def test_templates_endpoint_lists_all_templates(client):
    resp = client.get("/api/v1/builder/templates")
    assert resp.status_code == 200
    ids = [t["id"] for t in resp.json()["templates"]]
    assert "minimal" in ids and "modern" in ids and "professional" in ids
