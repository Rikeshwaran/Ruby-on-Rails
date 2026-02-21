from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.models import Store, User
from models.inputtypes.storeInputType import StoreInput
from resources.utils import get_user_id_from_context


def get_store_resolver(store_id: int, info):
    db: Session = SessionLocal()
    try:
        get_user_id_from_context(info.context)

        store = db.query(Store).filter(
            Store.id == store_id,
            Store.status == "active"
        ).first()

        if not store:
            raise Exception("Store not found")

        return store
    finally:
        db.close()

def get_all_stores_resolver(info):
    db: Session = SessionLocal()
    try:
        get_user_id_from_context(info.context)

        return db.query(Store).filter(
            Store.status == "active"
        ).all()
    finally:
        db.close()


def create_store_resolver(input: StoreInput, info):
    db: Session = SessionLocal()
    try:
        user_id = get_user_id_from_context(info.context)

        user = db.query(User).filter(
            User.id == user_id,
            User.status == "active"
        ).first()
        if not user:
            raise Exception("User not found")
        if user.role != "admin":
            raise Exception("Only admin can create a store")
        email_exists = db.query(Store).filter(
            Store.email == input.email
        ).first()
        if email_exists:
            raise Exception("Store email already exists")
        if not input.owner_id:
            raise Exception("Store owner ID is required")

        owner = db.query(User).filter(
            User.id == input.owner_id,
            User.status == "active"
        ).first()
        if not owner:
            raise Exception("Store owner not found")
        if owner.role != "storeowner":
            raise Exception("Selected user is not a store owner")
        existing_store = db.query(Store).filter(
            Store.owner_id == input.owner_id,
            Store.status == "active"
        ).first()
        if existing_store:
            raise Exception("This store owner already has a store. Each store owner can only have one store.")

        store = Store(
            name=input.name,
            email=input.email,
            address=input.address,
            owner_id=input.owner_id,
            status="active"
        )

        db.add(store)
        db.commit()
        db.refresh(store)

        return store

    finally:
        db.close()










# only for API testing








def update_store_resolver(store_id: int, input: StoreInput, info):
    db: Session = SessionLocal()
    try:
        user_id = get_user_id_from_context(info.context)
        store = db.query(Store).filter(
            Store.id == store_id,
            Store.status == "active"
        ).first()
        if not store:
            raise Exception("Store not found")
        if store.owner_id != user_id:
            raise Exception("Only the store owner can update the store")
        if input.email and input.email != store.email:
            email_exists = db.query(Store).filter(
                Store.email == input.email,
                Store.id != store_id 
            ).first()
            if email_exists:
                raise Exception("Store email already exists")
        if input.owner_id and input.owner_id != store.owner_id:
            new_owner = db.query(User).filter(
                User.id == input.owner_id,
                User.status == "active"
            ).first()
            if not new_owner:
                raise Exception("New store owner not found")
            if new_owner.role != "storeowner":
                raise Exception("Selected user is not a store owner")

            existing_store = db.query(Store).filter(
                Store.owner_id == input.owner_id,
                Store.status == "active",
                Store.id != store_id 
            ).first()
            if existing_store:
                raise Exception("This store owner already has a store. Each store owner can only have one store.")

            store.owner_id = input.owner_id

        store.name = input.name or store.name
        store.email = input.email or store.email
        store.address = input.address or store.address

        db.commit()
        db.refresh(store)
        return store
    finally:
        db.close()

def delete_store_resolver(store_id: int, info):
    db: Session = SessionLocal()
    try:
        user_id = get_user_id_from_context(info.context)

        store = db.query(Store).filter(
            Store.id == store_id,
            Store.status == "active"
        ).first()
        if not store:
            raise Exception("Store not found")
        
        store.status = "inactive"
        db.commit()
        return "Store deleted successfully"
    finally:
        db.close()