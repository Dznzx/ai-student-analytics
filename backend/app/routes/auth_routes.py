from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.db import SessionLocal
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserLogin
from app.utils.security import (
    pwd_context,
    create_access_token,
    create_reset_token,
    decode_reset_token,
)

router = APIRouter()


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/signup")
def signup(user: UserCreate):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == user.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed = pwd_context.hash(user.password)
        new_user = User(username=user.username, email=user.email, password=hashed, role="admin")
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
        role = existing.role or "admin"
        token = create_access_token(existing.email, role)
        return {"access_token": token, "token_type": "bearer", "role": role}
    finally:
        db.close()


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == payload.email).first()
        # Respond the same way regardless of whether the email exists,
        # so this endpoint can't be used to enumerate registered emails.
        if not existing:
            return {"message": "If that email is registered, a reset token has been generated."}

        token = create_reset_token(existing.email)
        # NOTE: no email service (SMTP) is configured yet, so the reset token
        # is returned directly here for you to test the flow end-to-end.
        # Once SMTP is set up, replace this with an actual email send and
        # stop returning the token in the response.
        return {
            "message": "If that email is registered, a reset token has been generated.",
            "reset_token": token,
        }
    finally:
        db.close()


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    email = decode_reset_token(payload.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if not existing:
            raise HTTPException(status_code=400, detail="User not found")
        existing.password = pwd_context.hash(payload.new_password)
        db.commit()
        return {"message": "Password updated successfully"}
    finally:
        db.close()
