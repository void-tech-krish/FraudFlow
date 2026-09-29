import json
import joblib
from pathlib import Path
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
import pandas as pd

from src.data.loader import load_fraud_data
from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import split_data, build_preprocessor
from src.models.evaluate import (
    calculate_metrics,
    plot_confusion_matrix,
    plot_precision_recall_curve,
    plot_roc_curve,
    extract_feature_importance,
    calculate_permutation_importance
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
    
    print("Training Decision Tree...")
    model_dt = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", DecisionTreeClassifier(
            random_state=42,
            class_weight="balanced",
            max_depth=12,
            min_samples_leaf=10
        ))
    ])
    model_dt.fit(X_train, y_train)
    
    print("Training Random Forest...")
    model_rf = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=150,
            random_state=42,
            class_weight="balanced",
            oob_score=True,
            n_jobs=-1,
            max_depth=15,
            min_samples_leaf=5
        ))
    ])
    model_rf.fit(X_train, y_train)
    
    print("Evaluating models...")
    # Predict probabilities (positive class)
    y_prob_dt = model_dt.predict_proba(X_test)[:, 1]
    y_prob_rf = model_rf.predict_proba(X_test)[:, 1]
    
    # Predict classes (threshold 0.5)
    y_pred_dt = model_dt.predict(X_test)
    y_pred_rf = model_rf.predict(X_test)
    
    # Metrics
    metrics_dt = calculate_metrics(y_test, y_pred_dt, y_prob_dt)
    metrics_rf = calculate_metrics(y_test, y_pred_rf, y_prob_rf)
    
    # Add OOB score
    oob_score = float(model_rf.named_steps["classifier"].oob_score_)
    metrics_rf["oob_score"] = oob_score
    
    results = {
        "decision_tree": metrics_dt,
        "random_forest": metrics_rf
    }
    
    # Save metrics
    metrics_path = Path("reports/phase4_metrics.json")
    metrics_path.parent.mkdir(parents=True, exist_ok=True)
    with open(metrics_path, "w") as f:
        json.dump(results, f, indent=4)
        
    print("Generating plots...")
    # Plots
    plot_confusion_matrix(
        y_test, y_pred_dt,
        title="Confusion Matrix - Decision Tree",
        save_path="reports/figures/phase4/phase4_decision_tree_confusion_matrix.png"
    )
    
    plot_confusion_matrix(
        y_test, y_pred_rf,
        title="Confusion Matrix - Random Forest",
        save_path="reports/figures/phase4/phase4_random_forest_confusion_matrix.png"
    )
    
    y_probs_dict = {
        "Decision Tree": y_prob_dt,
        "Random Forest": y_prob_rf
    }
    
    plot_precision_recall_curve(
        y_test, y_probs_dict,
        title="Precision-Recall Curve Comparison",
        save_path="reports/figures/phase4/phase4_precision_recall_curve.png"
    )
    
    plot_roc_curve(
        y_test, y_probs_dict,
        title="ROC Curve Comparison",
        save_path="reports/figures/phase4/phase4_roc_curve.png"
    )
    
    print("Extracting feature importances...")
    extract_feature_importance(
        model_dt,
        save_path="reports/phase4_decision_tree_feature_importance.csv",
        plot_path="reports/figures/phase4/phase4_decision_tree_feature_importance.png"
    )
    
    extract_feature_importance(
        model_rf,
        save_path="reports/phase4_random_forest_feature_importance.csv",
        plot_path="reports/figures/phase4/phase4_random_forest_feature_importance.png"
    )
    
    print("Calculating permutation importance on sample (20k rows)...")
    if len(X_test) > 20000:
        frac = 20000 / len(X_test)
        X_test_sample = X_test.groupby(y_test, group_keys=False).apply(lambda x: x.sample(frac=frac, random_state=42))
        y_test_sample = y_test.loc[X_test_sample.index]
    else:
        X_test_sample = X_test
        y_test_sample = y_test
    
    calculate_permutation_importance(
        model_rf,
        X_test_sample,
        y_test_sample,
        save_path="reports/phase4_random_forest_permutation_importance.csv",
        plot_path="reports/figures/phase4/phase4_random_forest_permutation_importance.png"
    )
    
    print("Saving models...")
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    joblib.dump(model_dt, models_dir / "decision_tree.joblib")
    joblib.dump(model_rf, models_dir / "random_forest.joblib")
    
    print("Phase 4 complete.")

if __name__ == "__main__":
    train_and_evaluate()
