from fastapi import APIRouter, UploadFile, File
from app.database.db import SessionLocal
from app.models.student import Student
from app.schemas.student_schema import StudentCreate

import pandas as pd

router = APIRouter()


# CREATE STUDENT

@router.post("/students")
def create_student(student: StudentCreate):

    db = SessionLocal()

    new_student = Student(

        name=student.name,
        reg_no=student.reg_no,
        department=student.department,
        attendance=student.attendance,
        cgpa=student.cgpa

    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


# GET ALL STUDENTS

@router.get("/students")
def get_students():

    db = SessionLocal()

    students = db.query(Student).all()

    return students


# DELETE STUDENT

@router.delete("/students/{student_id}")
def delete_student(student_id: int):

    db = SessionLocal()

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not student:

        return {
            "message": "Student not found"
        }

    db.delete(student)
    db.commit()

    return {
        "message": "Student deleted successfully"
    }


# UPDATE STUDENT

@router.put("/students/{student_id}")
def update_student(
    student_id: int,
    updated_data: StudentCreate
):

    db = SessionLocal()

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not student:

        return {
            "message": "Student not found"
        }

    student.name = updated_data.name
    student.reg_no = updated_data.reg_no
    student.department = updated_data.department
    student.attendance = updated_data.attendance
    student.cgpa = updated_data.cgpa

    db.commit()

    return {
        "message": "Student updated successfully"
    }


# CSV BULK UPLOAD

@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...)
):

    db = SessionLocal()

    df = pd.read_csv(file.file)

    for _, row in df.iterrows():

        student = Student(

            name=row["name"],
            reg_no=row["reg_no"],
            department=row["department"],
            attendance=row["attendance"],
            cgpa=row["cgpa"]

        )

        db.add(student)

    db.commit()

    return {
        "message": "CSV uploaded successfully"
    }