"""
run_week12.py — Week 12: Model Monitoring & Drift Detection
===========================================================
Implements:
  1. Reference vs Current window extraction (Historical replay mode)
  2. Data Quality Checks
  3. Feature Drift Detection (K-S test, PSI approximation)
  4. Prediction Drift
  5. Performance & Cost Monitoring (Labeled mode)
  6. Alerting Engine
  7. History Persistence & Report Generation
"""

import json
import joblib
import numpy as np
import pandas as pd
import datetime
from pathlib import Path
from scipy.stats import ks_2samp
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import average_precision_score, precision_score, recall_score, f1_score, confusion_matrix

from src.preprocessing.feature_engineering import engineer_features

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────
CONFIG = {
    "reference_sample_size": 20000,
    "current_sample_size": 20000,
    "random_state": 42,
    "threshold": 0.11,
    "fp_cost": 5.0,
    "drift": {
        "p_value_threshold": 0.05,
        "psi_warning_threshold": 0.1,
        "psi_critical_threshold": 0.2
    },
    "alerts": {
        "pr_auc_degradation_warning": 0.05,  # 5% absolute drop
        "cost_increase_warning": 0.2         # 20% relative increase in cost per transaction
    },
    "output_dir": "reports/monitoring",
    "history_file": "reports/monitoring/monitoring_history.jsonl"
}

MODELS_DIR = Path("models")
OUTPUT_DIR = Path(CONFIG["output_dir"])
FIGURES_DIR = OUTPUT_DIR / "figures"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
FIGURES_DIR.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# UTILITIES
# ─────────────────────────────────────────────────────────────────────────────
def calculate_psi(expected, actual, bins=10):
    """Calculate Population Stability Index (PSI) for numeric features."""
    expected = np.array(expected)
    actual = np.array(actual)
    
    # Avoid zero variance issues
    if len(np.unique(expected)) <= 1 or len(np.unique(actual)) <= 1:
        return 0.0
        
    breakpoints = np.linspace(np.min(expected), np.max(expected), bins + 1)
    # Ensure breakpoints cover all data
    breakpoints[0] = -np.inf
    breakpoints[-1] = np.inf
    
    expected_percents = np.histogram(expected, breakpoints)[0] / len(expected)
    actual_percents = np.histogram(actual, breakpoints)[0] / len(actual)
    
    # Replace 0 with small value to avoid division by zero or log(0)
    expected_percents = np.where(expected_percents == 0, 0.0001, expected_percents)
    actual_percents = np.where(actual_percents == 0, 0.0001, actual_percents)
    
    psi = np.sum((actual_percents - expected_percents) * np.log(actual_percents / expected_percents))
    return float(psi)

def calculate_expected_cost(y_true, y_prob, loss_amounts, threshold, fp_cost):
    y_pred = (y_prob >= threshold).astype(int)
    fp_mask = (y_pred == 1) & (y_true == 0)
    fn_mask = (y_pred == 0) & (y_true == 1)
    
    cost_fp = fp_mask.sum() * fp_cost
    cost_fn = loss_amounts[fn_mask].sum()
    
    return {
        "cost_fp": float(cost_fp),
        "cost_fn": float(cost_fn),
        "total_cost": float(cost_fp + cost_fn),
        "fp_count": int(fp_mask.sum()),
        "fn_count": int(fn_mask.sum())
    }

class AlertEngine:
    def __init__(self):
        self.alerts = []
        
    def add(self, category, severity, rule, observed, expected, evidence=""):
        self.alerts.append({
            "alert_id": f"ALT-{len(self.alerts)+1}-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
            "category": category,
            "severity": severity,
            "rule": rule,
            "observed_value": observed,
            "configured_threshold": expected,
            "evidence": evidence,
            "timestamp": datetime.datetime.now().isoformat()
        })
        
    def get_alerts(self):
        return self.alerts

# ─────────────────────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────────────────────
def run_week12():
    print("=" * 65)
    print("WEEK 12: Model Monitoring & Drift Detection")
    print("=" * 65)
    
    alerts = AlertEngine()
    run_id = f"RUN-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"

    # 1. Load Data (Demonstration Mode)
    print("[1/10] Loading Data (Historical Demonstration Mode)...")
    df_raw = pd.read_csv("data/raw/fraudTest.csv")
    df = engineer_features(df_raw)
    
    # We construct Reference (Train) and Current (Test) windows to demonstrate monitoring
    y = df["is_fraud"]
    loss_amount = df["fraud_loss_amount"] if "fraud_loss_amount" in df.columns else df["amt"]
    cols_to_drop = ["is_fraud"]
    if "fraud_loss_amount" in df.columns:
        cols_to_drop.append("fraud_loss_amount")
    X = df.drop(columns=cols_to_drop, errors="ignore")
    
    X_train, X_test, y_train, y_test, loss_train, loss_test = train_test_split(
        X, y, loss_amount, test_size=0.2, stratify=y, random_state=CONFIG["random_state"]
    )
    
    # Sample to configurable sizes
    np.random.seed(CONFIG["random_state"])
    train_idx = np.random.choice(len(y_train), min(CONFIG["reference_sample_size"], len(y_train)), replace=False)
    test_idx = np.random.choice(len(y_test), min(CONFIG["current_sample_size"], len(y_test)), replace=False)
    
    df_ref = X_train.iloc[train_idx].copy()
    y_ref = y_train.iloc[train_idx].values
    loss_ref = loss_train.iloc[train_idx].values
    
    df_cur = X_test.iloc[test_idx].copy()
    y_cur = y_test.iloc[test_idx].values
    loss_cur = loss_test.iloc[test_idx].values
    
    # 2. Data Quality Checks
    print("[2/10] Executing Data Quality Checks...")
    dq_results = []
    
    missing_cols = set(df_ref.columns) - set(df_cur.columns)
    if missing_cols:
        alerts.add("DATA_QUALITY", "CRITICAL", "missing_required_columns", list(missing_cols), "[]", "Missing in current window")
        
    for col in df_cur.columns:
        null_pct = df_cur[col].isnull().mean()
        dq_results.append({"column": col, "null_percentage": float(null_pct)})
        if null_pct > 0.1:
            alerts.add("DATA_QUALITY", "WARNING", f"high_null_rate_{col}", float(null_pct), 0.1, f"{col} has {null_pct:.1%} missing")
            
    # 3. Load Model & Preprocess
    print("[3/10] Loading Frozen Model and Preprocessing...")
    xgb_artifact = joblib.load(MODELS_DIR / "xgboost_week8.joblib")
    model = xgb_artifact["model"]
    preprocessor = xgb_artifact["preprocessor"]
    feature_names = xgb_artifact.get("feature_names", [])
    
    X_ref_proc = preprocessor.transform(df_ref)
    X_cur_proc = preprocessor.transform(df_cur)
    
    if hasattr(X_ref_proc, "toarray"):
        X_ref_proc = X_ref_proc.toarray().astype("float32")
        X_cur_proc = X_cur_proc.toarray().astype("float32")
        
    if not feature_names:
        num_cols = preprocessor.transformers_[0][2]
        cat_enc  = preprocessor.named_transformers_["cat"]
        cat_cols = preprocessor.transformers_[1][2]
        cat_names = cat_enc.get_feature_names_out(cat_cols)
        feature_names = list(num_cols) + list(cat_names)
        feature_names = [f.replace("[", "(").replace("]", ")").replace("<", "lt_") for f in feature_names]

    # 4. Feature Drift Analysis
    print("[4/10] Analyzing Feature Drift...")
    drift_results = []
    
    for i, feature in enumerate(feature_names):
        ref_vals = X_ref_proc[:, i]
        cur_vals = X_cur_proc[:, i]
        
        # KS Test
        stat, p_value = ks_2samp(ref_vals, cur_vals)
        # PSI
        psi = calculate_psi(ref_vals, cur_vals)
        
        severity = "INFO"
        if psi > CONFIG["drift"]["psi_critical_threshold"] and p_value < CONFIG["drift"]["p_value_threshold"]:
            severity = "CRITICAL"
            alerts.add("FEATURE_DRIFT", "CRITICAL", f"drift_{feature}", psi, CONFIG["drift"]["psi_critical_threshold"])
        elif psi > CONFIG["drift"]["psi_warning_threshold"]:
            severity = "WARNING"
            alerts.add("FEATURE_DRIFT", "WARNING", f"drift_{feature}", psi, CONFIG["drift"]["psi_warning_threshold"])
            
        drift_results.append({
            "feature": feature,
            "psi": psi,
            "ks_pvalue": p_value,
            "severity": severity
        })
        
    df_drift = pd.DataFrame(drift_results)
    df_drift.to_csv(OUTPUT_DIR / "feature_drift_report.csv", index=False)
    
    # 5. Prediction Drift
    print("[5/10] Analyzing Prediction Drift...")
    prob_ref = model.predict_proba(X_ref_proc)[:, 1]
    prob_cur = model.predict_proba(X_cur_proc)[:, 1]
    
    pred_stat, pred_pvalue = ks_2samp(prob_ref, prob_cur)
    if pred_pvalue < CONFIG["drift"]["p_value_threshold"]:
        alerts.add("PREDICTION_DRIFT", "WARNING", "prediction_distribution_changed", pred_pvalue, CONFIG["drift"]["p_value_threshold"])
        
    # Plot Prediction Drift
    plt.figure(figsize=(8, 5))
    plt.hist(prob_ref, bins=50, alpha=0.5, label='Reference', density=True)
    plt.hist(prob_cur, bins=50, alpha=0.5, label='Current', density=True)
    plt.title('Prediction Probability Distribution Drift')
    plt.legend()
    plt.savefig(FIGURES_DIR / "prediction_drift.png")
    plt.close()

    # 6. Performance Monitoring (Labeled Mode)
    print("[6/10] Labeled Performance Monitoring...")
    # Reference metrics
    ref_pred = (prob_ref >= CONFIG["threshold"]).astype(int)
    ref_prauc = average_precision_score(y_ref, prob_ref)
    
    # Current metrics
    cur_pred = (prob_cur >= CONFIG["threshold"]).astype(int)
    cur_prauc = average_precision_score(y_cur, prob_cur)
    cur_precision = precision_score(y_cur, cur_pred, zero_division=0)
    cur_recall = recall_score(y_cur, cur_pred, zero_division=0)
    cur_f1 = f1_score(y_cur, cur_pred, zero_division=0)
    
    if cur_prauc < ref_prauc - CONFIG["alerts"]["pr_auc_degradation_warning"]:
        alerts.add("PERFORMANCE_DEGRADATION", "CRITICAL", "pr_auc_drop", float(cur_prauc), float(ref_prauc))
        
    perf_summary = {
        "labeled_transactions": len(y_cur),
        "fraud_prevalence": float(np.mean(y_cur)),
        "pr_auc": float(cur_prauc),
        "precision": float(cur_precision),
        "recall": float(cur_recall),
        "f1": float(cur_f1)
    }

    # 7. Monetary Cost Monitoring
    print("[7/10] Monetary Cost Monitoring...")
    ref_cost = calculate_expected_cost(y_ref, prob_ref, loss_ref, CONFIG["threshold"], CONFIG["fp_cost"])
    cur_cost = calculate_expected_cost(y_cur, prob_cur, loss_cur, CONFIG["threshold"], CONFIG["fp_cost"])
    
    ref_cost_per_tx = ref_cost["total_cost"] / len(y_ref)
    cur_cost_per_tx = cur_cost["total_cost"] / len(y_cur)
    
    if cur_cost_per_tx > ref_cost_per_tx * (1 + CONFIG["alerts"]["cost_increase_warning"]):
        alerts.add("COST_INCREASE", "WARNING", "cost_per_tx_increased", cur_cost_per_tx, ref_cost_per_tx)

    # 8. Persistence & Reports
    print("[8/10] Persisting Monitoring Run...")
    
    report = {
        "run_id": run_id,
        "timestamp": datetime.datetime.now().isoformat(),
        "mode": "historical_replay_demonstration",
        "reference_window_size": len(df_ref),
        "current_window_size": len(df_cur),
        "prediction_drift": {
            "ks_pvalue": float(pred_pvalue),
            "ref_mean_prob": float(np.mean(prob_ref)),
            "cur_mean_prob": float(np.mean(prob_cur)),
        },
        "performance": perf_summary,
        "cost": {
            **cur_cost,
            "cost_per_tx": cur_cost_per_tx
        },
        "alerts": alerts.get_alerts(),
        "leakage_audit": {
            "is_fraud_excluded": "is_fraud" not in feature_names,
            "fraud_loss_amount_excluded": "fraud_loss_amount" not in feature_names
        }
    }
    
    with open(OUTPUT_DIR / "latest_monitoring_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=4)
        
    with open(CONFIG["history_file"], "a", encoding="utf-8") as f:
        f.write(json.dumps(report) + "\n")
        
    # Console Summary
    print("\n" + "=" * 40)
    print(f"Monitoring Run Summary: {run_id}")
    print("=" * 40)
    print(f"Current Window Size: {len(df_cur)}")
    print(f"Alerts Triggered:    {len(alerts.get_alerts())}")
    for a in alerts.get_alerts():
        print(f"  [{a['severity']}] {a['category']}: {a['rule']}")
    print(f"PR-AUC:              {cur_prauc:.4f}")
    print(f"Total Cost:          ${cur_cost['total_cost']:,.2f}")
    print("=" * 40)
    print("Week 12 COMPLETE")

if __name__ == "__main__":
    run_week12()
