def test_health_check(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["database"] == "ok"  # catches SQLAlchemy 2.0 raw-string-execute regressions
