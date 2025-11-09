# app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import database, models, schemas, crud, auth
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import uuid
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

@app.get("/drops", response_model=list[schemas.DropOut])
def get_drops(db: Session = Depends(auth.get_db)):
    drops = crud.list_active_drops(db)
    return drops

@app.post("/drops/{drop_id}/join")
def join(drop_id: str, user=Depends(auth.get_current_user), db: Session = Depends(auth.get_db)):
    seed = "7a53e0321fe0"
    A = 5 + (int(seed[0:2], 16) % 4)
    B = 10 + (int(seed[3:5], 16) % 6)
    C = 2 + (int(seed[6:8], 16) % 3)

    signup_latency_ms = (int(uuid.UUID(user.id)) * 101) % 1000
    account_age_days = (datetime.utcnow() - user.created_at).days if user.created_at else 0
    rapid_actions = db.query(models.Waitlist).filter_by(user_id=user.id).count()

    base = 20 + (int(seed[-2:], 16) % 10)  # 20–30 arası değer gelicek
    priority_score = base + ((account_age_days // A) + (signup_latency_ms % B)) + (rapid_actions * C)
    priority_score = max(priority_score, 0)

    wl, created = crud.join_waitlist(db, user.id, drop_id, priority_score)
    if not created:
        return {"status": "Bu Drop'a Daha önce katıldınız", "priority_score": wl.priority_score}

    return {"status": "Drop'a kayıt başarılı", "waitlist_id": wl.id, "priority_score": priority_score}

@app.post("/drops/{drop_id}/leave")
def leave(drop_id: str, user=Depends(auth.get_current_user), db: Session = Depends(auth.get_db)):
    deleted = crud.leave_waitlist(db, user.id, drop_id)
    if deleted:
        return {"status": "Droptan ayrıldınız"}
    return {"status": "Bu Drop'da kayıtlı değilsiniz"}

@app.post("/drops/{drop_id}/claim")
def claim(drop_id: str, user=Depends(auth.get_current_user), db: Session = Depends(auth.get_db)):
    try:
        claim_obj, created = crud.claim_drop(db, user.id, drop_id)
        return {
            "claim_code": claim_obj.claim_code,
            "created": created,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/droplist", response_model=list[schemas.DropOut])
def get_drops(admin=Depends(auth.require_admin),db: Session = Depends(auth.get_db)):
    drops = crud.list_all_drops(db)
    return drops

@app.post("/admin/drops", response_model=schemas.DropOut)
def admin_create_drop(drop_in: schemas.DropCreate, admin=Depends(auth.require_admin), db: Session = Depends(auth.get_db)):
    drop = crud.create_drop(db, drop_in.dict())
    return drop

@app.put("/admin/drops/{drop_id}", response_model=schemas.DropOut)
def admin_update_drop(drop_id: str, drop_in: schemas.DropCreate, admin=Depends(auth.require_admin), db: Session = Depends(auth.get_db)):
    drop = db.query(models.Drop).filter(models.Drop.id == drop_id).first()
    if not drop:
        raise HTTPException(status_code=404, detail="Drop not found")
    for k,v in drop_in.dict().items():
        setattr(drop, k, v)
    db.add(drop); db.commit(); db.refresh(drop)
    return drop

@app.delete("/admin/drops/{drop_id}")
def admin_delete_drop(drop_id: str, admin=Depends(auth.require_admin), db: Session = Depends(auth.get_db)):
    deleted = db.query(models.Drop).filter(models.Drop.id == drop_id).delete()
    db.commit()
    if not deleted:
        raise HTTPException(status_code=404, detail="Drop not found")
    return {"status": "deleted"}
