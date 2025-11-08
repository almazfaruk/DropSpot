# app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import database, models, schemas, crud, auth
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="DropSpot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    database.init_db()

# Auth endpoints
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@app.post("/auth/signup", response_model=schemas.UserOut)
def signup(data: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    existing = crud.get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    password_hash = auth.hash_password(data.password)
    user = crud.create_user(db, email=data.email, password_hash=password_hash)
    return user

@app.post("/auth/token", response_model=TokenResponse)
def login(form_data: dict, db: Session = Depends(auth.get_db)):
    email = form_data.get("email")
    password = form_data.get("password")
    user = crud.get_user_by_email(db, email)
    if not user or not auth.verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token({"sub": user.id})
    return {"access_token": token}


