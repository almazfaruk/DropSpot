# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    is_admin: bool

    class Config:
        orm_mode = True

class DropCreate(BaseModel):
    title: str
    description: Optional[str] = None
    claim_window_start: Optional[datetime] = None
    claim_window_end: Optional[datetime] = None
    remaining_slots: int

class DropOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    claim_window_start: Optional[datetime]
    claim_window_end: Optional[datetime]
    remaining_slots: int

    class Config:
        orm_mode = True
