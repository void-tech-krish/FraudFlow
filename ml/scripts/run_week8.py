"""
run_week8.py — Week 8: XGBoost + Early Stopping + SHAP Explainability
=======================================================================
Implements:
  1. Canonical 80/20 stratified train/test split (random_state=42)
  2. Preprocessing fitted only on training data
  3. Internal stratified validation split (20% of training data) for early stopping
  4. XGBClassifier with scale_pos_weight, early stopping on aucpr
  5. Final evaluation on the untouched test set (threshold=0.5)
  6. SHAP TreeExplainer on a reproducible 5,000-row sample
  7. Model comparison: LR, Balanced LR, Decision Tree, Random Forest, XGBoost
  8. All artifacts saved to models/, reports/, reports/figures/phase8/
"""

import json
import math
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for saving figures
import matplotlib.pyplot as plt
import seaborn as sns
import shap
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    precision_score, recall_score, f1_score,
    average_precision_score, roc_auc_score, accuracy_score,
    confusion_matrix, precision_recall_curve, roc_curve,
)
from xgboost import XGBClassifier

from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import build_preprocessor

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def eval_clf(y_true, y_prob, y_pred=None, threshold=0.5):
    """Return classification metrics dict using the supplied threshold."""
    if y_pred is None:
        y_pred = (y_prob >= threshold).astype(int)
    return {
        "accuracy":  float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall":    float(recall_score(y_true, y_pred, zero_division=0)),
        "f1":        float(f1_score(y_true, y_pred, zero_division=0)),
        "pr_auc":    float(average_precision_score(y_true, y_prob)),
        "roc_auc":   float(roc_auc_score(y_true, y_prob)),
    }


def save_confusion_matrix(y_true, y_pred, title, path):
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax,
                xticklabels=["Legit", "Fraud"],
                yticklabels=["Legit", "Fraud"])
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title(title)
    plt.tight_layout()
    path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(path, bbox_inches="tight", dpi=150)
    plt.close(fig)


def save_pr_curve(y_true, y_prob, label, pr_auc, path):
    precision, recall, _ = precision_recall_curve(y_true, y_prob)
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.plot(recall, precision, lw=2, label=f"{label} (AP={pr_auc:.4f})")
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.set_title("Precision-Recall Curve — XGBoost (Week 8)")
    ax.legend()
    ax.grid(True, linestyle="--", alpha=0.5)
    plt.tight_layout()
    path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(path, bbox_inches="tight", dpi=150)
    plt.close(fig)


def save_roc_curve(y_true, y_prob, label, roc_auc, path):
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.plot(fpr, tpr, lw=2, label=f"{label} (AUC={roc_auc:.4f})")
    ax.plot([0, 1], [0, 1], "k--", lw=1)
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curve — XGBoost (Week 8)")
    ax.legend()
    ax.grid(True, linestyle="--", alpha=0.5)
    plt.tight_layout()
    path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(path, bbox_inches="tight", dpi=150)
    plt.close(fig)


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def run_week8():
    RANDOM_STATE = 42
    THRESHOLD = 0.5
    SHAP_SAMPLE_SIZE = 5000
    EARLY_STOPPING_ROUNDS = 50

    reports_dir = Path("reports")
    figures_dir = reports_dir / "figures" / "phase8"
    models_dir = Path("models")
    figures_dir.mkdir(parents=True, exist_ok=True)
    models_dir.mkdir(exist_ok=True)

    # ── 1. Load & engineer features ──────────────────────────────────────────
    print("=" * 60)
    print("WEEK 8: XGBoost + Early Stopping + SHAP")
    print("=" * 60)
    print("\n[1/9] Loading raw data...")
    df_raw = pd.read_csv("data/raw/fraudTest.csv")
    print(f"  Raw shape: {df_raw.shape}")

    print("[2/9] Engineering features...")
    df = engineer_features(df_raw)
    # Leakage guard: is_fraud must be in df but NOT in X
    assert "is_fraud" in df.columns, "Target 'is_fraud' missing after feature engineering."
    y = df["is_fraud"]
    X = df.drop(columns=["is_fraud"])
    # Confirm 'fraud_loss_amount' (regression proxy) is NOT in X
    assert "fraud_loss_amount" not in X.columns, \
        "Target-proxy 'fraud_loss_amount' found in features — leakage!"
    print(f"  Feature matrix shape: {X.shape}, Target distribution: {y.value_counts().to_dict()}")

    # ── 2. Canonical 80/20 stratified split ─────────────────────────────────
    print("[3/9] Canonical 80/20 stratified train/test split (random_state=42)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
    )
    print(f"  Train: {len(y_train)} rows | Test: {len(y_test)} rows")
    print(f"  Train fraud: {y_train.sum()} ({y_train.mean()*100:.4f}%)")
    print(f"  Test  fraud: {y_test.sum()} ({y_test.mean()*100:.4f}%)")

    # ── 3. Preprocessing: fitted ONLY on training data ────────────────────────
    print("[4/9] Building & fitting preprocessor on training data only...")
    preprocessor = build_preprocessor(X_train)
    X_train_proc = preprocessor.fit_transform(X_train)   # fit+transform on train
    X_test_proc  = preprocessor.transform(X_test)        # transform only on test

    # Extract meaningful feature names
    num_cols = preprocessor.transformers_[0][2]
    cat_enc  = preprocessor.named_transformers_["cat"]
    cat_cols = preprocessor.transformers_[1][2]
    cat_names = cat_enc.get_feature_names_out(cat_cols)
    feature_names = list(num_cols) + list(cat_names)

    # Sanitize feature names: XGBoost DMatrix and SHAP TreeExplainer both forbid
    # the characters [, ], < in feature names.  OneHotEncoder produces names like
    # "onehot__age_bucket__<25" which contain '<'.  Replace globally here so that
    # the same clean names are used consistently for the model DataFrame, SHAP, and CSVs.
    def _sanitize(name: str) -> str:
        return name.replace("[", "(").replace("]", ")").replace("<", "lt_")

    feature_names = [_sanitize(f) for f in feature_names]
    print(f"  Total transformed features: {len(feature_names)}")

    # Dense conversion for XGBoost (handles sparse input natively but good practice)
    if hasattr(X_train_proc, "toarray"):
        X_train_proc = X_train_proc.toarray().astype("float32")
    if hasattr(X_test_proc, "toarray"):
        X_test_proc = X_test_proc.toarray().astype("float32")

    # ── 4. Internal validation split (from training data only) ────────────────
    print("[5/9] Creating internal stratified validation split from training data (20%)...")
    X_int_train, X_int_val, y_int_train, y_int_val = train_test_split(
        X_train_proc, y_train, test_size=0.2, stratify=y_train, random_state=RANDOM_STATE
    )
    print(f"  Internal train: {len(y_int_train)} rows | Internal val: {len(y_int_val)} rows")

    # ── 5. Class imbalance: scale_pos_weight ──────────────────────────────────
    # Calculated from INTERNAL TRAINING SET only — NOT from test set
    neg_count = int((y_int_train == 0).sum())
    pos_count = int((y_int_train == 1).sum())
    scale_pos_weight = neg_count / pos_count
    print(f"[6/9] Class imbalance (internal train set):")
    print(f"  Negatives (legit):  {neg_count}")
    print(f"  Positives (fraud):  {pos_count}")
    print(f"  scale_pos_weight:   {scale_pos_weight:.6f}")

    # ── 6. XGBoost training with early stopping ────────────────────────────────
    print("[7/9] Training XGBoost with early stopping...")
    model = XGBClassifier(
        objective="binary:logistic",
        eval_metric="aucpr",
        n_estimators=1000,
        learning_rate=0.05,
        max_depth=6,
        min_child_weight=5,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.0,
        reg_lambda=1.0,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        tree_method="hist",
        scale_pos_weight=scale_pos_weight,
        early_stopping_rounds=EARLY_STOPPING_ROUNDS,
    )

    model.fit(
        X_int_train, y_int_train,
        eval_set=[
            (X_int_train, y_int_train),
            (X_int_val,   y_int_val),
        ],
        verbose=50,
    )

    best_iteration     = int(model.best_iteration)
    best_val_pr_auc    = float(model.best_score)
    n_trees_used       = best_iteration + 1  # 0-indexed
    print(f"  Best iteration (0-indexed): {best_iteration}")
    print(f"  Trees used after early stopping: {n_trees_used}")
    print(f"  Best validation PR-AUC: {best_val_pr_auc:.6f}")

    # ── 7. Final evaluation on UNTOUCHED test set ─────────────────────────────
    print("[8/9] Evaluating on untouched test set (threshold=0.5)...")
    y_prob_test = model.predict_proba(X_test_proc)[:, 1]
    y_pred_test = (y_prob_test >= THRESHOLD).astype(int)

    metrics = eval_clf(y_test, y_prob_test, y_pred_test, threshold=THRESHOLD)
    cm_vals = confusion_matrix(y_test, y_pred_test)
    tn, fp, fn, tp = cm_vals.ravel()

    print(f"  Accuracy:  {metrics['accuracy']:.6f}")
    print(f"  Precision: {metrics['precision']:.6f}")
    print(f"  Recall:    {metrics['recall']:.6f}")
    print(f"  F1:        {metrics['f1']:.6f}")
    print(f"  PR-AUC:    {metrics['pr_auc']:.6f}  <-- PRIMARY METRIC")
    print(f"  ROC-AUC:   {metrics['roc_auc']:.6f}")
    print(f"  TP={tp}  TN={tn}  FP={fp}  FN={fn}")

    # ── 8. Save model & preprocessor artifact ────────────────────────────────
    artifact = {
        "model":         model,
        "preprocessor":  preprocessor,
        "feature_names": feature_names,
    }
    joblib.dump(artifact, models_dir / "xgboost_week8.joblib")
    print("  Saved: models/xgboost_week8.joblib")

    # ── 9. Save metrics JSON ──────────────────────────────────────────────────
    metrics_report = {
        "model":                 "XGBoost",
        "week":                  8,
        "threshold":             THRESHOLD,
        "accuracy":              metrics["accuracy"],
        "precision":             metrics["precision"],
        "recall":                metrics["recall"],
        "f1":                    metrics["f1"],
        "pr_auc":                metrics["pr_auc"],
        "roc_auc":               metrics["roc_auc"],
        "tp":                    int(tp),
        "tn":                    int(tn),
        "fp":                    int(fp),
        "fn":                    int(fn),
        "best_iteration":        best_iteration,
        "n_trees_used":          n_trees_used,
        "best_validation_pr_auc": best_val_pr_auc,
        "scale_pos_weight":      scale_pos_weight,
        "early_stopping_rounds": EARLY_STOPPING_ROUNDS,
        "train_samples":         len(y_train),
        "test_samples":          len(y_test),
        "internal_train_samples": len(y_int_train),
        "internal_val_samples":  len(y_int_val),
        "train_fraud_count":     int(y_train.sum()),
        "test_fraud_count":      int(y_test.sum()),
        "internal_train_neg":    neg_count,
        "internal_train_pos":    pos_count,
        "random_state":          RANDOM_STATE,
        "xgb_config": {
            "objective":        "binary:logistic",
            "eval_metric":      "aucpr",
            "n_estimators":     1000,
            "learning_rate":    0.05,
            "max_depth":        6,
            "min_child_weight": 5,
            "subsample":        0.8,
            "colsample_bytree": 0.8,
            "reg_alpha":        0.0,
            "reg_lambda":       1.0,
            "tree_method":      "hist",
        },
    }
    with open(reports_dir / "phase8_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=4)
    print("  Saved: reports/phase8_metrics.json")

    # ── Plots ─────────────────────────────────────────────────────────────────
    # Confusion Matrix
    save_confusion_matrix(
        y_test, y_pred_test,
        "XGBoost Confusion Matrix (Week 8)",
        figures_dir / "confusion_matrix.png",
    )

    # Precision-Recall Curve
    save_pr_curve(y_test, y_prob_test, "XGBoost", metrics["pr_auc"],
                  figures_dir / "precision_recall_curve.png")

    # ROC Curve
    save_roc_curve(y_test, y_prob_test, "XGBoost", metrics["roc_auc"],
                   figures_dir / "roc_curve.png")

    print("  Saved confusion matrix, PR curve, ROC curve.")

    # ── 10. Model Comparison ──────────────────────────────────────────────────
    print("[9/9] Generating model comparison...")

    # Load previous metrics from stored JSON files
    comparison_rows = []

    # Logistic Regression (Phase 3)
    p3_path = reports_dir / "phase3_metrics.json"
    if p3_path.exists():
        with open(p3_path, encoding="utf-8") as f:
            p3 = json.load(f)
        if "logistic_regression_baseline" in p3:
            lr = p3["logistic_regression_baseline"]
            comparison_rows.append({
                "model":     "Logistic Regression",
                "precision": lr.get("precision"),
                "recall":    lr.get("recall"),
                "f1":        lr.get("f1"),
                "pr_auc":    lr.get("pr_auc"),
                "roc_auc":   lr.get("roc_auc"),
            })
        if "logistic_regression_balanced" in p3:
            lr_b = p3["logistic_regression_balanced"]
            comparison_rows.append({
                "model":     "Logistic Regression (Balanced)",
                "precision": lr_b.get("precision"),
                "recall":    lr_b.get("recall"),
                "f1":        lr_b.get("f1"),
                "pr_auc":    lr_b.get("pr_auc"),
                "roc_auc":   lr_b.get("roc_auc"),
            })

    # Decision Tree (Phase 6)
    p6_path = reports_dir / "phase6_metrics.json"
    if p6_path.exists():
        with open(p6_path, encoding="utf-8") as f:
            p6 = json.load(f)
        comparison_rows.append({
            "model":     "Decision Tree",
            "precision": p6.get("precision"),
            "recall":    p6.get("recall"),
            "f1":        p6.get("f1"),
            "pr_auc":    p6.get("pr_auc"),
            "roc_auc":   p6.get("roc_auc"),
        })

    # Random Forest (Phase 7)
    p7_path = reports_dir / "phase7_metrics.json"
    if p7_path.exists():
        with open(p7_path, encoding="utf-8") as f:
            p7 = json.load(f)
        comparison_rows.append({
            "model":     "Random Forest",
            "precision": p7.get("test_precision"),
            "recall":    p7.get("test_recall"),
            "f1":        p7.get("test_f1"),
            "pr_auc":    p7.get("test_pr_auc"),
            "roc_auc":   p7.get("test_roc_auc"),
        })

    # XGBoost Week 8 (current run)
    comparison_rows.append({
        "model":     "XGBoost (Week 8)",
        "precision": metrics["precision"],
        "recall":    metrics["recall"],
        "f1":        metrics["f1"],
        "pr_auc":    metrics["pr_auc"],
        "roc_auc":   metrics["roc_auc"],
    })

    df_comp = pd.DataFrame(comparison_rows)
    df_comp.to_csv(reports_dir / "phase8_model_comparison.csv", index=False)
    print("  Saved: reports/phase8_model_comparison.csv")

    # Model comparison bar chart
    metrics_to_plot = ["precision", "recall", "f1", "pr_auc", "roc_auc"]
    df_melt = df_comp.melt(id_vars="model", value_vars=metrics_to_plot,
                           var_name="metric", value_name="value")
    df_melt = df_melt.dropna(subset=["value"])

    fig, ax = plt.subplots(figsize=(14, 6))
    models_ordered = df_comp["model"].tolist()
    x = np.arange(len(metrics_to_plot))
    width = 0.15
    palette = plt.cm.tab10.colors

    for i, (_, row) in enumerate(df_comp.iterrows()):
        vals = [row.get(m) for m in metrics_to_plot]
        vals = [v if v is not None and not (isinstance(v, float) and math.isnan(v)) else 0
                for v in vals]
        ax.bar(x + i * width, vals, width, label=row["model"],
               color=palette[i % len(palette)], alpha=0.85)

    ax.set_xticks(x + width * (len(df_comp) - 1) / 2)
    ax.set_xticklabels(["Precision", "Recall", "F1", "PR-AUC*", "ROC-AUC"], fontsize=11)
    ax.set_ylim(0, 1.1)
    ax.set_ylabel("Score")
    ax.set_title("Model Comparison — Fraud Detection (Week 8)\n* PR-AUC is the PRIMARY metric for imbalanced fraud detection")
    ax.legend(loc="upper right", fontsize=9)
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    plt.tight_layout()
    plt.savefig(figures_dir / "model_comparison.png", bbox_inches="tight", dpi=150)
    plt.close(fig)
    print("  Saved: reports/figures/phase8/model_comparison.png")

    # ── 11. SHAP Analysis ──────────────────────────────────────────────────────
    print("\n[SHAP] Running SHAP TreeExplainer...")
    X_test_df = pd.DataFrame(X_test_proc, columns=feature_names)

    np.random.seed(RANDOM_STATE)
    if len(X_test_df) > SHAP_SAMPLE_SIZE:
        X_shap = X_test_df.sample(n=SHAP_SAMPLE_SIZE, random_state=RANDOM_STATE).reset_index(drop=True)
    else:
        X_shap = X_test_df.reset_index(drop=True)

    print(f"  SHAP sample size: {len(X_shap)} rows (reproducible, random_state=42)")
    print(f"  Feature representation: transformed pipeline output ({len(feature_names)} features)")
    print("  Explainer: shap.TreeExplainer (native XGBoost tree SHAP)")

    explainer   = shap.TreeExplainer(model)
    shap_values = explainer(X_shap)

    # Handle both 2D (binary) and 3D (multi-output) SHAP value shapes
    vals = shap_values.values
    if vals.ndim == 3:
        vals = vals[:, :, 1]

    mean_abs_shap = np.abs(vals).mean(axis=0)

    df_shap_imp = pd.DataFrame({
        "feature":       feature_names,
        "mean_abs_shap": mean_abs_shap,
    }).sort_values("mean_abs_shap", ascending=False).reset_index(drop=True)

    df_shap_imp.to_csv(reports_dir / "phase8_shap_importance.csv", index=False)
    print("  Saved: reports/phase8_shap_importance.csv")

    # SHAP beeswarm / summary plot
    print("  Generating SHAP summary plot...")
    plt.figure(figsize=(12, 9))
    shap.summary_plot(shap_values, X_shap, show=False, max_display=20)
    plt.title("SHAP Summary Plot — XGBoost Week 8 (Top 20 Features)")
    plt.tight_layout()
    plt.savefig(figures_dir / "shap_summary.png", bbox_inches="tight", dpi=150)
    plt.close()
    print("  Saved: reports/figures/phase8/shap_summary.png")

    # SHAP bar plot (global mean |SHAP|)
    print("  Generating SHAP bar plot...")
    plt.figure(figsize=(12, 9))
    shap.plots.bar(shap_values, max_display=20, show=False)
    plt.title("SHAP Global Feature Importance (Mean |SHAP|) — XGBoost Week 8")
    plt.tight_layout()
    plt.savefig(figures_dir / "shap_bar.png", bbox_inches="tight", dpi=150)
    plt.close()
    print("  Saved: reports/figures/phase8/shap_bar.png")

    # ── 12. Documentation ──────────────────────────────────────────────────────
    top10_shap = df_shap_imp.head(10)
    top10_lines = "\n".join(
        f"  {i+1}. `{row['feature']}` — mean |SHAP| = {row['mean_abs_shap']:.6f}"
        for i, (_, row) in enumerate(top10_shap.iterrows())
    )

    comp_table_header = "| Model | Precision | Recall | F1 | **PR-AUC** | ROC-AUC |"
    comp_table_sep    = "|-------|-----------|--------|----|-----------|---------|"
    comp_table_rows   = []
    for _, r in df_comp.iterrows():
        def fmt(v):
            return f"{v:.4f}" if v is not None and not (isinstance(v, float) and math.isnan(v)) else "N/A"
        comp_table_rows.append(
            f"| {r['model']} | {fmt(r['precision'])} | {fmt(r['recall'])} | "
            f"{fmt(r['f1'])} | **{fmt(r['pr_auc'])}** | {fmt(r['roc_auc'])} |"
        )
    comp_table = "\n".join([comp_table_header, comp_table_sep] + comp_table_rows)

    doc = f"""# Week 8 — XGBoost + Early Stopping + SHAP Explainability

## 1. Objective
Train an XGBoost classifier for fraud detection, use early stopping driven by an internal
validation split, handle severe class imbalance via `scale_pos_weight`, evaluate on the
untouched test set, and generate SHAP explanations to understand model decisions.

## 2. Dataset and Split
- **Raw file**: `data/raw/fraudTest.csv` — shape {df_raw.shape} (not modified)
- **Features after engineering**: {X.shape[1]} columns
- **Canonical split**: 80/20 stratified, `random_state=42`
  - Train: {len(y_train):,} rows | Fraud: {int(y_train.sum())} ({y_train.mean()*100:.4f}%)
  - Test:  {len(y_test):,} rows  | Fraud: {int(y_test.sum())} ({y_test.mean()*100:.4f}%)

## 3. Class Imbalance
Fraud prevalence is approximately {y_train.mean()*100:.4f}% — extreme positive-class minority.
The `scale_pos_weight` parameter compensates by weighting each fraud sample more heavily.

## 4. scale_pos_weight
Calculated **exclusively from the internal training sub-set** (never from test data):

```
neg_count (legit, internal train) = {neg_count:,}
pos_count (fraud, internal train) = {pos_count:,}
scale_pos_weight = {neg_count} / {pos_count} = {scale_pos_weight:.6f}
```

## 5. XGBoost Configuration
```python
XGBClassifier(
    objective="binary:logistic",
    eval_metric="aucpr",
    n_estimators=1000,
    learning_rate=0.05,
    max_depth=6,
    min_child_weight=5,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.0,
    reg_lambda=1.0,
    random_state=42,
    n_jobs=-1,
    tree_method="hist",
    scale_pos_weight={scale_pos_weight:.6f},
    early_stopping_rounds={EARLY_STOPPING_ROUNDS},
)
```

## 6. Internal Validation Split
To avoid touching the test set during early stopping:

```
Training data ({len(y_train):,} rows)
    └─ Internal train: {len(y_int_train):,} rows (80%)
    └─ Internal val:   {len(y_int_val):,} rows  (20%)
```

Both splits are stratified (`random_state=42`) to preserve the ~{y_train.mean()*100:.2f}% fraud rate.

## 7. Early Stopping Methodology
- `early_stopping_rounds={EARLY_STOPPING_ROUNDS}`: training halts if validation `aucpr` does not
  improve for 50 consecutive rounds.
- `eval_set=[(X_int_train, y_int_train), (X_int_val, y_int_val)]` — internal sets only.
- The final test set is completely withheld.

## 8. Best Iteration
| Attribute | Value |
|-----------|-------|
| Best iteration (0-indexed) | **{best_iteration}** |
| Trees used after early stopping | **{n_trees_used}** |
| Best validation PR-AUC | **{best_val_pr_auc:.6f}** |

## 9. Final Test Metrics (threshold = {THRESHOLD})
| Metric | Value |
|--------|-------|
| Accuracy | {metrics['accuracy']:.6f} |
| Precision | {metrics['precision']:.6f} |
| Recall | {metrics['recall']:.6f} |
| F1 | {metrics['f1']:.6f} |
| **PR-AUC** (primary) | **{metrics['pr_auc']:.6f}** |
| ROC-AUC | {metrics['roc_auc']:.6f} |

## 10. Confusion Matrix Interpretation
| | Predicted Legit | Predicted Fraud |
|--|--|--|
| **Actual Legit** | TN = {int(tn):,} | FP = {int(fp):,} |
| **Actual Fraud** | FN = {int(fn):,} | TP = {int(tp):,} |

- **{int(tp)} true positives**: fraud transactions correctly flagged.
- **{int(fn)} false negatives**: fraud missed — the primary concern in fraud detection.
- **{int(fp)} false positives**: legitimate transactions incorrectly flagged for review.
- **{int(tn):,} true negatives**: legitimate transactions correctly cleared.

## 11. PR-AUC Interpretation
PR-AUC = **{metrics['pr_auc']:.4f}** is the primary metric. For a dataset with only
{y_test.mean()*100:.4f}% fraud, a naive "predict all legitimate" classifier would achieve
PR-AUC ≈ {y_test.mean():.4f}. The XGBoost model achieves {metrics['pr_auc']:.4f},
indicating strong ability to rank fraud transactions highly.

## 12. SHAP Methodology
- **Explainer**: `shap.TreeExplainer` (exact tree SHAP, no approximation)
- **Sample**: {len(X_shap):,} rows randomly sampled from the test set (`random_state=42`)
- **Features**: the {len(feature_names)} transformed pipeline features
  (scaled numerics + one-hot-encoded categoricals)
- **Output**: mean absolute SHAP values per feature across all explained rows

## 13. Top SHAP Features (Actual Results)
{top10_lines}

## 14. Model Comparison
PR-AUC is highlighted as the **primary metric** for this fraud-detection task.

{comp_table}

> Note: Logistic Regression metrics are from Phase 3 (different pipeline version).
> All tree-model metrics use the canonical Week 8 pipeline configuration.

## 15. Leakage Checks
| Check | Status |
|-------|--------|
| `is_fraud` not in features | ✅ Confirmed (dropped before split) |
| `fraud_loss_amount` not in features | ✅ Confirmed (asserted at runtime) |
| Test data not used in training | ✅ Only `X_int_train`/`X_int_val` used for `model.fit()` |
| Test data not used for early stopping | ✅ `eval_set` uses internal splits only |
| `scale_pos_weight` from training data only | ✅ Computed from `y_int_train` |
| Preprocessor fitted on training data only | ✅ `preprocessor.fit_transform(X_train)` |
| No threshold tuning | ✅ Fixed at 0.5 |
| No Week 9/10+ work | ✅ Scope restricted to Week 8 |

## 16. Reproducibility
- All random operations use `random_state=42`
- XGBoost `random_state=42` + `tree_method="hist"` ensures deterministic training
- SHAP sample drawn with `random_state=42`
- Pipeline seeded via scikit-learn's `random_state` parameter

## 17. Limitations
- XGBoost predictions outside training distribution bounds may degrade
- SHAP computed on 5,000 test rows (not the full ~111K) for computational feasibility
- No threshold optimization (reserved for Week 10)
- Model is a black-box; SHAP provides post-hoc, not causal, explanations
- `fraud_loss_amount` is a **regression proxy target** from earlier weeks and is
  explicitly excluded from the classification feature set
"""

    with open(reports_dir / "week8_xgboost_shap.md", "w", encoding="utf-8") as f:
        f.write(doc)
    print("  Saved: reports/week8_xgboost_shap.md")

    print("\n" + "=" * 60)
    print("Week 8 COMPLETE")
    print("=" * 60)
    print(f"  Artifact:    models/xgboost_week8.joblib")
    print(f"  Metrics:     reports/phase8_metrics.json")
    print(f"  SHAP CSV:    reports/phase8_shap_importance.csv")
    print(f"  Docs:        reports/week8_xgboost_shap.md")
    print(f"  Figures:     reports/figures/phase8/")
    print(f"  Best iter:   {best_iteration}  |  PR-AUC: {metrics['pr_auc']:.4f}")


if __name__ == "__main__":
    run_week8()
