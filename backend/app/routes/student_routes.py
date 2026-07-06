from fastapi import APIRouter, UploadFile, File, Depends
from app.database.db import SessionLocal
from app.models.student import Student
from app.models.student_history import StudentHistory
from app.schemas.student_schema import StudentCreate
from app.utils.security import get_current_user, require_admin
import pandas as pd

router = APIRouter()


def _log_history(db, student):
    db.add(StudentHistory(student_id=student.id, attendance=student.attendance, cgpa=student.cgpa))


@router.post("/students")
def create_student(student: StudentCreate, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        new_student = Student(
            name=student.name, reg_no=student.reg_no,
            department=student.department,
            attendance=student.attendance, cgpa=student.cgpa
        )
        db.add(new_student)
        db.commit()
        db.refresh(new_student)
        _log_history(db, new_student)
        db.commit()
        return new_student
    finally:
        db.close()


@router.get("/students")
def get_students(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        return db.query(Student).all()
    finally:
        db.close()


@router.get("/students/{student_id}/history")
def get_student_history(student_id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        return (
            db.query(StudentHistory)
            .filter(StudentHistory.student_id == student_id)
            .order_by(StudentHistory.recorded_at)
            .all()
        )
    finally:
        db.close()


@router.delete("/students/{student_id}")
def delete_student(student_id: int, current_user: dict = Depends(require_admin)):
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return {"message": "Student not found"}
        db.delete(student)
        db.commit()
        return {"message": "Student deleted successfully"}
    finally:
        db.close()


@router.put("/students/{student_id}")
def update_student(student_id: int, updated_data: StudentCreate, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return {"message": "Student not found"}
        student.name = updated_data.name
        student.reg_no = updated_data.reg_no
        student.department = updated_data.department
        student.attendance = updated_data.attendance
        student.cgpa = updated_data.cgpa
        db.commit()
        _log_history(db, student)
        db.commit()
        return {"message": "Student updated successfully"}
    finally:
        db.close()


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        df = pd.read_csv(file.file)
        required_cols = {"name", "reg_no", "department", "attendance", "cgpa"}
        if not required_cols.issubset(df.columns):
            return {"message": f"CSV must have columns: {required_cols}"}
        count = 0
        for _, row in df.iterrows():
            student = Student(
                name=str(row["name"]), reg_no=str(row["reg_no"]),
                department=str(row["department"]),
                attendance=float(row["attendance"]), cgpa=float(row["cgpa"])
            )
            db.add(student)
            db.commit()
            db.refresh(student)
            _log_history(db, student)
            count += 1
        db.commit()
        return {"message": f"CSV uploaded successfully — {count} students added"}
    except Exception as e:
        return {"message": f"Upload failed: {str(e)}"}
    finally:
        db.close()
