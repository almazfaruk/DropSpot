from sqlalchemy.orm import Session
from app import models, database
from app.auth import hash_password  # varsa kendi şifreleme fonksiyonunu kullan
# yoksa aşağıdaki gibi bir örnek yazabilirsin



def create_admin():
    db: Session = database.SessionLocal()
    admin_email = "admin@gmail.com"
    admin_password = "123"

    # Aynı email varsa tekrar ekleme
    existing = db.query(models.User).filter(models.User.email == admin_email).first()
    if existing:
        print("Admin zaten mevcut.")
        return

    admin_user = models.User(
        email=admin_email,
        password_hash=hash_password(admin_password),
        is_admin=True,
    )
    db.add(admin_user)
    db.commit()
    print("✅ Admin oluşturuldu:", admin_email)

if __name__ == "__main__":
    create_admin()
