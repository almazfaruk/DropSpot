from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./dropspot.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    # Import burada yapılacak, ama fonksiyon çağrılmadan yapılmayacak
    import app.models  # dikkat: . yerine app.models yazıyoruz
    Base.metadata.create_all(bind=engine)
