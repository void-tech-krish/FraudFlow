import json
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.config.settings import PROJECT_ROOT

router = APIRouter()

@router.get("/monitoring")
def get_monitoring():
    report_path = Path(os.path.join(PROJECT_ROOT, "ml/reports/monitoring/latest_monitoring_report.json"))
    if report_path.exists():
        with open(report_path, "r") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Monitoring data not found")
