import pytest
import json
import joblib
from pathlib import Path
from src.preprocessing.pipeline import build_preprocessor

def test_model_exists():
    assert Path("ml/models/decision_tree_week6.joblib").exists()
    model = joblib.load("ml/models/decision_tree_week6.joblib")
    assert type(model).__name__ == "DecisionTreeClassifier"
    assert model.random_state == 42
    assert model.class_weight == "balanced"
    assert model.max_depth == 12

def test_metrics_exist():
    assert Path("ml/reports/phase6_metrics.json").exists()
    with open("ml/reports/phase6_metrics.json") as f:
        metrics = json.load(f)
    assert metrics["pr_auc"] >= 0
    assert metrics["accuracy"] >= 0
    
def test_figures_exist():
    assert Path("ml/reports/figures/phase6/confusion_matrix.png").exists()
    assert Path("ml/reports/figures/phase6/precision_recall_curve.png").exists()
    assert Path("ml/reports/figures/phase6/roc_curve.png").exists()
    assert Path("ml/reports/figures/phase6/feature_importance.png").exists()
    assert Path("ml/reports/figures/phase6/decision_tree_structure.png").exists()

def test_feature_importance_report():
    assert Path("ml/reports/phase6_feature_importance.csv").exists()
