from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base


Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    address = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="user")

    status = Column(String(50), nullable=False, default="active")


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    address = Column(String(255), nullable=True)
    owner_id = Column(Integer, nullable=False)  

    status = Column(String(50), nullable=False, default="active")


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    store_id = Column(Integer, nullable=False)
    rating = Column(Integer, nullable=False) 

    status = Column(String(50), nullable=False, default="active")