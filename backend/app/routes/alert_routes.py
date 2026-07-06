import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import APIRouter, Depends, HTTPException

from app.database.db import SessionLocal
from app.models.student import Student
from app.utils.security import get_current_user

router = APIRouter()

SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASS = os.environ.get("SMTP_PASS")
ALERT_EMAIL_TO = os.environ.get("ALERT_EMAIL_TO")


@router.post("/alerts/send-high-risk")
def send_high_risk_alerts(current_user: dict = Depends(get_current_user)):
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASS, ALERT_EMAIL_TO]):
        raise HTTPException(
            status_code=500,
            detail=(
                "Email alerts aren't configured yet. Set SMTP_HOST, SMTP_PORT, "
                "SMTP_USER, SMTP_PASS, and ALERT_EMAIL_TO as environment variables "
                "on your backend host."
            ),
        )

    db = SessionLocal()
    try:
        students = db.query(Student).all()
        high_risk = [s for s in students if s.cgpa < 7 or s.attendance < 75]

        if not high_risk:
            return {"message": "No high-risk students to report right now."}

        lines = [
            f"{s.name} ({s.reg_no}, {s.department}) — CGPA: {s.cgpa}, Attendance: {s.attendance}%"
            for s in high_risk
        ]
        body = "The following students are currently flagged as high risk:\n\n" + "\n".join(lines)

        msg = MIMEMultipart()
        msg["From"] = SMTP_USER
        msg["To"] = ALERT_EMAIL_TO
        msg["Subject"] = f"AI Student Analytics — {len(high_risk)} High-Risk Student Alert"
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, ALERT_EMAIL_TO, msg.as_string())

        return {"message": f"Alert email sent for {len(high_risk)} high-risk student(s)."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send alert email: {str(e)}")
    finally:
        db.close()
