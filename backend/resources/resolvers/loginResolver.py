from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.models import User
from resources.utils import hash_password, create_access_token, verify_password
from models.inputtypes.loginInputType import RegisterInput 




def register_resolver(input: RegisterInput) -> str:
    db: Session = SessionLocal()

    try:
        existing_user = db.query(User).filter(User.email == input.email).first()
        if existing_user:
            raise Exception("User with this Email already registered")

        user = User(
            name=input.name,
            email=input.email,
            password=hash_password(input.password),
            address=input.address,
            role="user"
        )

        db.add(user)
        db.commit()

        return f"User {input.name} registered successfully"

    finally:
        db.close()



def login_resolver(input) -> str:
    db: Session = SessionLocal()

    try:
        user = db.query(User).filter(
            User.email == input.email,
            User.status == "active"
        ).first()

        if not user or not verify_password(input.password, user.password):
            raise Exception("Invalid email or password")

        token = create_access_token({
            "user_id": user.id,
            "role": user.role
        })

        return token
    finally:
        db.close()
