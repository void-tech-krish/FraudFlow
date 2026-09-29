"""
tests/test_week8.py — Week 8: XGBoost + Early Stopping + SHAP
==============================================================
Validates:
  - Model artifact existence and loadability
  - Metrics report existence and correctness
  - Metric ranges and finiteness
  - scale_pos_weight calculation validity
  - Early stopping best iteration
  - SHAP importance file and values
  - Documentation existence
  - Notebook existence
  - Raw dataset integrity
  - No target leakage
  - Previous-week artifacts preserved
"""

import json
import math
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
import pytest


# ─────────────────────────────────────────────────────────────────────────────
# 1. Model artifact
# ─────────────────────────────────────────────────────────────────────────────

def test_model_artifact_exists():
    """XGBoost Week 8 model artifact must exist."""
    assert Path("ml/models/xgboost_week8.joblib").exists(), \
        "ml/models/xgboost_week8.joblib not found."


def test_model_artifact_loads():
    """Artifact must load without error and contain expected keys."""
    artifact = joblib.load("ml/models/xgboost_week8.joblib")
    assert artifact is not None, "Artifact is None."
    assert isinstance(artifact, dict), "Artifact must be a dict."
    for key in ("model", "preprocessor", "feature_names"):
        assert key in artifact, f"Artifact missing key: '{key}'"


def test_model_type_is_xgboost():
    """Loaded model must be XGBClassifier."""
    artifact = joblib.load("ml/models/xgboost_week8.joblib")
    model = artifact["model"]
    assert type(model).__name__ == "XGBClassifier", \
        f"Expected XGBClassifier, got {type(model).__name__}"


def test_model_objective():
    """XGBoost must use binary:logistic objective."""
    artifact = joblib.load("ml/models/xgboost_week8.joblib")
    model = artifact["model"]
    params = model.get_params()
    assert params.get("objective") == "binary:logistic", \
        f"Expected objective='binary:logistic', got {params.get('objective')}"


def test_model_random_state():
    """XGBoost random_state must be 42."""
    artifact = joblib.load("ml/models/xgboost_week8.joblib")
    model = artifact["model"]
    params = model.get_params()
    assert params.get("random_state") == 42, \
        f"Expected random_state=42, got {params.get('random_state')}"


def test_feature_names_are_meaningful():
    """Feature names must not be generic placeholders like 'feature_0'."""
    artifact = joblib.load("ml/models/xgboost_week8.joblib")
    feature_names = artifact["feature_names"]
    assert len(feature_names) > 0, "feature_names is empty."
    # Ensure we don't have simple 'feature_N' placeholders from pipeline without names
    generic = [f for f in feature_names if f.startswith("feature_") and f[8:].isdigit()]
    assert len(generic) == 0, \
        f"Found {len(generic)} generic feature names (e.g. {generic[:3]}). " \
        "Pipeline must expose meaningful names."


# ─────────────────────────────────────────────────────────────────────────────
# 2. Metrics report
# ─────────────────────────────────────────────────────────────────────────────

def test_metrics_file_exists():
    """phase8_metrics.json must exist."""
    assert Path("ml/reports/phase8_metrics.json").exists(), \
        "ml/reports/phase8_metrics.json not found."


def test_metrics_required_keys():
    """Metrics report must contain all required fields."""
    with open("ml/reports/phase8_metrics.json") as f:
        m = json.load(f)
    required = [
        "model", "threshold", "accuracy", "precision", "recall",
        "f1", "pr_auc", "roc_auc",
        "best_iteration", "best_validation_pr_auc", "scale_pos_weight",
    ]
    for key in required:
        assert key in m, f"Missing key in phase8_metrics.json: '{key}'"


def test_metrics_threshold_is_0_5():
    """Threshold must be exactly 0.5 — no threshold tuning."""
    with open("ml/reports/phase8_metrics.json") as f:
        m = json.load(f)
    assert m["threshold"] == 0.5, \
        f"Expected threshold=0.5, got {m['threshold']}"


def test_metrics_model_name():
    """Model name must be 'XGBoost'."""
    with open("ml/reports/phase8_metrics.json") as f:
        m = json.load(f)
    assert m["model"] == "XGBoost", \
        f"Expected model='XGBoost', got {m['model']}"


def test_metrics_are_finite():
    """All key numeric metrics must be finite (not NaN or Inf)."""
    with open("ml/reports/phase8_metrics.json") as f:
        m = json.load(f)
    keys = ["accuracy", "precision", "recall", "f1", "pr_auc", "roc_auc"]
    for k in keys:
        v = m[k]
        assert isinstance(v, (int, float)), f"Metric '{k}' is not numeric: {v}"
        assert math.isfinite(v), f"Metric '{k}' is not finite: {v}"


def test_metrics_in_valid_range():
    """All key metrics must be in [0.0, 1.0]."""
    with open("ml/reports/phase8_metrics.json") as f:
        m = json.load(f)
    keys = ["accuracy", "precision", "recall", "f1", "pr_auc", "roc_auc"]
    for k in keys:
        v = m[k]
        assert 0.0 <= v <= 1.0, f"Metric '{k}' out of [0,1]: {v}"


def test_scale_pos_weight_is_positive():
    """scale_pos_weight must be a positive finite number."""
    with open("ml/reports/phase8_metrics.json") as f:
        m = json.load(f)
    spw = m["scale_pos_weight"]
    assert isinstance(spw, (int, float)), f"scale_pos_weight is not numeric: {spw}"
    assert math.isfinite(spw), f"scale_pos_weight is not finite: {spw}"
    assert spw > 0, f"scale_pos_weight must be positive, got {spw}"


def test_best_iteration_is_valid():
    """best_iteration must be a non-negative integer."""
    with open("ml/reports/phase8_metrics.json") as f:
        m = json.load(f)
    bi = m["best_iteration"]
    assert isinstance(bi, int), f"best_iteration should be int, got {type(bi)}"
    assert bi >= 0, f"best_iteration must be >= 0, got {bi}"


def test_best_validation_pr_auc_is_valid():
    """best_validation_pr_auc must be finite and in [0, 1]."""
    with open("ml/reports/phase8_metrics.json") as f:
        m = json.load(f)
    bv = m["best_validation_pr_auc"]
    assert isinstance(bv, (int, float)), f"best_validation_pr_auc is not numeric."
    assert math.isfinite(bv), f"best_validation_pr_auc is not finite: {bv}"
    assert 0.0 <= bv <= 1.0, f"best_validation_pr_auc out of [0,1]: {bv}"


def test_pr_auc_above_naive_baseline():
    """PR-AUC must substantially exceed naive baseline (fraud prevalence)."""
    with open("ml/reports/phase8_metrics.json") as f:
        m = json.load(f)
    fraud_prevalence = m["test_fraud_count"] / m["test_samples"]
    pr_auc = m["pr_auc"]
    # XGBoost should be much better than random (~fraud_prevalence)
    assert pr_auc > fraud_prevalence * 5, \
        f"PR-AUC={pr_auc:.4f} is not much better than naive baseline {fraud_prevalence:.4f}"


# ─────────────────────────────────────────────────────────────────────────────
# 3. SHAP importance artifact
# ─────────────────────────────────────────────────────────────────────────────

def test_shap_importance_file_exists():
    """SHAP importance CSV must exist."""
    assert Path("ml/reports/phase8_shap_importance.csv").exists(), \
        "ml/reports/phase8_shap_importance.csv not found."


def test_shap_importance_columns():
    """SHAP importance CSV must have 'feature' and 'mean_abs_shap' columns."""
    df = pd.read_csv("ml/reports/phase8_shap_importance.csv")
    assert "feature" in df.columns, "Missing 'feature' column in SHAP importance CSV."
    assert "mean_abs_shap" in df.columns, "Missing 'mean_abs_shap' column in SHAP importance CSV."


def test_shap_importance_nonempty():
    """SHAP importance CSV must have at least one row."""
    df = pd.read_csv("ml/reports/phase8_shap_importance.csv")
    assert len(df) > 0, "SHAP importance CSV is empty."


def test_shap_importance_values_are_valid():
    """mean_abs_shap values must be finite and non-negative."""
    df = pd.read_csv("ml/reports/phase8_shap_importance.csv")
    for i, row in df.iterrows():
        v = row["mean_abs_shap"]
        assert math.isfinite(float(v)), \
            f"mean_abs_shap at row {i} is not finite: {v}"
        assert float(v) >= 0.0, \
            f"mean_abs_shap at row {i} is negative: {v}"


def test_shap_feature_names_not_generic():
    """SHAP features should use meaningful names, not 'feature_N'."""
    df = pd.read_csv("ml/reports/phase8_shap_importance.csv")
    generic = [f for f in df["feature"].tolist()
               if str(f).startswith("feature_") and str(f)[8:].isdigit()]
    assert len(generic) == 0, \
        f"Found generic feature names in SHAP CSV: {generic[:5]}"


# ─────────────────────────────────────────────────────────────────────────────
# 4. Figures
# ─────────────────────────────────────────────────────────────────────────────

def test_confusion_matrix_figure_exists():
    assert Path("ml/reports/figures/phase8/confusion_matrix.png").exists(), \
        "ml/reports/figures/phase8/confusion_matrix.png not found."


def test_pr_curve_figure_exists():
    assert Path("ml/reports/figures/phase8/precision_recall_curve.png").exists(), \
        "ml/reports/figures/phase8/precision_recall_curve.png not found."


def test_roc_curve_figure_exists():
    assert Path("ml/reports/figures/phase8/roc_curve.png").exists(), \
        "ml/reports/figures/phase8/roc_curve.png not found."


def test_model_comparison_figure_exists():
    assert Path("ml/reports/figures/phase8/model_comparison.png").exists(), \
        "ml/reports/figures/phase8/model_comparison.png not found."


def test_shap_summary_figure_exists():
    assert Path("ml/reports/figures/phase8/shap_summary.png").exists(), \
        "ml/reports/figures/phase8/shap_summary.png not found."


def test_shap_bar_figure_exists():
    assert Path("ml/reports/figures/phase8/shap_bar.png").exists(), \
        "ml/reports/figures/phase8/shap_bar.png not found."


# ─────────────────────────────────────────────────────────────────────────────
# 5. Model comparison CSV
# ─────────────────────────────────────────────────────────────────────────────

def test_model_comparison_csv_exists():
    assert Path("ml/reports/phase8_model_comparison.csv").exists(), \
        "ml/reports/phase8_model_comparison.csv not found."


def test_model_comparison_csv_columns():
    df = pd.read_csv("ml/reports/phase8_model_comparison.csv")
    required_cols = {"model", "precision", "recall", "f1", "pr_auc", "roc_auc"}
    assert required_cols.issubset(df.columns), \
        f"Comparison CSV missing columns. Found: {df.columns.tolist()}"


def test_model_comparison_contains_xgboost():
    df = pd.read_csv("ml/reports/phase8_model_comparison.csv")
    assert any("XGBoost" in str(m) for m in df["model"].tolist()), \
        "Model comparison CSV must include XGBoost row."


# ─────────────────────────────────────────────────────────────────────────────
# 6. Documentation
# ─────────────────────────────────────────────────────────────────────────────

def test_documentation_exists():
    assert Path("ml/reports/week8_xgboost_shap.md").exists(), \
        "ml/reports/week8_xgboost_shap.md not found."


def test_documentation_nonempty():
    content = Path("ml/reports/week8_xgboost_shap.md").read_text(encoding="utf-8")
    assert len(content) > 500, \
        f"Documentation file is suspiciously short ({len(content)} chars)."


def test_documentation_mentions_fraud_loss_amount():
    """Documentation must note that fraud_loss_amount is NOT an input feature."""
    content = Path("ml/reports/week8_xgboost_shap.md").read_text(encoding="utf-8")
    assert "fraud_loss_amount" in content, \
        "Documentation must mention 'fraud_loss_amount' and its exclusion."


def test_documentation_mentions_leakage_checks():
    """Documentation must include a leakage section."""
    content = Path("ml/reports/week8_xgboost_shap.md").read_text(encoding="utf-8")
    assert "leakage" in content.lower(), \
        "Documentation must include a leakage check section."


# ─────────────────────────────────────────────────────────────────────────────
# 7. Notebook
# ─────────────────────────────────────────────────────────────────────────────

def test_notebook_exists():
    assert Path("ml/notebooks/08_xgboost_shap.ipynb").exists(), \
        "ml/notebooks/08_xgboost_shap.ipynb not found."


def test_notebook_is_valid_json():
    """Notebook file must be valid JSON (nbformat)."""
    import json as _json
    content = Path("ml/notebooks/08_xgboost_shap.ipynb").read_text(encoding="utf-8")
    nb = _json.loads(content)
    assert "cells" in nb, "Notebook must have 'cells' key."
    assert len(nb["cells"]) > 0, "Notebook must have at least one cell."


# ─────────────────────────────────────────────────────────────────────────────
# 8. Raw dataset integrity
# ─────────────────────────────────────────────────────────────────────────────

def test_raw_dataset_unchanged():
    """Raw dataset shape must remain (555719, 23)."""
    df = pd.read_csv("ml/data/raw/fraudTest.csv")
    assert df.shape == (555719, 23), \
        f"Raw dataset modified! Expected shape (555719, 23), got {df.shape}"


def test_raw_dataset_is_fraud_column_present():
    """Raw dataset must still have the is_fraud column."""
    df = pd.read_csv("ml/data/raw/fraudTest.csv", nrows=5)
    assert "is_fraud" in df.columns, \
        "Raw dataset must still have 'is_fraud' column."


# ─────────────────────────────────────────────────────────────────────────────
# 9. Leakage checks
# ─────────────────────────────────────────────────────────────────────────────

def test_no_target_in_feature_names():
    """'is_fraud' must NOT appear in transformed feature names."""
    artifact = joblib.load("ml/models/xgboost_week8.joblib")
    feature_names = artifact["feature_names"]
    fraud_features = [f for f in feature_names if "is_fraud" in f.lower()]
    assert len(fraud_features) == 0, \
        f"Target 'is_fraud' found in features: {fraud_features}"


def test_no_fraud_loss_amount_in_feature_names():
    """'fraud_loss_amount' must NOT appear in transformed feature names."""
    artifact = joblib.load("ml/models/xgboost_week8.joblib")
    feature_names = artifact["feature_names"]
    proxy_features = [f for f in feature_names if "fraud_loss_amount" in f.lower()]
    assert len(proxy_features) == 0, \
        f"Target proxy 'fraud_loss_amount' found in features: {proxy_features}"


def test_scale_pos_weight_computed_from_training_data_only():
    """
    scale_pos_weight is computed from internal_train_neg / internal_train_pos.
    Both values must be consistent with the expected train-only counts.
    """
    with open("ml/reports/phase8_metrics.json") as f:
        m = json.load(f)
    neg = m.get("internal_train_neg")
    pos = m.get("internal_train_pos")
    spw = m.get("scale_pos_weight")
    assert neg is not None and pos is not None, \
        "Metrics must record internal_train_neg and internal_train_pos."
    assert pos > 0, "Internal training positive count must be > 0."
    expected = neg / pos
    assert abs(expected - spw) < 1e-6, \
        f"scale_pos_weight mismatch: expected {expected:.6f}, got {spw:.6f}"


# ─────────────────────────────────────────────────────────────────────────────
# 10. Previous-week artifacts preserved
# ─────────────────────────────────────────────────────────────────────────────

def test_week7_artifact_preserved():
    assert Path("ml/models/random_forest_week7.joblib").exists(), \
        "Week 7 artifact models/random_forest_week7.joblib missing."


def test_week6_artifact_preserved():
    assert Path("ml/models/decision_tree_week6.joblib").exists(), \
        "Week 6 artifact models/decision_tree_week6.joblib missing."


def test_week7_metrics_preserved():
    assert Path("ml/reports/phase7_metrics.json").exists(), \
        "Week 7 metrics reports/phase7_metrics.json missing."


def test_week6_metrics_preserved():
    assert Path("ml/reports/phase6_metrics.json").exists(), \
        "Week 6 metrics reports/phase6_metrics.json missing."
