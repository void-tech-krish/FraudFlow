"""
run_week11.py — Week 11: Model Explainability & Fraud Decision Insights
=======================================================================
Implements:
  1. SHAP global feature importance on XGBoost model.
  2. Local explainability (High-risk, Low-risk, Borderline).
  3. Mathematical consistency check of SHAP values.
  4. Feature direction analysis.
  5. Artifact generation.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import shap
from pathlib import Path
from sklearn.model_selection import train_test_split
from scipy.special import expit, logit

from src.preprocessing.feature_engineering import engineer_features

# ─────────────────────────────────────────────────────────────────────────────
# Constants & Config
# ─────────────────────────────────────────────────────────────────────────────
RANDOM_STATE = 42
SHAP_SAMPLE_SIZE = 5000

REPORTS_DIR = Path("reports")
FIGURES_DIR = REPORTS_DIR / "figures" / "phase11"
MODELS_DIR = Path("models")

FIGURES_DIR.mkdir(parents=True, exist_ok=True)


def run_week11():
    print("=" * 65)
    print("WEEK 11: Model Explainability & Fraud Decision Insights")
    print("=" * 65)

    # ── 1. Load Week 10 Config ───────────────────────────────────────────────
    print("[1/10] Loading Week 10 threshold...")
    metrics_path = REPORTS_DIR / "phase10_optimization_metrics.json"
    with open(metrics_path, "r") as f:
        w10 = json.load(f)
    threshold = w10["selected_model"]["optimal_threshold"]
    print(f"  Using production threshold: {threshold}")

    # ── 2. Load Models & Data ────────────────────────────────────────────────
    print("[2/10] Loading existing XGBoost model...")
    xgb_artifact = joblib.load(MODELS_DIR / "xgboost_week8.joblib")
    model = xgb_artifact["model"]
    preprocessor = xgb_artifact["preprocessor"]
    feature_names = xgb_artifact.get("feature_names", None)
    
    if not feature_names:
        # Fallback if feature names weren't explicitly saved
        num_cols = preprocessor.transformers_[0][2]
        cat_enc  = preprocessor.named_transformers_["cat"]
        cat_cols = preprocessor.transformers_[1][2]
        cat_names = cat_enc.get_feature_names_out(cat_cols)
        feature_names = list(num_cols) + list(cat_names)
        feature_names = [f.replace("[", "(").replace("]", ")").replace("<", "lt_") for f in feature_names]

    print("[3/10] Loading data & replicating split...")
    df_raw = pd.read_csv("data/raw/fraudTest.csv")
    df = engineer_features(df_raw)
    
    y = df["is_fraud"]
    cols_to_drop = ["is_fraud"]
    if "fraud_loss_amount" in df.columns:
        cols_to_drop.append("fraud_loss_amount")
    X = df.drop(columns=cols_to_drop, errors="ignore")
    
    # We use the final untouched test set for explainability since optimization is frozen.
    X_train_full, X_test, y_train_full, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
    )

    print("[4/10] Preprocessing and sampling for SHAP...")
    X_test_proc = preprocessor.transform(X_test)
    if hasattr(X_test_proc, "toarray"):
        X_test_proc = X_test_proc.toarray().astype("float32")
        
    np.random.seed(RANDOM_STATE)
    sample_idx = np.random.choice(len(y_test), min(SHAP_SAMPLE_SIZE, len(y_test)), replace=False)
    
    X_shap = X_test_proc[sample_idx]
    y_shap = y_test.iloc[sample_idx].values
    
    df_shap = pd.DataFrame(X_shap, columns=feature_names)

    # ── 3. SHAP Explainer ────────────────────────────────────────────────────
    print("[5/10] Calculating SHAP values (TreeExplainer)...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(df_shap)
    # TreeExplainer on XGBoost returns margin (log-odds) by default.
    base_value = explainer.expected_value
    if isinstance(base_value, np.ndarray):
        base_value = base_value[0]
        
    print(f"  Base value (log-odds): {base_value:.4f}")

    # ── 4. Global Feature Importance ─────────────────────────────────────────
    print("[6/10] Generating Global Explanations...")
    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    mean_shap = shap_values.mean(axis=0)
    
    global_df = pd.DataFrame({
        "feature": feature_names,
        "mean_abs_shap": mean_abs_shap,
        "mean_shap": mean_shap
    }).sort_values("mean_abs_shap", ascending=False).reset_index(drop=True)
    global_df["rank"] = global_df.index + 1
    
    global_df.to_csv(REPORTS_DIR / "phase11_global_importance.csv", index=False)
    
    # Plot Summary
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, df_shap, show=False)
    plt.savefig(FIGURES_DIR / "shap_summary_beeswarm.png", bbox_inches="tight", dpi=150)
    plt.close()
    
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, df_shap, plot_type="bar", show=False)
    plt.savefig(FIGURES_DIR / "shap_summary_bar.png", bbox_inches="tight", dpi=150)
    plt.close()

    # ── 5. SHAP Consistency Check ────────────────────────────────────────────
    print("[7/10] Verifying SHAP Consistency...")
    # XGBoost outputs log-odds via output_margin=True
    margins = model.predict(X_shap, output_margin=True)
    calculated_margins = base_value + shap_values.sum(axis=1)
    
    max_diff = np.abs(margins - calculated_margins).max()
    is_consistent = bool(max_diff < 1e-4)
    print(f"  Max margin difference: {max_diff:.2e} (Consistent: {is_consistent})")

    # ── 6. Local Explanations ────────────────────────────────────────────────
    print("[8/10] Generating Local Explanations...")
    # Calculate probabilities
    probs = expit(margins)
    
    # High-Risk Example
    high_idx = np.argmax(probs)
    # Low-Risk Example
    low_idx = np.argmin(probs)
    # Borderline Example
    margin_diff = np.abs(probs - threshold)
    border_idx = np.argmin(margin_diff)
    
    def extract_local(idx, label):
        row_shap = shap_values[idx]
        sorted_idx = np.argsort(np.abs(row_shap))[::-1]
        
        top_positive = []
        top_negative = []
        for i in sorted_idx:
            if row_shap[i] > 0 and len(top_positive) < 3:
                top_positive.append({"feature": feature_names[i], "contribution": float(row_shap[i])})
            elif row_shap[i] < 0 and len(top_negative) < 3:
                top_negative.append({"feature": feature_names[i], "contribution": float(row_shap[i])})
                
        return {
            "type": label,
            "transaction_index": int(sample_idx[idx]),
            "predicted_probability": float(probs[idx]),
            "threshold": threshold,
            "decision": int(probs[idx] >= threshold),
            "base_value_log_odds": float(base_value),
            "margin_log_odds": float(margins[idx]),
            "top_positive_contributors": top_positive,
            "top_negative_contributors": top_negative
        }

    local_explanations = [
        extract_local(high_idx, "high_risk"),
        extract_local(low_idx, "low_risk"),
        extract_local(border_idx, "borderline")
    ]
    
    borderline_distance = float(margin_diff[border_idx])
    
    # ── 7. Generate Artifacts ────────────────────────────────────────────────
    print("[9/10] Saving Artifacts...")
    
    report = {
        "week": 11,
        "explainability_method": "SHAP (TreeExplainer)",
        "sample_size": SHAP_SAMPLE_SIZE,
        "global_importance_top_10": global_df.head(10).to_dict(orient="records"),
        "local_explanations": local_explanations,
        "borderline_analysis": {
            "transaction_index": int(sample_idx[border_idx]),
            "distance_from_threshold": borderline_distance,
            "definition": "minimum absolute difference from probability threshold"
        },
        "consistency_check": {
            "output_space": "log-odds (margin)",
            "tolerance": 1e-4,
            "max_difference": float(max_diff),
            "is_consistent": is_consistent
        },
        "leakage_audit": {
            "is_fraud_excluded": "is_fraud" not in feature_names,
            "fraud_loss_amount_excluded": "fraud_loss_amount" not in feature_names,
            "target_used_for_shap": False
        }
    }
    
    with open(REPORTS_DIR / "phase11_explainability.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=4)
        
    print("  Saved: reports/phase11_explainability.json")
    print("  Saved: reports/phase11_global_importance.csv")
    
    print("\n" + "=" * 65)
    print("Week 11 COMPLETE")
    print("=" * 65)

if __name__ == "__main__":
    run_week11()
