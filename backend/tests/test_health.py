def test_health_check(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
