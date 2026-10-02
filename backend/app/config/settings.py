import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))

class Settings:
    CLIENT_URL: str = os.getenv("CLIENT_URL", "http://localhost:5173")
    MODEL_PATH: str = os.getenv("MODEL_PATH", os.path.join(PROJECT_ROOT, "ml/models/xgboost_week8.joblib"))
    METRICS_PATH: str = os.getenv("METRICS_PATH", os.path.join(PROJECT_ROOT, "ml/reports/phase10_optimization_metrics.json"))

settings = Settings()
