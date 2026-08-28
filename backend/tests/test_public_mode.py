import pytest
from fastapi.testclient import TestClient
from backend.app.main import app, ip_request_history
from backend.app.config import settings
from backend.app.policy.engine import policy_engine, PolicyMode

client = TestClient(app)

def test_public_mode_policy_allowlist(monkeypatch):
    monkeypatch.setattr(settings, "AGENT_MODE", "public")
    
    # Allowed tools in public mode
    assert policy_engine.evaluate("web_search", "", {}) == PolicyMode.ALLOWED
    assert policy_engine.evaluate("web_extract", "", {}) == PolicyMode.ALLOWED
    assert policy_engine.evaluate("verification", "", {}) == PolicyMode.ALLOWED
    
    # Denied tools in public mode
    assert policy_engine.evaluate("browser_navigate", "", {}) == PolicyMode.DENIED
    assert policy_engine.evaluate("browser_click", "", {}) == PolicyMode.DENIED
    assert policy_engine.evaluate("chrome_cdp", "", {}) == PolicyMode.DENIED
    assert policy_engine.evaluate("filesystem_write", "", {}) == PolicyMode.DENIED
    assert policy_engine.evaluate("shell", "", {}) == PolicyMode.DENIED

def test_public_mode_task_creation_blocks_cdp(monkeypatch):
    monkeypatch.setattr(settings, "AGENT_MODE", "public")
    ip_request_history.clear()
    
    response = client.post("/api/tasks", json={"prompt": "Public research test", "cdp_port": 9222})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "started"
    assert data["mode"] == "public"

def test_public_mode_rate_limiting(monkeypatch):
    monkeypatch.setattr(settings, "AGENT_MODE", "public")
    monkeypatch.setattr(settings, "RATE_LIMIT_REQUESTS_PER_MIN", 2)
    ip_request_history.clear()
    
    # 1st request -> 200
    r1 = client.post("/api/tasks", json={"prompt": "Task 1"})
    assert r1.status_code == 200
    
    # 2nd request -> 200
    r2 = client.post("/api/tasks", json={"prompt": "Task 2"})
    assert r2.status_code == 200
    
    # 3rd request -> 429 Too Many Requests
    r3 = client.post("/api/tasks", json={"prompt": "Task 3"})
    assert r3.status_code == 429
    assert "Rate limit exceeded" in r3.json()["detail"]
