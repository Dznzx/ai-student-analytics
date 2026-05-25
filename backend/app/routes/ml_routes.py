from fastapi import APIRouter
import joblib
import numpy as np

router = APIRouter()


# LOAD MODEL

model = joblib.load(
    "app/ml/student_risk_model.pkl"
)


# PREDICTION ROUTE

@router.post("/predict")

def predict_risk(data: dict):

    attendance = data["attendance"]
    cgpa = data["cgpa"]

    features = np.array([
        [attendance, cgpa]
    ])

    prediction = model.predict(features)[0]

    probability = model.predict_proba(features)[0][1]

    result = "HIGH RISK"

    if prediction == 0:
        result = "LOW RISK"

    return {

        "prediction": result,

        "risk_probability":
        round(probability * 100, 2)

    }