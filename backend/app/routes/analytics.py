import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/analytics")
def get_analytics():
    metrics_path = Path("ml/reports/phase8_metrics.json")
    if metrics_path.exists():
        with open(metrics_path, "r") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Analytics data not found")
