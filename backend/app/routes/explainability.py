import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/explainability")
def get_explainability():
    shap_path = Path("ml/reports/phase11_explainability.json")
    if shap_path.exists():
        with open(shap_path, "r") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Explainability data not found")
