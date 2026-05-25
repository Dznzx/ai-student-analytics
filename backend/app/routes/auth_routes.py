from fastapi import APIRouter, HTTPException
from app.database.db import SessionLocal
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserLogin

from passlib.context import CryptContext

from jose import jwt
from datetime import datetime, timedelta

router = APIRouter()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

SECRET_KEY = "supersecretkey"

ALGORITHM = "HS256"


# SIGNUP

@router.post("/signup")
def signup(user: UserCreate):

    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = pwd_context.hash(
        user.password
    )

    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "User created successfully"
    }


# LOGIN

@router.post("/login")
def login(user: UserLogin):

    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid email"
        )

    if not pwd_context.verify(
        user.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid password"
        )

    token_data = {
        "sub": existing_user.email,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }

    token = jwt.encode(
        token_data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }