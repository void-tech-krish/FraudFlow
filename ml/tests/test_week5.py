import pytest
import pandas as pd
import json
from pathlib import Path
from src.preprocessing.feature_engineering import engineer_features

def test_stratified_kfold_results():
    assert Path("ml/reports/phase5_cv_results.csv").exists()
    df = pd.read_csv("ml/reports/phase5_cv_results.csv")
    assert len(df) == 18 # 6 models * 3 folds

def test_honest_baseline_exists():
    assert Path("ml/reports/phase5_honest_baseline.json").exists()
    with open("ml/reports/phase5_honest_baseline.json") as f:
        data = json.load(f)
    assert 'Fraud Prevalence' in data
    assert data['Precision'] == 0.0

def test_one_se_selection():
    assert Path("ml/reports/phase5_model_selection.json").exists()
    with open("ml/reports/phase5_model_selection.json") as f:
        sel = json.load(f)
    assert 'best_mean_prauc' in sel
    assert 'one_se_threshold' in sel
    assert sel['selected_model'] in sel['qualifying_models']

def test_dt_depth_results():
    assert Path("ml/reports/phase5_decision_tree_cv.csv").exists()
    df = pd.read_csv("ml/reports/phase5_decision_tree_cv.csv")
    assert len(df) == 3 # Depth 6, 9, 12
