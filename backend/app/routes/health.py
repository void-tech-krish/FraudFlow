from fastapi import APIRouter
from app.services.model_state import model_state

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": model_state.loaded,
        "model": "XGBoost",
        "threshold": model_state.threshold
    }
