import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import settings

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["version"] == settings.VERSION
    assert "documentation" in data

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == settings.VERSION
    assert "service" in data

def test_diagnostics_endpoint():
    response = client.get("/api/diagnostics")
    assert response.status_code == 200
    data = response.json()
    assert data["version"] == settings.VERSION
    assert "environment" in data
    assert "providers" in data
    assert data["environment"]["python_version"] is not None

def test_provider_settings_endpoint():
    response = client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()
    assert "gemini" in data
    assert "configured" in data["gemini"]
    # Ensure raw API key is never exposed in response
    assert "GEMINI_API_KEY" not in data
