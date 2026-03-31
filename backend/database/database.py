from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# DATABASE_URL = "mysql+mysqlconnector://root:2003@host.docker.internal/store_rating_db"
DATABASE_URL = "mysql+mysqlconnector://root:2003@db:3306/store_rating_db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

