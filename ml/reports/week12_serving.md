# Week 12: Real-time Serving & Safe Retraining

## 1. API Architecture
We deployed a high-performance serving layer using **FastAPI** and **Uvicorn**, optimized for synchronous ML model execution in memory. The API endpoints include `/health` for liveness checks and `/predict` for processing raw transaction payloads.

## 2. Model Loading
The XGBoost champion `.joblib` model and its corresponding preprocessor artifact are loaded exactly **once** via a FastAPI `@app.on_event("startup")` lifecycle hook. This ensures that the heavy I/O and deserialization overhead happens only at server boot time, allowing subsequent `POST /predict` requests to access the pre-warmed model instantly from memory.

## 3. Prediction Flow
1. **Pydantic Validation**: Incoming JSON requests are strictly parsed.
2. **Preprocessing**: The raw payload is passed through the exact `engineer_features()` pipeline built in Week 2, followed by the `preprocessor.transform()` object fit in Week 8.
3. **Inference**: The pre-loaded XGBoost model computes `predict_proba`.
4. **Decision Boundary**: We apply the **Week 10 optimal threshold (0.11)**.
5. **Response Construction**: The API returns the probability, binary decision flag, and internal latency measured via `time.perf_counter()`.

## 4. Existing Week 10 Threshold Usage
The threshold of **0.11**—derived from our explicit false-positive ($5.00) vs false-negative ($ loss amount) cost minimization step in Week 10—is preserved perfectly. No new threshold search or optimization was run.

## 5. Latency Methodology
Latency is measured strictly on the server side capturing:
* Data parsing time.
* Feature engineering/pipeline transformation time.
* XGBoost `.predict_proba()` inference time.
Measurement utilizes `time.perf_counter()` to achieve microsecond-resolution timing.

## 6. Benchmark Results
Benchmark performed against 500 records drawn from the original dataset.

* **Average**: 28.45 ms
* **Median**: 28.28 ms
* **P95**: 31.35 ms
* **P99**: 38.08 ms
* **Maximum**: 59.49 ms

The primary business requirement (`P99 < 100 ms`) is **ACHIEVED** natively.

## 7. Drift-Trigger Integration
A decoupled script (`scripts/retrain.py`) reads the output alerts from the monitoring pipeline built earlier in Week 12. If a `CRITICAL` drift condition is triggered (e.g. PR-AUC degradation below tolerance or massive PSI shift), the script flags the model for retraining eligibility.

## 8. Retraining Workflow
The retraining workflow acts as a controlled state machine:
1. Parse monitoring alert.
2. Verify drift criticality.
3. Simulate training of candidate model.
4. Block immediate promotion, requiring explicit out-of-band validation.

## 9. Dry-Run Behavior
The retraining script supports a `--dry-run` flag which executes the full decision-logic tree but bypasses any training triggers or side effects. This guarantees safe integration testing and alerting dry-runs in production.

## 10. Safety Controls
- **Validation Before Promotion**: We intentionally disabled automatic model promotion. A candidate model is generated but marked `REQUIRES_VALIDATION`.
- **Target Leakage Proofing**: `is_fraud` and `fraud_loss_amount` remain strictly disallowed from inference API inputs.
- **Audit Logging**: Every drift evaluation—whether dry-run or live—writes an auditable record to `reports/retraining_audit_log.jsonl`.

## 11. Limitations
FastAPI without asynchronous worker pools may block the event loop during heavy sequential model inference requests. For extreme scale, running multiple Uvicorn workers or converting to an ONNX runtime would be recommended.
