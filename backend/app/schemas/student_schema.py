from pydantic import BaseModel

class StudentCreate(BaseModel):
    name: str
    reg_no: str
    department: str
    attendance: float
    cgpa: float