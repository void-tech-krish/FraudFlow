from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import glob
from contextlib import asynccontextmanager

from app.config.settings import settings, PROJECT_ROOT
from app.services.model_state import model_state
from app.routes import health, prediction, analytics, explainability, monitoring, retraining

@asynccontextmanager
async def lifespan(app: FastAPI):
    model_state.load()
    yield

app = FastAPI(title="FraudFlow Real-Time Inference API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CLIENT_URL, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(prediction.router, tags=["Prediction"])
app.include_router(analytics.router, tags=["Analytics"])
app.include_router(explainability.router, tags=["Explainability"])
app.include_router(monitoring.router, tags=["Monitoring"])
app.include_router(retraining.router, tags=["Retraining"])

# Mount static files for ML figures
app.mount("/figures", StaticFiles(directory=os.path.join(PROJECT_ROOT, "ml/reports/figures")), name="figures")

@app.get("/api/figures-list", tags=["Analytics"])
def list_figures():
    base_dir = os.path.join(PROJECT_ROOT, "ml/reports/figures")
    png_files = []
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(".png"):
                path = os.path.relpath(os.path.join(root, file), base_dir)
                png_files.append(path.replace("\\", "/"))
    return {"figures": png_files}
