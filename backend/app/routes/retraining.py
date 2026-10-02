import sys
import os
import json
import subprocess
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.config.settings import PROJECT_ROOT

router = APIRouter()

@router.post("/retrain/dry-run")
def run_retraining_dry_run():
    try:
        script_path = os.path.join(PROJECT_ROOT, "ml/scripts/retrain.py")
        result = subprocess.run(
            [sys.executable, script_path, "--dry-run"],
            capture_output=True, text=True, check=True
        )
        audit_log = Path(os.path.join(PROJECT_ROOT, "ml/reports/retraining_audit_log.jsonl"))
        latest_audit = {}
        if audit_log.exists():
            with open(audit_log, "r") as f:
                lines = f.readlines()
                if lines:
                    latest_audit = json.loads(lines[-1])
        return {
            "status": "success",
            "output": result.stdout,
            "latest_audit": latest_audit
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Retraining script failed: {e.stderr}")
