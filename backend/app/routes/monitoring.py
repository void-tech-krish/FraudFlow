import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/monitoring")
def get_monitoring():
    report_path = Path("ml/reports/monitoring/latest_monitoring_report.json")
    if report_path.exists():
        with open(report_path, "r") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Monitoring data not found")
