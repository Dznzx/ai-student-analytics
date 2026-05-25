from fastapi import APIRouter
import pickle
import numpy as np

router = APIRouter()

# Load trained model
with open("student_model.pkl", "rb") as f:
    model = pickle.load(f)

@router.get("/predict")
def predict_cgpa(attendance: float, study_hours: float):

    prediction = model.predict(
        np.array([[attendance, study_hours]])
    )

    return {
        "predicted_cgpa": round(float(prediction[0]), 2)
    }