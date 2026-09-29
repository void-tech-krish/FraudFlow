"""
tests/test_week11.py — Week 11: Explainability Tests
====================================================
Validates:
  - Artifact presence
  - Mathematical SHAP consistency
  - Leakage checks
"""

import json
from pathlib import Path
import pytest
import pandas as pd

def test_explainability_artifacts_exist():
    reports_dir = Path("ml/reports")
    figures_dir = reports_dir / "figures" / "phase11"
    
    assert (reports_dir / "phase11_explainability.json").exists()
    assert (reports_dir / "phase11_global_importance.csv").exists()
    assert (figures_dir / "shap_summary_beeswarm.png").exists()
    assert (figures_dir / "shap_summary_bar.png").exists()

def test_explainability_json_content():
    with open("ml/reports/phase11_explainability.json", "r") as f:
        data = json.load(f)
        
    assert "global_importance_top_10" in data
    assert len(data["global_importance_top_10"]) > 0
    
    assert "local_explanations" in data
    types = [x["type"] for x in data["local_explanations"]]
    assert "high_risk" in types
    assert "low_risk" in types
    assert "borderline" in types
    
    assert data["consistency_check"]["is_consistent"] is True
    
    leakage = data["leakage_audit"]
    assert leakage["is_fraud_excluded"] is True
    assert leakage["fraud_loss_amount_excluded"] is True
    assert leakage["target_used_for_shap"] is False

def test_global_importance_csv():
    df = pd.read_csv("ml/reports/phase11_global_importance.csv")
    assert "feature" in df.columns
    assert "mean_abs_shap" in df.columns
    assert len(df) > 5
    assert not (df["feature"] == "is_fraud").any()
