import json
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.config.settings import PROJECT_ROOT

router = APIRouter()

@router.get("/analytics")
def get_analytics():
    metrics_path = Path(os.path.join(PROJECT_ROOT, "ml/reports/phase8_metrics.json"))
    if metrics_path.exists():
        with open(metrics_path, "r") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Analytics data not found")
