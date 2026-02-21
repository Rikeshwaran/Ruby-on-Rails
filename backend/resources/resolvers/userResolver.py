from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.models import User
from resources.utils import (
    get_user_id_from_context,
    hash_password
)
from models.inputtypes.userInputType import UserInput



def get_user_resolver(user_id: int, info):
    
    db: Session = SessionLocal()
    try:
        get_user_id_from_context(info.context)

        user = db.query(User).filter(
            User.id == user_id,
            User.status == "active"
        ).first()

        if not user:
            raise Exception("User not found")

        return user
    finally:
        db.close()
def get_all_users_resolver(info):
    db: Session = SessionLocal()
    try:
        get_user_id_from_context(info.context)


        return db.query(User).filter(
            User.status == "active"
        ).all()
    finally:
        db.close()
def create_user_resolver(input: UserInput, info):
    db: Session = SessionLocal()
    try:
        get_user_id_from_context(info.context)

        existing_user = db.query(User).filter(
            User.email == input.email
        ).first()

        if existing_user:
            raise Exception("Email already exists")

        user = User(
            name=input.name,
            email=input.email,
            password=hash_password(input.password),
            address=input.address,
            role=input.role,
            status="active"
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user
    finally:
        db.close()





def update_user_resolver(user_id: int, input: UserInput, info):
    db: Session = SessionLocal()
    try:
        get_user_id_from_context(info.context)

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise Exception("User not found")

        user.name = input.name or user.name
        user.email = input.email or user.email
        user.address = input.address or user.address
        user.role = input.role or user.role
        user.status = "active"

        if input.password:
            user.password = hash_password(input.password) or user.password

        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()





        
# only for API testing









def delete_user_resolver(user_id: int, info) -> str:
    db: Session = SessionLocal()
    try:
        get_user_id_from_context(info.context)

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise Exception("User not found")

        user.status = "inactive"
        db.commit()

        return "User deleted successfully"
    finally:
        db.close()
