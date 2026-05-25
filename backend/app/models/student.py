from sqlalchemy import Column, Integer, String, Float
from app.database.db import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    reg_no = Column(String)
    department = Column(String)
    attendance = Column(Float)
    cgpa = Column(Float)