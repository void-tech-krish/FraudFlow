import json
import joblib
from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

from src.data.loader import load_fraud_data
from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import split_data, build_preprocessor
from src.models.evaluate import calculate_metrics, plot_confusion_matrix, plot_roc_curve, plot_precision_recall_curve

def train_xgboost():
    print("Loading data...")
    df = load_fraud_data()
    
    print("Engineering features...")
    df = engineer_features(df)
    
    print("Splitting data...")
    X_train, X_test, y_train, y_test = split_data(df)
    
    print("Creating internal validation split...")
    X_train_sub, X_val_sub, y_train_sub, y_val_sub = train_test_split(
        X_train, y_train, test_size=0.2, stratify=y_train, random_state=42
    )
    
    print("Building preprocessor...")
    preprocessor = build_preprocessor(X_train)
    
    print("Fitting preprocessor and transforming data...")
    X_train_sub_transformed = preprocessor.fit_transform(X_train_sub)
    X_val_sub_transformed = preprocessor.transform(X_val_sub)
    X_test_transformed = preprocessor.transform(X_test)
    
    feature_names = preprocessor.get_feature_names_out()
    
    scale_pos_weight = sum(y_train_sub == 0) / sum(y_train_sub == 1)
    
    print(f"Scale pos weight: {scale_pos_weight}")
    
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
        random_state=42,
        n_jobs=-1,
        tree_method="hist",
        scale_pos_weight=scale_pos_weight,
        early_stopping_rounds=50
    )
    
    print("Training XGBoost...")
    model.fit(
        X_train_sub_transformed, y_train_sub,
        eval_set=[(X_val_sub_transformed, y_val_sub)],
        verbose=10
    )
    
    best_iteration = model.best_iteration
    best_score = model.best_score
    print(f"Best iteration: {best_iteration}, Best validation PR-AUC: {best_score}")
    
    print("Evaluating on untouched test set...")
    y_prob = model.predict_proba(X_test_transformed)[:, 1]
    y_pred = model.predict(X_test_transformed)
    
    metrics = calculate_metrics(y_test, y_pred, y_prob)
    
    reports_dir = Path("reports")
    reports_dir.mkdir(exist_ok=True)
    figures_dir = reports_dir / "figures" / "phase6"
    figures_dir.mkdir(parents=True, exist_ok=True)
    
    plot_confusion_matrix(y_test, y_pred, "XGBoost Confusion Matrix", figures_dir / "phase6_xgboost_confusion_matrix.png")
    plot_precision_recall_curve(y_test, {"XGBoost": y_prob}, "XGBoost PR Curve", figures_dir / "phase6_xgboost_pr_curve.png")
    plot_roc_curve(y_test, {"XGBoost": y_prob}, "XGBoost ROC Curve", figures_dir / "phase6_xgboost_roc_curve.png")
    
    metrics_report = {
        "model": "XGBoost",
        "training_rows": len(X_train_sub),
        "validation_rows": len(X_val_sub),
        "test_rows": len(X_test),
        "fraud_prevalence_train": float(y_train_sub.mean()),
        "fraud_prevalence_validation": float(y_val_sub.mean()),
        "fraud_prevalence_test": float(y_test.mean()),
        "scale_pos_weight": float(scale_pos_weight),
        "best_iteration": int(best_iteration),
        "best_validation_pr_auc": float(best_score),
        **metrics
    }
    
    with open(reports_dir / "phase6_xgboost_metrics.json", "w") as f:
        json.dump(metrics_report, f, indent=4)
        
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    # Save the model and preprocessor separately, or as a dict
    joblib.dump({"model": model, "preprocessor": preprocessor, "feature_names": feature_names}, models_dir / "xgboost_fraud.joblib")
    print("Saved model artifacts.")
    
    # Create comparison report
    phase3_metrics_path = reports_dir / "phase3_metrics.json"
    phase4_dt_metrics_path = reports_dir / "phase4_decision_tree_metrics.json"
    phase4_rf_metrics_path = reports_dir / "phase4_random_forest_metrics.json"
    
    comparison_data = []
    
    if phase3_metrics_path.exists():
        with open(phase3_metrics_path, "r") as f:
            p3 = json.load(f)
            comparison_data.append(p3.get("logistic_regression", {}))
            comparison_data.append(p3.get("logistic_regression_balanced", {}))
            
    if phase4_dt_metrics_path.exists():
        with open(phase4_dt_metrics_path, "r") as f:
            p4_dt = json.load(f)
            comparison_data.append(p4_dt)
            
    if phase4_rf_metrics_path.exists():
        with open(phase4_rf_metrics_path, "r") as f:
            p4_rf = json.load(f)
            comparison_data.append(p4_rf)
            
    comparison_data.append({
        "model": "XGBoost",
        "precision": metrics["precision"],
        "recall": metrics["recall"],
        "f1": metrics["f1"],
        "pr_auc": metrics["pr_auc"],
        "roc_auc": metrics["roc_auc"],
        "accuracy": metrics["accuracy"]
    })
    
    df_comp = pd.DataFrame(comparison_data)
    if not df_comp.empty:
        # Ensure correct columns if they exist
        cols = ["model", "precision", "recall", "f1", "pr_auc", "roc_auc", "accuracy"]
        existing_cols = [c for c in cols if c in df_comp.columns]
        df_comp = df_comp[existing_cols]
        df_comp.to_csv(reports_dir / "phase6_model_comparison.csv", index=False)
    print("Phase 6 training complete.")

if __name__ == "__main__":
    train_xgboost()
