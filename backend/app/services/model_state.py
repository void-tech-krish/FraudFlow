import json
import joblib
from pathlib import Path
from app.config.settings import settings

class ModelState:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.threshold = 0.11
        self.loaded = False

    def load(self):
        try:
            metrics_path = Path(settings.METRICS_PATH)
            if metrics_path.exists():
                with open(metrics_path, "r") as f:
                    w10 = json.load(f)
                self.threshold = w10["selected_model"]["optimal_threshold"]
                
            art = joblib.load(Path(settings.MODEL_PATH))
            self.model = art["model"]
            self.preprocessor = art["preprocessor"]
            self.loaded = True
            print(f"Loaded XGBoost champion model. Configured threshold: {self.threshold}")
        except Exception as e:
            print(f"Error loading model: {e}")

model_state = ModelState()
