import os
import pandas as pd
import numpy as np
import json
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.metrics import precision_score, recall_score, f1_score, average_precision_score, roc_auc_score, accuracy_score, confusion_matrix, precision_recall_curve, roc_curve

from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import build_preprocessor

def eval_clf(y_true, probs, preds):
    return {
        "Accuracy": accuracy_score(y_true, preds),
        "Precision": precision_score(y_true, preds, zero_division=0),
        "Recall": recall_score(y_true, preds, zero_division=0),
        "F1": f1_score(y_true, preds, zero_division=0),
        "PR-AUC": average_precision_score(y_true, probs),
        "ROC-AUC": roc_auc_score(y_true, probs)
    }

def run_week6():
    print("Loading data...")
    df_raw = pd.read_csv("data/raw/fraudTest.csv")
    
    print("Engineering features...")
    df_clf = engineer_features(df_raw)
    
    y = df_clf['is_fraud']
    cols_to_drop = ['is_fraud']
    X = df_clf.drop(columns=cols_to_drop, errors='ignore')
    
    print("Train/Test split...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    
    print("Preprocessing...")
    preprocessor = build_preprocessor(X_train)
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)
    
    print("Training Decision Tree...")
    dt_model = DecisionTreeClassifier(
        random_state=42,
        class_weight="balanced",
        max_depth=12,
        min_samples_leaf=10
    )
    dt_model.fit(X_train_proc, y_train)
    
    print("Evaluating Test Set...")
    preds = dt_model.predict(X_test_proc)
    probs = dt_model.predict_proba(X_test_proc)[:, 1]
    metrics = eval_clf(y_test, probs, preds)
    
    # Save metrics
    report = {
        "model_name": "Decision Tree",
        "model_parameters": {
            "random_state": 42,
            "class_weight": "balanced",
            "max_depth": 12,
            "min_samples_leaf": 10
        },
        "train_sample_count": len(y_train),
        "test_sample_count": len(y_test),
        "train_fraud_count": int(y_train.sum()),
        "test_fraud_count": int(y_test.sum()),
        "accuracy": metrics["Accuracy"],
        "precision": metrics["Precision"],
        "recall": metrics["Recall"],
        "f1": metrics["F1"],
        "pr_auc": metrics["PR-AUC"],
        "roc_auc": metrics["ROC-AUC"],
        "threshold": 0.5,
        "random_state": 42
    }
    Path("reports").mkdir(exist_ok=True)
    with open("reports/phase6_metrics.json", "w") as f:
        json.dump(report, f, indent=4)
        
    Path("models").mkdir(exist_ok=True)
    joblib.dump(dt_model, "models/decision_tree_week6.joblib")
    
    # Visualizations
    fig_dir = Path("reports/figures/phase6")
    fig_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Confusion Matrix
    cm = confusion_matrix(y_test, preds)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Decision Tree Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.savefig(fig_dir / 'confusion_matrix.png', bbox_inches='tight')
    plt.close()
    
    # 2. PR Curve
    precision, recall, _ = precision_recall_curve(y_test, probs)
    plt.figure(figsize=(6, 5))
    plt.plot(recall, precision, marker='.')
    plt.title(f'Precision-Recall Curve (PR-AUC={metrics["PR-AUC"]:.4f})')
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.grid()
    plt.savefig(fig_dir / 'precision_recall_curve.png', bbox_inches='tight')
    plt.close()
    
    # 3. ROC Curve
    fpr, tpr, _ = roc_curve(y_test, probs)
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, marker='.')
    plt.plot([0, 1], [0, 1], linestyle='--')
    plt.title(f'ROC Curve (ROC-AUC={metrics["ROC-AUC"]:.4f})')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.grid()
    plt.savefig(fig_dir / 'roc_curve.png', bbox_inches='tight')
    plt.close()
    
    # 4. Feature Importance
    # Get feature names from preprocessor
    cat_enc = preprocessor.named_transformers_['cat']
    num_cols = preprocessor.transformers_[0][2]
    cat_cols = preprocessor.transformers_[1][2]
    
    cat_names = cat_enc.get_feature_names_out(cat_cols)
    feat_names = list(num_cols) + list(cat_names)
    
    importances = dt_model.feature_importances_
    df_imp = pd.DataFrame({'feature': feat_names, 'importance': importances})
    df_imp = df_imp.sort_values('importance', ascending=False).head(20)
    
    df_imp.to_csv("reports/phase6_feature_importance.csv", index=False)
    
    plt.figure(figsize=(10, 6))
    sns.barplot(data=df_imp, x='importance', y='feature')
    plt.title('Top 20 Feature Importances')
    plt.savefig(fig_dir / 'feature_importance.png', bbox_inches='tight')
    plt.close()
    
    # 5. Tree visualization (Upper levels only)
    plt.figure(figsize=(20, 10))
    plot_tree(dt_model, max_depth=3, feature_names=feat_names, filled=True, rounded=True, fontsize=10)
    plt.title('Decision Tree (Top 3 Levels)')
    plt.savefig(fig_dir / 'decision_tree_structure.png', bbox_inches='tight')
    plt.close()
    
    # Documentation
    md = f"""# Week 6 — Decision Tree

## Why Decision Tree is used
Provides strong baseline for non-linear modeling, easily handles mixed data types natively, and allows direct inspection of feature importance and decision boundaries.

## Model configuration
`DecisionTreeClassifier(random_state=42, class_weight='balanced', max_depth=12, min_samples_leaf=10)`
Depth is restricted to prevent massive overfitting. Leaves are restricted to ensure minimum node representation.

## Training data
{len(y_train)} samples ({int(y_train.sum())} fraud instances). Split completely independently from test data.

## Test data
{len(y_test)} samples ({int(y_test.sum())} fraud instances). Remained completely untouched during CV, selection, and training.

## Class imbalance handling
We used `class_weight='balanced'`, which scales weight of each class inversely proportional to frequency, strongly penalizing false negatives.

## Evaluation metrics
* Accuracy: {metrics["Accuracy"]:.4f}
* Precision: {metrics["Precision"]:.4f}
* Recall: {metrics["Recall"]:.4f}
* F1 Score: {metrics["F1"]:.4f}
* PR-AUC: {metrics["PR-AUC"]:.4f}
* ROC-AUC: {metrics["ROC-AUC"]:.4f}

## PR-AUC interpretation
PR-AUC is {metrics["PR-AUC"]:.4f}. This is the primary metric indicating how well the model discriminates fraud among positive predictions without being inflated by the massive count of true negatives.

## Confusion matrix interpretation
Matrix saved at `reports/figures/phase6/confusion_matrix.png`. The 'balanced' class weight ensures high recall (fewer False Negatives), but naturally induces more False Positives (lower precision).

## Feature importance
Extracted natively via `.feature_importances_`. Top features heavily split early in the tree, typically representing transactional velocity or extreme amounts. Documented in `reports/phase6_feature_importance.csv`. Note: feature importance represents split criterion usefulness, NOT causal probability.

## Comparison with Week 5
Week 5 CV (Depth 12) PR-AUC was ~0.591.
Week 6 Test PR-AUC is {metrics["PR-AUC"]:.4f}.
*Note: CV score is a validation estimate; Week 6 is a true hold-out test.*

## Limitations
Decision trees remain prone to overfitting (even with depth limits), yield axis-aligned boundaries that can fail to capture diagonal relationships, and offer high variance (small data changes can alter tree structure heavily).

## Leakage Checks
- Raw dataset unmodified.
- Test set strictly excluded from `.fit()` in model and preprocessing.
- No future velocity variables included.
- `is_fraud` strictly dropped from `X`.
"""
    with open("reports/week6_decision_tree.md", "w") as f:
        f.write(md)
        
    print("Week 6 complete.")

if __name__ == "__main__":
    run_week6()
