from fastapi import APIRouter
import json
import os
import glob
from app.config.settings import PROJECT_ROOT

router = APIRouter()

@router.get("/ml-pipeline")
def get_ml_pipeline():
    reports_dir = os.path.join(PROJECT_ROOT, "ml/reports")
    
    # Helpers
    def read_json(filename):
        path = os.path.join(reports_dir, filename)
        if os.path.exists(path):
            with open(path, "r") as f:
                return json.load(f)
        return None

    def read_md(filename):
        path = os.path.join(reports_dir, filename)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                return f.read()
        return None

    # Dataset stats from phase 8
    phase8 = read_json("phase8_metrics.json")
    dataset = None
    if phase8:
        dataset = {
            "total_train_samples": phase8.get("train_samples"),
            "total_test_samples": phase8.get("test_samples"),
            "train_fraud_count": phase8.get("train_fraud_count"),
            "test_fraud_count": phase8.get("test_fraud_count"),
        }

    # EDA figures
    base_dir = os.path.join(reports_dir, "figures")
    eda_figures_paths = []
    if os.path.exists(base_dir):
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                if file.endswith(".png"):
                    path = os.path.relpath(os.path.join(root, file), base_dir).replace("\\", "/")
                    eda_figures_paths.append(path)

    # Models comparison
    phase5 = read_json("phase5_model_selection.json")
    
    # Champion
    champion = None
    if phase8:
        champion = {
            "model": phase8.get("model", "XGBoost"),
            "accuracy": phase8.get("accuracy"),
            "precision": phase8.get("precision"),
            "recall": phase8.get("recall"),
            "f1": phase8.get("f1"),
            "pr_auc": phase8.get("pr_auc"),
            "roc_auc": phase8.get("roc_auc"),
            "hyperparameters": phase8.get("xgb_config")
        }

    # Threshold
    phase10 = read_json("phase10_optimization_metrics.json")

    # Retraining
    retraining_log_path = os.path.join(reports_dir, "retraining_audit_log.jsonl")
    retraining = []
    if os.path.exists(retraining_log_path):
        with open(retraining_log_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    retraining.append(json.loads(line))
    
    return {
        "dataset": dataset,
        "data_cleaning": read_md("week2_data_validation.md"),
        "eda": {"figures": eda_figures_paths},
        "feature_engineering": read_md("week4_feature_engineering.md"),
        "preprocessing": None,
        "models": phase5,
        "champion": champion,
        "explainability": read_json("phase11_explainability.json"),
        "threshold": phase10,
        "monitoring": read_json("monitoring/latest_monitoring_report.json"),
        "retraining": retraining[-5:] if retraining else None
    }
