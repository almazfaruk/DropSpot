# app/crud.py
from sqlalchemy.orm import Session
from sqlalchemy import and_
from . import models
import secrets

def create_user(db: Session, email: str, password_hash: str, is_admin: bool=False):
    user = models.User(email=email, password_hash=password_hash, is_admin=is_admin)
    db.add(user); db.commit(); db.refresh(user)
    return user

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

