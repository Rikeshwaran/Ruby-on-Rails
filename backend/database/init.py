from database.database import engine
from models.models import Base

def init_db():
    Base.metadata.create_all(bind=engine)