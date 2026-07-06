from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.db import Base

class StudentHistory(Base):
    __tablename__ = "student_history"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), index=True)
    attendance = Column(Float)
    cgpa = Column(Float)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
