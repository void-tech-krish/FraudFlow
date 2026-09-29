"""
tests/test_week10.py — Week 10: Cost-Aware Decision Optimization
================================================================
Validates:
  - Cost framework functions (FP/FN correctly calculated)
  - Optimization metrics JSON validity
  - Leakage checks
  - Final metrics presence
"""

import json
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from scripts.run_week10 import calculate_expected_cost

def test_calculate_expected_cost_logic():
    y_true = np.array([1, 1, 0, 0, 1])
    y_prob = np.array([0.9, 0.4, 0.6, 0.1, 0.8])
    # T=0.5 -> y_pred = [1, 0, 1, 0, 1]
    # TP: 2 (idx 0, 4)
    # FN: 1 (idx 1, loss = 100)
    # FP: 1 (idx 2)
    # TN: 1 (idx 3)
    loss = np.array([50, 100, 20, 10, 200])
    fp_cost = 5.0
    
    metrics = calculate_expected_cost(y_true, y_prob, loss, threshold=0.5, fp_cost=fp_cost)
    
    assert metrics["tp"] == 2
    assert metrics["fn"] == 1
    assert metrics["fp"] == 1
    assert metrics["tn"] == 1
    assert metrics["cost_fp"] == 5.0
    assert metrics["cost_fn"] == 100.0
    assert metrics["expected_cost"] == 105.0

def test_optimization_metrics_exist():
    assert Path("ml/reports/phase10_optimization_metrics.json").exists()

def test_optimization_metrics_content():
    with open("ml/reports/phase10_optimization_metrics.json", "r") as f:
        metrics = json.load(f)
        
    assert "cost_framework" in metrics
    assert "validation_comparison" in metrics
    assert "selected_model" in metrics
    assert "test_results" in metrics
    assert "leakage_audit" in metrics
    
    assert len(metrics["validation_comparison"]) > 0

def test_leakage_audit_flags():
    with open("ml/reports/phase10_optimization_metrics.json", "r") as f:
        metrics = json.load(f)
        
    la = metrics["leakage_audit"]
    assert la["is_fraud_used_in_features"] is False
    assert la["fraud_loss_amount_used_in_features"] is False
    assert la["test_set_used_for_threshold"] is False

def test_model_comparison_csv():
    assert Path("ml/reports/phase10_model_comparison.csv").exists()
    df = pd.read_csv("ml/reports/phase10_model_comparison.csv")
    assert "Model" in df.columns
    assert "Expected Cost" in df.columns
    assert "Optimal Threshold" in df.columns
