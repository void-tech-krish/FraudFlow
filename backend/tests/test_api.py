import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "model_loaded" in data

def test_analytics():
    response = client.get("/analytics")
    assert response.status_code in (200, 404)

def test_explainability():
    response = client.get("/explainability")
    assert response.status_code in (200, 404)

def test_monitoring():
    response = client.get("/monitoring")
    assert response.status_code in (200, 404)

def test_predict_invalid():
    response = client.post("/predict", json={})
    assert response.status_code == 422
