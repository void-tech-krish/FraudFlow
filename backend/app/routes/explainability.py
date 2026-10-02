import json
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.config.settings import PROJECT_ROOT

router = APIRouter()

@router.get("/explainability")
def get_explainability():
    shap_path = Path(os.path.join(PROJECT_ROOT, "ml/reports/phase11_explainability.json"))
    if shap_path.exists():
        with open(shap_path, "r") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Explainability data not found")
