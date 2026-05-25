from fastapi import APIRouter

router = APIRouter()

@router.get("/risk")
def detect_risk(attendance: float, cgpa: float):

    if attendance < 60 or cgpa < 6:
        risk = "HIGH"

    elif attendance < 75 or cgpa < 7.5:
        risk = "MEDIUM"

    else:
        risk = "LOW"

    return {
        "attendance": attendance,
        "cgpa": cgpa,
        "risk_level": risk
    }