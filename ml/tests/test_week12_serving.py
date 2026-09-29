import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
import pandas as pd
import json
import subprocess

client = TestClient(app)

@pytest.fixture(scope="module")
def sample_payload():
    df = pd.read_csv("ml/data/raw/fraudTest.csv", nrows=1)
    payload = df.iloc[0].fillna("").to_dict()
    if "Unnamed: 0" in payload:
        payload["Unnamed: 0"] = int(payload["Unnamed: 0"])
    return payload

def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["model_loaded"] is True
        assert data["threshold"] == 0.11

def test_predict_endpoint(sample_payload):
    with TestClient(app) as client:
        response = client.post("/predict", json=sample_payload)
        assert response.status_code == 200
        data = response.json()
        assert "fraud_probability" in data
        assert "prediction" in data
        assert "decision" in data
        assert "latency_ms" in data
        assert isinstance(data["latency_ms"], float)
        assert data["decision"] in ["approve", "decline"]
        
        # Ensure probability bounds
        assert 0.0 <= data["fraud_probability"] <= 1.0

def test_invalid_input():
    with TestClient(app) as client:
        response = client.post("/predict", json={"invalid": "payload"})
        assert response.status_code == 422 # Pydantic validation error

def test_retraining_dry_run():
    # Execute the retrain script in dry-run mode
    result = subprocess.run(["python", "ml/scripts/retrain.py", "--dry-run"], capture_output=True, text=True)
    assert result.returncode == 0
    assert "DRY RUN" in result.stdout
    
    # Audit log should be updated
    with open("ml/reports/retraining_audit_log.jsonl", "r") as f:
        lines = f.readlines()
        last_entry = json.loads(lines[-1])
        assert last_entry["dry_run"] is True
        assert last_entry["retraining_started"] is False
        assert last_entry["promotion_decision"] == "DECLINED"
