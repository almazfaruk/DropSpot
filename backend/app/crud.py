# app/crud.py
from sqlalchemy.orm import Session
from sqlalchemy import and_
from . import models
import secrets
from datetime import datetime, timezone
from fastapi import HTTPException

def create_user(db: Session, email: str, password_hash: str, is_admin: bool=False):
    user = models.User(email=email, password_hash=password_hash, is_admin=is_admin)
    db.add(user); db.commit(); db.refresh(user)
    return user

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def list_active_drops(db: Session):
    now = datetime.now(timezone.utc)
    return db.query(models.Drop).filter(models.Drop.claim_window_end > now).all()

def join_waitlist(db: Session, user_id: str, drop_id: str, priority_score: int):
    existing = db.query(models.Waitlist).filter(and_(models.Waitlist.user_id==user_id, models.Waitlist.drop_id==drop_id)).first()
    if existing:
        return existing, False
    wl = models.Waitlist(user_id=user_id, drop_id=drop_id, priority_score=priority_score)
    db.add(wl)
    try:
        db.commit()
    except Exception:
        db.rollback()
        existing = db.query(models.Waitlist).filter(and_(models.Waitlist.user_id==user_id, models.Waitlist.drop_id==drop_id)).first()
        if existing:
            return existing, False
        raise
    db.refresh(wl)
    return wl, True

def leave_waitlist(db: Session, user_id: str, drop_id: str):
    deleted = db.query(models.Waitlist).filter(and_(models.Waitlist.user_id==user_id, models.Waitlist.drop_id==drop_id)).delete()
    db.commit()
    return deleted

def claim_drop(db: Session, user_id: str, drop_id: str):
    existing_claim = db.query(models.Claim).filter(
        and_(models.Claim.user_id == user_id, models.Claim.drop_id == drop_id)
    ).first()
    if existing_claim:
        return existing_claim, False
    
    
    drop = db.query(models.Drop).filter(models.Drop.id == drop_id).first()
    if not drop:
        raise ValueError("Drop bulunamadı")

    wl = db.query(models.Waitlist).filter(
        and_(models.Waitlist.user_id == user_id, models.Waitlist.drop_id == drop_id)
    ).first()
    if not wl:
        raise ValueError(" waitlist'te değilsiniz!")


    now = datetime.now(timezone.utc)
    if drop.claim_window_start and drop.claim_window_end:
        drop.claim_window_start = drop.claim_window_start.replace(tzinfo=timezone.utc)
        drop.claim_window_end = drop.claim_window_end.replace(tzinfo=timezone.utc)
        if not (drop.claim_window_start <= now <= drop.claim_window_end):
            raise HTTPException(status_code=400, detail="Henüz Claim açık değil veya Claim süresi dolmuş.")

    if drop.remaining_slots is None or drop.remaining_slots <= 0:
        raise HTTPException(status_code=400, detail="Stok kalmamış. Claim yapılamaz.")

    top_waitlist = (
        db.query(models.Waitlist)
        .filter(models.Waitlist.drop_id == drop_id)
        .order_by(models.Waitlist.priority_score.desc())
        .limit(drop.remaining_slots)
        .all()
    )

    allowed_user_ids = [w.user_id for w in top_waitlist]
    if user_id not in allowed_user_ids:
        raise HTTPException(status_code=403, detail="Claim için öncelik sıralaman yeterli değil.")

    claim_code = secrets.token_urlsafe(16)
    claim = models.Claim(
        user_id=user_id,
        drop_id=drop_id,
        claim_code=claim_code,
    )
    db.add(claim)
    wl.claimed = True
    drop.remaining_slots -= 1  

    try:
        db.commit()
    except Exception:
        db.rollback()
        existing_claim = db.query(models.Claim).filter(
            and_(models.Claim.user_id == user_id, models.Claim.drop_id == drop_id)
        ).first()
        if existing_claim:
            return existing_claim, False
        raise

    db.refresh(claim)
    return claim, True
