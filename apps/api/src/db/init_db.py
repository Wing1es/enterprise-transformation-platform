from db.base import Base
from db.session import engine
import db.models  # Registers all SQLAlchemy models with Base.metadata


def init_db():
    Base.metadata.create_all(bind=engine)