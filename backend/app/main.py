from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import Base, engine

from app.routes import (
    student_routes,
    auth_routes,
    ml_routes
)

# CREATE DATABASE TABLES

Base.metadata.create_all(bind=engine)

# CREATE FASTAPI APP

app = FastAPI()

# CORS CONFIGURATION

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)

# ROUTES

app.include_router(student_routes.router)

app.include_router(auth_routes.router)

app.include_router(ml_routes.router)

# ROOT ROUTE

@app.get("/")

def root():

    return {
        "message":
        "AI Student Analytics Backend Running"
    }