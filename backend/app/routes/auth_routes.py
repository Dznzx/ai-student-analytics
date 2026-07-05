from fastapi import APIRouter, HTTPException
from app.database.db import SessionLocal
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserLogin
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.environ.get("SECRET_KEY", "veltron-ai-analytics-secret-2025")
ALGORITHM = "HS256"

@router.post("/signup")
def signup(user: UserCreate):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == user.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed = pwd_context.hash(user.password)
        new_user = User(username=user.username, email=user.email, password=hashed)
        db.add(new_user)
        db.commit()
        return {"message": "User created successfully"}
    finally:
        db.close()

@router.post("/login")
def login(user: UserLogin):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == user.email).first()
        if not existing:
            raise HTTPException(status_code=400, detail="Invalid email or password")
        if not pwd_context.verify(user.password, existing.password):
            raise HTTPException(status_code=400, detail="Invalid email or password")
        token = jwt.encode(
            {"sub": existing.email, "exp": datetime.utcnow() + timedelta(hours=24)},
            SECRET_KEY, algorithm=ALGORITHM
        )
        return {"access_token": token, "token_type": "bearer"}
    finally:
        db.close()
