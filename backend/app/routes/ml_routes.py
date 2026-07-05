from fastapi import APIRouter
import joblib
import numpy as np
import os

router = APIRouter()

# Load model using absolute path so it works on Render
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "ml", "student_risk_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
    print(f"✓ ML model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"✗ ML model load failed: {e}")
    model = None

@router.post("/predict")
def predict_risk(data: dict):
    if model is None:
        return {"prediction": "UNKNOWN", "risk_probability": 0, "error": "Model not loaded"}

    attendance = float(data.get("attendance", 0))
    cgpa = float(data.get("cgpa", 0))

    features = np.array([[attendance, cgpa]])

    try:
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]
        result = "LOW RISK" if prediction == 0 else "HIGH RISK"
        return {
            "prediction": result,
            "risk_probability": round(float(probability) * 100, 2)
        }
    except Exception as e:
        return {"prediction": "UNKNOWN", "risk_probability": 0, "error": str(e)}
