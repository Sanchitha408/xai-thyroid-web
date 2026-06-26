"""
main.py — FastAPI ML microservice for XAI Thyroid.
Exposes POST /predict, POST /analyze, and GET /health endpoints.
Runs on port 8000.
"""

from contextlib import asynccontextmanager
from datetime import datetime
from typing import Literal

from fastapi import FastAPI, HTTPException, Request, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import logging

from predict import load_model, run_prediction
from image_analyze import generate_heatmaps

# ─── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("xai-thyroid-ml")

# ─── Global model state ────────────────────────────────────────────────────────
ml_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model once on startup, release on shutdown."""
    logger.info("Loading ML model...")
    # Propagate exception to fail loudly at startup if load_model() raises an error.
    # If ML_FALLBACK_ENABLED=1, load_model() returns None and does not raise an error.
    ml_state["model"] = load_model()
    if ml_state["model"] is None:
        logger.warning("ML model is not loaded. Starting in rule-based fallback mode.")
    else:
        logger.info("Model loaded successfully.")
    yield
    ml_state.clear()
    logger.info("ML service shut down.")


# ─── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="XAI Thyroid ML Service",
    description="Thyroid disease prediction with SHAP explainability",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: only allow the Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://backend:5000",  # Docker service name
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


# ─── Schemas ───────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    tsh: float = Field(..., ge=0.0, le=30.0,  description="TSH level (0–30 mIU/L)")
    t3:  float = Field(..., ge=0.0, le=15.0,  description="TSH level (0–15 nmol/L)")
    tt4: float = Field(..., ge=0.0, le=300.0, description="TT4 level (0–300 nmol/L)")
    fti: float = Field(..., ge=0.0, le=400.0, description="Free Thyroxine Index (0–400)")
    age: int   = Field(..., ge=1,   le=120,   description="Patient age (1–120)")
    sex: str   = Field(...,                   description="'Male' or 'Female'")

    @validator("sex")
    def validate_sex(cls, v):
        if v.strip().lower() not in ("male", "female", "m", "f", "0", "1"):
            raise ValueError("sex must be 'Male' or 'Female'")
        return v


class ShapEntry(BaseModel):
    feature:    str
    value:      float
    shap_value: float


class PredictResponse(BaseModel):
    prediction:    str
    confidence:    float
    probabilities: dict[str, float]
    shap_values:   list[ShapEntry]


# ─── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "model_loaded": ml_state.get("model") is not None,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
async def predict(payload: PredictRequest):
    """
    Run thyroid prediction and compute SHAP explanations.
    Accepts blood test values and returns:
      - prediction (Normal | Hypothyroid | Hyperthyroid)
      - confidence (%)
      - class probabilities
      - top 6 SHAP feature contributions
    """
    model = ml_state.get("model")
    try:
        result = run_prediction(
            model=model,
            tsh=payload.tsh,
            t3=payload.t3,
            tt4=payload.tt4,
            fti=payload.fti,
            age=payload.age,
            sex=payload.sex,
        )
        logger.info(
            "Prediction: %s (confidence: %.1f%%)", result["prediction"], result["confidence"]
        )
        return result
    except Exception as e:
        logger.error("Prediction error: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Prediction failed. Check server logs.")


@app.post("/analyze", tags=["Image Analysis"])
async def analyze(
    image: UploadFile = File(...),
    method: str = Form("GradCAM"),
    stage: str = Form("second_stage"),
    threshold: float = Form(0.5)
):
    """
    Run thyroid ultrasound image analysis and generate explainability heatmaps.
    """
    logger.info("Image analysis request: method=%s, stage=%s, threshold=%.2f", method, stage, threshold)
    
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")
        
    try:
        # Read image bytes
        image_bytes = await image.read()
        
        # Run explainability pipeline
        result = generate_heatmaps(
            image_bytes=image_bytes,
            method=method,
            stage=stage,
            threshold=threshold
        )
        return result
    except Exception as e:
        logger.error("Image analysis failed: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")


# ─── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
