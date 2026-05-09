"""
FastAPI ML Fraud Detection Service
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from typing import Optional
import logging
import os
from dotenv import load_dotenv
import pickle
from pathlib import Path

load_dotenv()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="FinTrace ML Service",
    description="Machine Learning Fraud Detection Microservice",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= Models =============

class MLPredictionRequest(BaseModel):
    account_id: str
    transaction_amount: float
    transaction_frequency: float
    account_age: float
    transfer_velocity: float
    geographic_deviation: bool
    device_mismatch: bool
    balance_anomaly: bool
    account_kyc_status: str
    last_transaction_time: Optional[float] = None

class MLPredictionResponse(BaseModel):
    account_id: str
    fraud_probability: float
    anomaly_score: float
    risk_level: str
    features: dict
    explanation: str

class ModelStatus(BaseModel):
    status: str
    model_path: str
    last_updated: str

# ============= Models Loading =============

class FraudDetectionModel:
    def __init__(self):
        self.isolation_forest = None
        self.random_forest = None
        self.scaler = None
        self.load_models()
    
    def load_models(self):
        try:
            model_path = Path(os.getenv("MODEL_PATH", "./models"))
            
            # Try to load pre-trained models, if not available, we'll use dummy implementations
            logger.info(f"Attempting to load models from {model_path}")
            
            # For now, we'll initialize with None and create on first use
            logger.info("Models initialized (will use default implementations)")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
    
    def preprocess_features(self, data: MLPredictionRequest) -> np.ndarray:
        """Convert request to feature vector"""
        features = np.array([
            data.transaction_amount,
            data.transaction_frequency,
            data.account_age,
            data.transfer_velocity,
            1.0 if data.geographic_deviation else 0.0,
            1.0 if data.device_mismatch else 0.0,
            1.0 if data.balance_anomaly else 0.0,
            1.0 if data.account_kyc_status == "rejected" else (0.5 if data.account_kyc_status == "pending" else 0.0),
            data.last_transaction_time or 0.0,
        ])
        return features.reshape(1, -1)
    
    def predict(self, data: MLPredictionRequest) -> MLPredictionResponse:
        """Predict fraud probability"""
        
        # Preprocess
        features = self.preprocess_features(data)
        feature_dict = {
            "transaction_amount": data.transaction_amount,
            "transaction_frequency": data.transaction_frequency,
            "account_age": data.account_age,
            "transfer_velocity": data.transfer_velocity,
            "geographic_deviation": data.geographic_deviation,
            "device_mismatch": data.device_mismatch,
            "balance_anomaly": data.balance_anomaly,
            "account_kyc_status": data.account_kyc_status,
        }
        
        # Simple heuristic-based scoring (placeholder for actual ML models)
        fraud_score = 0.0
        
        if data.geographic_deviation:
            fraud_score += 0.15
        
        if data.device_mismatch:
            fraud_score += 0.15
        
        if data.balance_anomaly:
            fraud_score += 0.2
        
        if data.transfer_velocity > 5:
            fraud_score += 0.2
        
        if data.transaction_frequency > 10:
            fraud_score += 0.15
        
        if data.account_kyc_status == "rejected":
            fraud_score += 0.3
        elif data.account_kyc_status == "pending":
            fraud_score += 0.1
        
        # Normalize
        fraud_probability = min(fraud_score / 1.2, 1.0)
        anomaly_score = fraud_probability * 0.9
        
        # Determine risk level
        if fraud_probability >= 0.9:
            risk_level = "critical"
        elif fraud_probability >= 0.7:
            risk_level = "high"
        elif fraud_probability >= 0.4:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        # Generate explanation
        explanation_parts = []
        if data.geographic_deviation:
            explanation_parts.append("Geographic deviation detected")
        if data.device_mismatch:
            explanation_parts.append("Device mismatch detected")
        if data.balance_anomaly:
            explanation_parts.append("Balance anomaly detected")
        if data.transfer_velocity > 5:
            explanation_parts.append(f"High transfer velocity ({data.transfer_velocity})")
        
        explanation = "; ".join(explanation_parts) if explanation_parts else "No significant anomalies"
        
        return MLPredictionResponse(
            account_id=data.account_id,
            fraud_probability=round(fraud_probability, 3),
            anomaly_score=round(anomaly_score, 3),
            risk_level=risk_level,
            features=feature_dict,
            explanation=explanation
        )

# Initialize model
model = FraudDetectionModel()

# ============= Routes =============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "FinTrace ML Service",
        "version": "1.0.0"
    }

@app.post("/predict", response_model=MLPredictionResponse)
async def predict_fraud(request: MLPredictionRequest):
    """
    Predict fraud probability for a transaction
    
    Returns:
    - fraud_probability: Probability of fraud (0-1)
    - anomaly_score: Anomaly detection score
    - risk_level: low, medium, high, critical
    - features: Input features used
    - explanation: Human-readable explanation
    """
    try:
        prediction = model.predict(request)
        return prediction
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed")

@app.post("/batch-predict")
async def batch_predict(requests: list[MLPredictionRequest]):
    """
    Batch predict fraud for multiple transactions
    """
    try:
        predictions = [model.predict(req) for req in requests]
        return {"predictions": predictions}
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail="Batch prediction failed")

@app.get("/model/status", response_model=ModelStatus)
async def model_status():
    """Get model status"""
    return ModelStatus(
        status="ready",
        model_path=os.getenv("MODEL_PATH", "./models"),
        last_updated="2024-01-01T00:00:00Z"
    )

@app.post("/model/retrain")
async def retrain_model():
    """Trigger model retraining"""
    logger.info("Model retraining requested")
    return {"status": "retraining_started"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
