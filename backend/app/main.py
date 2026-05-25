from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router
from app.routes.student_routes import router as student_router
from app.routes.risk_routes import router as risk_router
from app.routes.ml_routes import router as ml_router
from app.database.db import engine
from app.models.user import Base

# CREATE DATABASE TABLES
Base.metadata.create_all(bind=engine)

# FASTAPI APP
app = FastAPI(
    title="AI Student Analytics API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-student-analytics.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTES
app.include_router(auth_router)
app.include_router(student_router)
app.include_router(risk_router)
app.include_router(ml_router)

# ROOT
@app.get("/")
def root():

    return {
        "message": "AI Student Analytics Backend Running Successfully"
    }