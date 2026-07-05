from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes.auth_routes import router as auth_router
from app.routes.student_routes import router as student_router
from app.routes.risk_routes import router as risk_router
from app.routes.ml_routes import router as ml_router
from app.database.db import engine
from app.models.user import Base

# CREATE DATABASE TABLES
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Student Analytics API", version="1.0.0")

# CORS — allow localhost dev + all Vercel preview/production URLs
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ai-student-analytics.vercel.app",
    "https://ai-student-analytics-git-main-dznzx.vercel.app",
]

# Also read from env so you can add more later without redeploying
extra = os.environ.get("ALLOWED_ORIGINS", "")
if extra:
    ALLOWED_ORIGINS += [o.strip() for o in extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://ai-student-analytics.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(risk_router)
app.include_router(ml_router)

@app.get("/")
def root():
    return {"message": "AI Student Analytics Backend Running Successfully"}

@app.get("/health")
def health():
    return {"status": "ok"}
