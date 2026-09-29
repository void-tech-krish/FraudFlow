# FraudFlow Backend

This is the FastAPI backend for FraudFlow, strictly separated from the frontend and ML pipeline.

## Structure
- `app/main.py`: Application entrypoint
- `app/routes/`: API routes (prediction, monitoring, etc.)
- `app/services/`: Core logic and ML integration
- `app/schemas/`: Pydantic request/response schemas
- `app/config/`: Configuration settings

## Running
```bash
cd backend
python -m uvicorn app.main:app --port 8000
```
