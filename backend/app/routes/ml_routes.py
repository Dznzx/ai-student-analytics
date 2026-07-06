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

ATTENDANCE_SAFE_THRESHOLD = 75.0
CGPA_SAFE_THRESHOLD = 7.0


def get_feature_weights():
    """(attendance_weight, cgpa_weight) — pulled from the model's own feature
    importances when available (tree-based models expose this), else an
    even 50/50 split as a safe fallback."""
    try:
        importances = model.feature_importances_
        total = float(importances[0]) + float(importances[1])
        if total == 0:
            return 0.5, 0.5
        return float(importances[0]) / total, float(importances[1]) / total
    except Exception:
        return 0.5, 0.5


def build_explanation(attendance, cgpa, prediction):
    att_weight, cgpa_weight = get_feature_weights()

    att_gap = max(0.0, ATTENDANCE_SAFE_THRESHOLD - attendance) / ATTENDANCE_SAFE_THRESHOLD
    cgpa_gap = max(0.0, CGPA_SAFE_THRESHOLD - cgpa) / CGPA_SAFE_THRESHOLD

    att_score = att_weight * att_gap
    cgpa_score = cgpa_weight * cgpa_gap
    total = att_score + cgpa_score

    if total == 0:
        primary = None
        att_pct = round(att_weight * 100)
        cgpa_pct = 100 - att_pct
    else:
        primary = "attendance" if att_score >= cgpa_score else "cgpa"
        att_pct = round((att_score / total) * 100)
        cgpa_pct = 100 - att_pct

    if primary is None:
        message = "Both attendance and CGPA are comfortably above the risk thresholds."
    elif primary == "attendance":
        message = (
            f"Attendance is the primary driver of this risk score ({att_pct}% contribution) — "
            f"it's below the {ATTENDANCE_SAFE_THRESHOLD:.0f}% safe threshold."
        )
    else:
        message = (
            f"CGPA is the primary driver of this risk score ({cgpa_pct}% contribution) — "
            f"it's below the {CGPA_SAFE_THRESHOLD:.1f} safe threshold."
        )

    return {
        "primary_factor": primary,
        "attendance_contribution_pct": att_pct,
        "cgpa_contribution_pct": cgpa_pct,
        "message": message,
    }


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
        explanation = build_explanation(attendance, cgpa, result)
        return {
            "prediction": result,
            "risk_probability": round(float(probability) * 100, 2),
            "explanation": explanation,
        }
    except Exception as e:
        return {"prediction": "UNKNOWN", "risk_probability": 0, "error": str(e)}
