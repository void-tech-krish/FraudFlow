import time
import pandas as pd
from app.services.model_state import model_state
from app.schemas.prediction import TransactionInput, PredictionResponse
import sys
import os
# Add the parent directory of 'backend' to sys.path so it finds 'ml'
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
sys.path.append(os.path.join(parent_dir, "ml"))
from src.preprocessing.feature_engineering import engineer_features

def make_prediction(tx: TransactionInput) -> PredictionResponse:
    start_time = time.perf_counter()
    
    if not model_state.loaded:
        raise ValueError("Model not loaded.")
        
    tx_dict = tx.model_dump(by_alias=True)
    if "Unnamed: 0" in tx_dict and tx_dict["Unnamed: 0"] is None:
        tx_dict["Unnamed: 0"] = 0
        
    df_raw = pd.DataFrame([tx_dict])
    df_eng = engineer_features(df_raw)
    
    cols_to_drop = ["is_fraud", "fraud_loss_amount"]
    df_features = df_eng.drop(columns=[c for c in cols_to_drop if c in df_eng.columns])
    
    X_proc = model_state.preprocessor.transform(df_features)
    if hasattr(X_proc, "toarray"):
        X_proc = X_proc.toarray().astype("float32")
        
    prob = float(model_state.model.predict_proba(X_proc)[0, 1])
    
    threshold = model_state.threshold
    pred = 1 if prob >= threshold else 0
    decision = "decline" if pred == 1 else "approve"
    
    end_time = time.perf_counter()
    latency_ms = (end_time - start_time) * 1000.0
    
    return PredictionResponse(
        fraud_probability=prob,
        prediction=pred,
        decision=decision,
        latency_ms=latency_ms
    )
