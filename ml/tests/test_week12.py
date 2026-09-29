"""
tests/test_week12.py — Week 12: Model Monitoring & Drift Detection Tests
========================================================================
Validates:
  - Monitoring metrics generation (PSI, KS Test)
  - Output artifacts (JSON, CSV, Plots)
  - Leakage checks
  - Cost calculations
"""

import json
from pathlib import Path
import pytest
import pandas as pd
import numpy as np

def test_monitoring_artifacts_exist():
    reports_dir = Path("ml/reports/monitoring")
    figures_dir = reports_dir / "figures"
    
    assert (reports_dir / "latest_monitoring_report.json").exists()
    assert (reports_dir / "monitoring_history.jsonl").exists()
    assert (reports_dir / "feature_drift_report.csv").exists()
    assert (figures_dir / "prediction_drift.png").exists()

def test_monitoring_json_content():
    with open("ml/reports/monitoring/latest_monitoring_report.json", "r") as f:
        data = json.load(f)
        
    assert "run_id" in data
    assert "reference_window_size" in data
    assert "current_window_size" in data
    assert "prediction_drift" in data
    assert "performance" in data
    assert "cost" in data
    assert "alerts" in data
    assert "leakage_audit" in data
    
    leakage = data["leakage_audit"]
    assert leakage["is_fraud_excluded"] is True
    assert leakage["fraud_loss_amount_excluded"] is True

def test_drift_csv_content():
    df = pd.read_csv("ml/reports/monitoring/feature_drift_report.csv")
    assert "feature" in df.columns
    assert "psi" in df.columns
    assert "ks_pvalue" in df.columns
    assert "severity" in df.columns
    assert len(df) > 5

def test_psi_calculation():
    from scripts.run_week12 import calculate_psi
    # Identical distributions should have PSI close to 0
    ref = np.random.normal(0, 1, 1000)
    cur = ref
    psi = calculate_psi(ref, cur)
    assert psi < 0.05
    
    # Different distributions should have higher PSI
    cur2 = np.random.normal(2, 1, 1000)
    psi2 = calculate_psi(ref, cur2)
    assert psi2 > 0.5
