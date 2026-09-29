import os
import json
import joblib
from pathlib import Path
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from src.data.loader import load_fraud_data
from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import split_data, build_preprocessor
from src.models.evaluate import (
    calculate_metrics,
    plot_confusion_matrix,
    plot_precision_recall_curve,
    plot_roc_curve
)

def train_and_evaluate():
    print("Loading data...")
    df = load_fraud_data()
    
    print("Engineering features...")
    df = engineer_features(df)
    
    print("Splitting data...")
    X_train, X_test, y_train, y_test = split_data(df)
    
    print("Building preprocessor...")
    preprocessor = build_preprocessor(X_train)
    
    print("Training Logistic Regression (Baseline)...")
    model_baseline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(class_weight=None, solver="saga", max_iter=1000, random_state=42))
    ])
    model_baseline.fit(X_train, y_train)
    
    print("Training Logistic Regression (Balanced)...")
    model_balanced = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(class_weight="balanced", solver="saga", max_iter=1000, random_state=42))
    ])
    model_balanced.fit(X_train, y_train)
    
    print("Evaluating models...")
    # Predict probabilities (positive class)
    y_prob_baseline = model_baseline.predict_proba(X_test)[:, 1]
    y_prob_balanced = model_balanced.predict_proba(X_test)[:, 1]
    
    # Predict classes (threshold 0.5)
    y_pred_baseline = model_baseline.predict(X_test)
    y_pred_balanced = model_balanced.predict(X_test)
    
    # Metrics
    metrics_baseline = calculate_metrics(y_test, y_pred_baseline, y_prob_baseline)
    metrics_balanced = calculate_metrics(y_test, y_pred_balanced, y_prob_balanced)
    
    results = {
        "logistic_regression_baseline": metrics_baseline,
        "logistic_regression_balanced": metrics_balanced
    }
    
    # Save metrics
    metrics_path = Path("reports/phase3_metrics.json")
    metrics_path.parent.mkdir(parents=True, exist_ok=True)
    with open(metrics_path, "w") as f:
        json.dump(results, f, indent=4)
        
    print("Generating plots...")
    # Plots
    plot_confusion_matrix(
        y_test, y_pred_baseline,
        title="Confusion Matrix - Logistic Regression (Baseline)",
        save_path="reports/figures/phase3/phase3_logistic_confusion_matrix.png"
    )
    
    plot_confusion_matrix(
        y_test, y_pred_balanced,
        title="Confusion Matrix - Logistic Regression (Balanced)",
        save_path="reports/figures/phase3/phase3_balanced_confusion_matrix.png"
    )
    
    y_probs_dict = {
        "Logistic Regression (Baseline)": y_prob_baseline,
        "Logistic Regression (Balanced)": y_prob_balanced
    }
    
    plot_precision_recall_curve(
        y_test, y_probs_dict,
        title="Precision-Recall Curve Comparison",
        save_path="reports/figures/phase3/phase3_precision_recall_curve.png"
    )
    
    plot_roc_curve(
        y_test, y_probs_dict,
        title="ROC Curve Comparison",
        save_path="reports/figures/phase3/phase3_roc_curve.png"
    )
    
    print("Saving models...")
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    joblib.dump(model_baseline, models_dir / "logistic_regression_baseline.joblib")
    joblib.dump(model_balanced, models_dir / "logistic_regression_balanced.joblib")
    
    print("Phase 3 complete.")

if __name__ == "__main__":
    train_and_evaluate()
