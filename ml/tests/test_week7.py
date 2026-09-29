"""
Week 7 Tests: Random Forest, OOB & Permutation Importance
Tests validate all required artifacts, metrics, and model configuration.
"""
import json
import math
import pandas as pd
import joblib
from pathlib import Path


# ──────────────────────────────────────────────────
# 1. Model artifact exists and is loadable
# ──────────────────────────────────────────────────
def test_model_artifact_exists():
    assert Path("ml/models/random_forest_week7.joblib").exists(), \
        "Random Forest artifact models/random_forest_week7.joblib not found."


def test_model_artifact_loads():
    model = joblib.load("ml/models/random_forest_week7.joblib")
    assert model is not None, "Failed to load model artifact."


# ──────────────────────────────────────────────────
# 2. Correct model type and configuration
# ──────────────────────────────────────────────────
def test_model_type():
    model = joblib.load("ml/models/random_forest_week7.joblib")
    assert type(model).__name__ == "RandomForestClassifier", \
        f"Expected RandomForestClassifier, got {type(model).__name__}"


def test_model_random_state():
    model = joblib.load("ml/models/random_forest_week7.joblib")
    assert model.random_state == 42, f"Expected random_state=42, got {model.random_state}"


def test_model_n_estimators():
    model = joblib.load("ml/models/random_forest_week7.joblib")
    assert model.n_estimators == 150, f"Expected n_estimators=150, got {model.n_estimators}"


def test_model_class_weight():
    model = joblib.load("ml/models/random_forest_week7.joblib")
    assert model.class_weight == "balanced", \
        f"Expected class_weight='balanced', got {model.class_weight}"


def test_model_oob_score_enabled():
    model = joblib.load("ml/models/random_forest_week7.joblib")
    assert model.oob_score is True, "Expected oob_score=True"


# ──────────────────────────────────────────────────
# 3. OOB score actually computed
# ──────────────────────────────────────────────────
def test_model_oob_score_attribute():
    model = joblib.load("ml/models/random_forest_week7.joblib")
    assert hasattr(model, "oob_score_"), "Model has no oob_score_ attribute (was it trained?)"
    assert 0.0 <= model.oob_score_ <= 1.0, \
        f"oob_score_ out of range: {model.oob_score_}"


# ──────────────────────────────────────────────────
# 4. Metrics JSON exists and is complete
# ──────────────────────────────────────────────────
def test_metrics_file_exists():
    assert Path("ml/reports/phase7_metrics.json").exists(), \
        "ml/reports/phase7_metrics.json not found."


def test_metrics_required_keys():
    with open("ml/reports/phase7_metrics.json") as f:
        metrics = json.load(f)
    required_keys = [
        "oob_accuracy", "oob_pr_auc", "oob_roc_auc",
        "test_accuracy", "test_precision", "test_recall",
        "test_f1", "test_pr_auc", "test_roc_auc",
    ]
    for key in required_keys:
        assert key in metrics, f"Missing key in phase7_metrics.json: {key}"


def test_metrics_are_finite():
    with open("ml/reports/phase7_metrics.json") as f:
        metrics = json.load(f)
    numeric_keys = [
        "oob_accuracy", "oob_pr_auc", "oob_roc_auc",
        "test_accuracy", "test_precision", "test_recall",
        "test_f1", "test_pr_auc", "test_roc_auc",
    ]
    for key in numeric_keys:
        val = metrics[key]
        assert math.isfinite(val), f"Metric {key} is not finite: {val}"
        assert 0.0 <= val <= 1.0, f"Metric {key} out of [0,1] range: {val}"


# ──────────────────────────────────────────────────
# 5. Permutation importance artifact
# ──────────────────────────────────────────────────
def test_permutation_importance_csv_exists():
    assert Path("ml/reports/phase7_permutation_importance.csv").exists(), \
        "ml/reports/phase7_permutation_importance.csv not found."


def test_permutation_importance_csv_columns():
    df = pd.read_csv("ml/reports/phase7_permutation_importance.csv")
    required_cols = {"feature", "importance_mean", "importance_std"}
    assert required_cols.issubset(df.columns), \
        f"Missing columns in permutation importance CSV. Found: {df.columns.tolist()}"


def test_permutation_importance_csv_nonempty():
    df = pd.read_csv("ml/reports/phase7_permutation_importance.csv")
    assert len(df) > 0, "Permutation importance CSV is empty."


def test_permutation_importance_plot_exists():
    assert Path("ml/reports/figures/phase7/permutation_importance.png").exists(), \
        "ml/reports/figures/phase7/permutation_importance.png not found."


# ──────────────────────────────────────────────────
# 6. Feature importance (impurity) artifact
# ──────────────────────────────────────────────────
def test_feature_importance_csv_exists():
    assert Path("ml/reports/phase7_feature_importance.csv").exists(), \
        "ml/reports/phase7_feature_importance.csv not found."


def test_feature_importance_csv_columns():
    df = pd.read_csv("ml/reports/phase7_feature_importance.csv")
    required_cols = {"feature", "importance"}
    assert required_cols.issubset(df.columns), \
        f"Missing columns in feature importance CSV. Found: {df.columns.tolist()}"


def test_feature_importance_csv_nonempty():
    df = pd.read_csv("ml/reports/phase7_feature_importance.csv")
    assert len(df) > 0, "Feature importance CSV is empty."


def test_feature_importance_plot_exists():
    assert Path("ml/reports/figures/phase7/feature_importance.png").exists(), \
        "ml/reports/figures/phase7/feature_importance.png not found."


# ──────────────────────────────────────────────────
# 7. Required visualizations
# ──────────────────────────────────────────────────
def test_confusion_matrix_plot_exists():
    assert Path("ml/reports/figures/phase7/confusion_matrix.png").exists()


def test_precision_recall_curve_plot_exists():
    assert Path("ml/reports/figures/phase7/precision_recall_curve.png").exists()


def test_roc_curve_plot_exists():
    assert Path("ml/reports/figures/phase7/roc_curve.png").exists()


def test_oob_vs_test_plot_exists():
    assert Path("ml/reports/figures/phase7/oob_vs_test_metrics.png").exists()


# ──────────────────────────────────────────────────
# 8. Raw dataset integrity
# ──────────────────────────────────────────────────
def test_raw_dataset_unchanged():
    df = pd.read_csv("ml/data/raw/fraudTest.csv")
    assert df.shape == (555719, 23), \
        f"Raw dataset shape changed! Expected (555719, 23), got {df.shape}"


# ──────────────────────────────────────────────────
# 9. Week 6 artifact still intact
# ──────────────────────────────────────────────────
def test_week6_artifact_preserved():
    assert Path("ml/models/decision_tree_week6.joblib").exists(), \
        "Week 6 artifact models/decision_tree_week6.joblib missing."

