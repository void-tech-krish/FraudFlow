"""
tests/test_week9.py — Week 9: K-Means + DBSCAN + PCA Segmentation
==================================================================
Validates:
  - Model artifacts existence
  - Metrics JSON completeness and validity
  - Segment summary validity
  - Cluster label integrity
  - PCA values validity
  - DBSCAN result validity
  - Leakage checks (is_fraud, fraud_loss_amount not in features)
  - Raw dataset integrity
  - Previous-week artifacts preserved
  - Documentation and notebook existence
"""

import json
import math
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
import pytest


# ─────────────────────────────────────────────────────────────────────────────
# 1. Model artifacts
# ─────────────────────────────────────────────────────────────────────────────

def test_kmeans_artifact_exists():
    """K-Means Week 9 artifact must exist."""
    assert Path("ml/models/kmeans_week9.joblib").exists(), \
        "ml/models/kmeans_week9.joblib not found."


def test_segmentation_scaler_exists():
    """Segmentation scaler must exist."""
    assert Path("ml/models/segmentation_scaler_week9.joblib").exists(), \
        "ml/models/segmentation_scaler_week9.joblib not found."


def test_kmeans_artifact_loadable():
    """K-Means artifact must load and contain required keys."""
    artifact = joblib.load("ml/models/kmeans_week9.joblib")
    assert isinstance(artifact, dict), "K-Means artifact should be a dict."
    for key in ("kmeans", "pca", "features", "selected_k", "n_pca"):
        assert key in artifact, f"K-Means artifact missing key: '{key}'"


def test_kmeans_model_type():
    """Loaded model must be KMeans."""
    artifact = joblib.load("ml/models/kmeans_week9.joblib")
    km = artifact["kmeans"]
    assert type(km).__name__ == "KMeans", \
        f"Expected KMeans, got {type(km).__name__}"


def test_segmentation_scaler_loadable():
    """Segmentation scaler must load as a StandardScaler."""
    scaler = joblib.load("ml/models/segmentation_scaler_week9.joblib")
    assert type(scaler).__name__ == "StandardScaler", \
        f"Expected StandardScaler, got {type(scaler).__name__}"


def test_dbscan_artifact_exists():
    """DBSCAN Week 9 artifact must exist."""
    assert Path("ml/models/dbscan_week9.joblib").exists(), \
        "ml/models/dbscan_week9.joblib not found."


# ─────────────────────────────────────────────────────────────────────────────
# 2. Metrics JSON
# ─────────────────────────────────────────────────────────────────────────────

def test_metrics_file_exists():
    assert Path("ml/reports/phase9_clustering_metrics.json").exists(), \
        "ml/reports/phase9_clustering_metrics.json not found."


def test_metrics_required_keys():
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    for key in ("pca", "kmeans", "dbscan", "leakage_audit"):
        assert key in m, f"Missing top-level key: '{key}'"


def test_metrics_pca_values_valid():
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    pca = m["pca"]
    for k in ("pc1_explained_variance", "pc2_explained_variance", "cumulative_2pc"):
        v = pca[k]
        assert isinstance(v, (int, float)), f"PCA metric '{k}' not numeric."
        assert math.isfinite(v), f"PCA metric '{k}' not finite: {v}"
        assert 0.0 < v <= 1.0, f"PCA metric '{k}' out of (0,1]: {v}"


def test_metrics_pca_cumulative_variance_list():
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    cv = m["pca"]["cumulative_variance"]
    assert isinstance(cv, list) and len(cv) > 0, "cumulative_variance must be non-empty list."
    # Last value should be ~1.0
    assert abs(cv[-1] - 1.0) < 0.01, f"Final cumulative variance should be ~1.0, got {cv[-1]}"


def test_metrics_kmeans_selected_k_valid():
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    k = m["kmeans"]["selected_k"]
    assert isinstance(k, int), f"selected_k must be int, got {type(k)}"
    assert 2 <= k <= 10, f"selected_k out of reasonable range [2,10]: {k}"


def test_metrics_kmeans_silhouette_valid():
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    sil = m["kmeans"]["selected_silhouette"]
    assert isinstance(sil, (int, float)), f"selected_silhouette not numeric."
    assert math.isfinite(sil), f"selected_silhouette not finite: {sil}"
    assert -1.0 <= sil <= 1.0, f"selected_silhouette out of [-1,1]: {sil}"


def test_metrics_kmeans_candidates_consistent():
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    candidates = m["kmeans"]["candidates"]
    assert len(candidates) >= 2, "Must have at least 2 K candidates."
    for c in candidates:
        assert "k" in c and "inertia" in c and "silhouette" in c, \
            f"Candidate missing fields: {c}"
        assert math.isfinite(c["inertia"]), f"inertia not finite: {c['inertia']}"


def test_metrics_dbscan_noise_pct_valid():
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    noise_pct = m["dbscan"]["selected_noise_pct"]
    assert isinstance(noise_pct, (int, float)), "noise_pct not numeric."
    assert 0.0 <= noise_pct <= 1.0, f"noise_pct out of [0,1]: {noise_pct}"


def test_metrics_leakage_audit_flags():
    """Leakage audit flags must confirm no target leakage."""
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    la = m["leakage_audit"]
    assert la["is_fraud_used_for_clustering"] is False, \
        "is_fraud must NOT be used for clustering."
    assert la["fraud_loss_amount_used"] is False, \
        "fraud_loss_amount must NOT be used."
    assert la["test_labels_used_for_fitting"] is False, \
        "Test labels must NOT be used for fitting."
    assert la["week10_threshold_tuning_performed"] is False, \
        "Week 10 threshold tuning must NOT be performed."


# ─────────────────────────────────────────────────────────────────────────────
# 3. Segment summary
# ─────────────────────────────────────────────────────────────────────────────

def test_segment_summary_exists():
    assert Path("ml/reports/phase9_segment_summary.csv").exists(), \
        "ml/reports/phase9_segment_summary.csv not found."


def test_segment_summary_columns():
    df = pd.read_csv("ml/reports/phase9_segment_summary.csv")
    required_cols = {"cluster", "transaction_count", "fraud_count",
                     "fraud_rate", "mean_amt", "median_amt"}
    assert required_cols.issubset(df.columns), \
        f"Missing columns. Found: {df.columns.tolist()}"


def test_segment_summary_nonempty():
    df = pd.read_csv("ml/reports/phase9_segment_summary.csv")
    assert len(df) > 0, "Segment summary CSV is empty."


def test_segment_summary_cluster_count_matches_k():
    """Number of rows must match the selected K."""
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    selected_k = m["kmeans"]["selected_k"]
    df = pd.read_csv("ml/reports/phase9_segment_summary.csv")
    assert len(df) == selected_k, \
        f"Expected {selected_k} cluster rows, got {len(df)}."


def test_segment_summary_fraud_counts_valid():
    df = pd.read_csv("ml/reports/phase9_segment_summary.csv")
    for _, row in df.iterrows():
        assert row["fraud_count"] >= 0, \
            f"Cluster {row['cluster']}: negative fraud_count."
        assert row["fraud_count"] <= row["transaction_count"], \
            f"Cluster {row['cluster']}: fraud_count > transaction_count."


def test_segment_summary_fraud_rates_valid():
    df = pd.read_csv("ml/reports/phase9_segment_summary.csv")
    for _, row in df.iterrows():
        assert 0.0 <= row["fraud_rate"] <= 1.0, \
            f"Cluster {row['cluster']}: fraud_rate out of [0,1]: {row['fraud_rate']}"


def test_segment_summary_transaction_counts_positive():
    df = pd.read_csv("ml/reports/phase9_segment_summary.csv")
    for _, row in df.iterrows():
        assert row["transaction_count"] > 0, \
            f"Cluster {row['cluster']}: transaction_count is 0."


# ─────────────────────────────────────────────────────────────────────────────
# 4. Cluster label integrity
# ─────────────────────────────────────────────────────────────────────────────

def test_kmeans_labels_match_selected_k():
    """Labels in segment summary must span exactly [0, selected_k-1]."""
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    selected_k = m["kmeans"]["selected_k"]
    df = pd.read_csv("ml/reports/phase9_segment_summary.csv")
    observed_labels = set(df["cluster"].astype(int).tolist())
    expected_labels = set(range(selected_k))
    assert observed_labels == expected_labels, \
        f"Cluster labels mismatch. Expected {expected_labels}, got {observed_labels}"


def test_cluster_sizes_sum_to_population():
    """Sum of transaction counts must match the segmentation population size."""
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    pop = m["segmentation_population"]
    df = pd.read_csv("ml/reports/phase9_segment_summary.csv")
    total = int(df["transaction_count"].sum())
    assert total == pop, \
        f"Cluster sizes sum ({total}) != segmentation population ({pop})"


# ─────────────────────────────────────────────────────────────────────────────
# 5. No target leakage in segmentation features
# ─────────────────────────────────────────────────────────────────────────────

def test_no_is_fraud_in_features():
    """is_fraud must NOT be in the segmentation features."""
    artifact = joblib.load("ml/models/kmeans_week9.joblib")
    features = artifact["features"]
    assert "is_fraud" not in features, \
        f"Target 'is_fraud' found in segmentation features: {features}"


def test_no_fraud_loss_amount_in_features():
    """fraud_loss_amount must NOT be in the segmentation features."""
    artifact = joblib.load("ml/models/kmeans_week9.joblib")
    features = artifact["features"]
    assert "fraud_loss_amount" not in features, \
        f"Target proxy 'fraud_loss_amount' found in segmentation features."


# ─────────────────────────────────────────────────────────────────────────────
# 6. Figures
# ─────────────────────────────────────────────────────────────────────────────

def test_pca_variance_plot_exists():
    assert Path("ml/reports/figures/phase9/pca_explained_variance.png").exists()


def test_pca_2d_plot_exists():
    assert Path("ml/reports/figures/phase9/pca_2d.png").exists()


def test_kmeans_elbow_plot_exists():
    assert Path("ml/reports/figures/phase9/kmeans_elbow.png").exists()


def test_kmeans_silhouette_plot_exists():
    assert Path("ml/reports/figures/phase9/kmeans_silhouette.png").exists()


def test_kmeans_pca_clusters_plot_exists():
    assert Path("ml/reports/figures/phase9/kmeans_pca_clusters.png").exists()


def test_dbscan_clusters_plot_exists():
    assert Path("ml/reports/figures/phase9/dbscan_clusters.png").exists()


def test_dbscan_parameter_analysis_plot_exists():
    assert Path("ml/reports/figures/phase9/dbscan_parameter_analysis.png").exists()


# ─────────────────────────────────────────────────────────────────────────────
# 7. Documentation and notebook
# ─────────────────────────────────────────────────────────────────────────────

def test_documentation_exists():
    assert Path("ml/reports/week9_clustering.md").exists(), \
        "ml/reports/week9_clustering.md not found."


def test_documentation_nonempty():
    content = Path("ml/reports/week9_clustering.md").read_text(encoding="utf-8")
    assert len(content) > 500, f"Documentation too short ({len(content)} chars)."


def test_documentation_mentions_leakage():
    content = Path("ml/reports/week9_clustering.md").read_text(encoding="utf-8")
    assert "leakage" in content.lower(), "Documentation must include leakage audit."


def test_documentation_mentions_is_fraud_excluded():
    content = Path("ml/reports/week9_clustering.md").read_text(encoding="utf-8")
    assert "is_fraud" in content, \
        "Documentation must mention is_fraud and its exclusion from clustering."


def test_notebook_exists():
    assert Path("ml/notebooks/09_clustering_segmentation.ipynb").exists(), \
        "ml/notebooks/09_clustering_segmentation.ipynb not found."


def test_notebook_is_valid_json():
    import json as _json
    content = Path("ml/notebooks/09_clustering_segmentation.ipynb").read_text(encoding="utf-8")
    nb = _json.loads(content)
    assert "cells" in nb and len(nb["cells"]) > 0, \
        "Notebook must have cells."


# ─────────────────────────────────────────────────────────────────────────────
# 8. DBSCAN results validity
# ─────────────────────────────────────────────────────────────────────────────

def test_dbscan_candidates_have_required_fields():
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    for c in m["dbscan"]["candidates"]:
        for field in ("eps", "min_samples", "n_clusters", "n_noise", "noise_pct"):
            assert field in c, f"DBSCAN candidate missing field '{field}': {c}"


def test_dbscan_noise_pct_per_candidate():
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    for c in m["dbscan"]["candidates"]:
        assert 0.0 <= c["noise_pct"] <= 1.0, \
            f"DBSCAN noise_pct out of [0,1]: {c['noise_pct']}"


def test_dbscan_silhouette_valid_when_present():
    """When DBSCAN silhouette is not None, it must be in [-1, 1]."""
    with open("ml/reports/phase9_clustering_metrics.json", encoding="utf-8") as f:
        m = json.load(f)
    sil = m["dbscan"]["selected_silhouette"]
    if sil is not None:
        assert math.isfinite(sil), f"DBSCAN silhouette not finite: {sil}"
        assert -1.0 <= sil <= 1.0, f"DBSCAN silhouette out of [-1,1]: {sil}"


# ─────────────────────────────────────────────────────────────────────────────
# 9. Raw dataset integrity
# ─────────────────────────────────────────────────────────────────────────────

def test_raw_dataset_unchanged():
    df = pd.read_csv("ml/data/raw/fraudTest.csv")
    assert df.shape == (555719, 23), \
        f"Raw dataset modified! Expected (555719, 23), got {df.shape}"


# ─────────────────────────────────────────────────────────────────────────────
# 10. Previous-week artifacts preserved
# ─────────────────────────────────────────────────────────────────────────────

def test_week8_artifact_preserved():
    assert Path("ml/models/xgboost_week8.joblib").exists(), \
        "Week 8 artifact models/xgboost_week8.joblib missing."


def test_week7_artifact_preserved():
    assert Path("ml/models/random_forest_week7.joblib").exists(), \
        "Week 7 artifact missing."


def test_week8_metrics_preserved():
    assert Path("ml/reports/phase8_metrics.json").exists(), \
        "Week 8 metrics report missing."


def test_week8_xgboost_not_modified():
    """Week 8 XGBoost model must not have been retrained/replaced."""
    artifact = joblib.load("ml/models/xgboost_week8.joblib")
    assert "model" in artifact, "Week 8 artifact structure changed."
    assert type(artifact["model"]).__name__ == "XGBClassifier", \
        "Week 8 model type changed."
