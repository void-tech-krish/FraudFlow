from fastapi import APIRouter, HTTPException
from app.schemas.prediction import TransactionInput, PredictionResponse
from app.services.prediction_service import make_prediction

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict(tx: TransactionInput):
    try:
        return make_prediction(tx)
    except ValueError as ve:
        raise HTTPException(status_code=503, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
