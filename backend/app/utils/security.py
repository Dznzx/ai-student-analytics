import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Header, HTTPException, Depends
from passlib.context import CryptContext

SECRET_KEY = os.environ.get("SECRET_KEY", "veltron-ai-analytics-secret-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
RESET_TOKEN_EXPIRE_MINUTES = 15

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(email: str, role: str = "admin"):
    payload = {
        "sub": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_reset_token(email: str):
    payload = {
        "sub": email,
        "type": "reset",
        "exp": datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_reset_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "reset":
            return None
        return payload.get("sub")
    except JWTError:
        return None


def get_current_user(authorization: str = Header(None)):
    """FastAPI dependency — verifies the Bearer token on every protected route.
    Raises 401 if the header is missing, malformed, or the token is expired/invalid.
    The frontend treats any 401 as 'session expired' and redirects to login."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("sub"):
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")


def require_admin(current_user: dict = Depends(get_current_user)):
    """Stricter dependency — only allows users whose token role is 'admin'."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required for this action")
    return current_user
