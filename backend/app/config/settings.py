import os

class Settings:
    CLIENT_URL: str = os.getenv("CLIENT_URL", "http://localhost:5173")
    MODEL_PATH: str = os.getenv("MODEL_PATH", "ml/models/xgboost_week8.joblib")
    METRICS_PATH: str = os.getenv("METRICS_PATH", "ml/reports/phase10_optimization_metrics.json")

settings = Settings()
