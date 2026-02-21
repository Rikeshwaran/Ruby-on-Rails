# get_store_ratings_resolver ,
#     get_user_ratings_resolver,
#     create_rating_resolver ,
#     update_rating_resolver ,
#     delete_rating_resolver

from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.models import Rating, Store, User
from models.inputtypes.ratingsInputType import RatingsInput
from resources.utils import get_user_id_from_context


def get_all_ratings_resolver(info):
    db: Session = SessionLocal()
    try:
        get_user_id_from_context(info.context)

        return db.query(Rating).filter(
            Rating.status == "active"
        ).all()
    finally:
        db.close()


def get_user_ratings_resolver(user_id: int, info):
    db: Session = SessionLocal()
    try:
        get_user_id_from_context(info.context)

        return db.query(Rating).filter(
            Rating.user_id == user_id,
            Rating.status == "active"
        ).all()
    finally:
        db.close()

def create_rating_resolver(input: RatingsInput, info):
    db: Session = SessionLocal()
    try:
        user_id = get_user_id_from_context(info.context)

        user = db.query(User).filter(
            User.id == user_id,
            User.status == "active"
        ).first()
        if not user:
            raise Exception("User not found")
        
        store = db.query(Store).filter(
            Store.id == input.store_id,
            Store.status == "active"
        ).first()
        if not store:
            raise Exception("Store not found")

        rating = Rating(
            user_id=user_id,
            store_id=input.store_id,
            rating=input.rating,
            status="active"
        )

        db.add(rating)
        db.commit()
        db.refresh(rating)

        return rating
    finally:
        db.close()

def update_rating_resolver(rating_id: int, input: RatingsInput, info):
    db: Session = SessionLocal()
    try:
        user_id = get_user_id_from_context(info.context)

        rating = db.query(Rating).filter(
            Rating.id == rating_id,
            Rating.status == "active"
        ).first()
        if not rating:
            raise Exception("Rating not found")
        if rating.user_id != user_id:
            raise Exception("You can only update your own ratings")

        rating.rating = input.rating or rating.rating
        rating.status = "active"

        db.commit()
        db.refresh(rating)
        return rating
    finally:
        db.close()

# for develiopement purpose only, in production we will not delete the rating but just mark it as inactive 

# only for API testing
def delete_rating_resolver(rating_id: int, info):
    db: Session = SessionLocal()
    try:
        user_id = get_user_id_from_context(info.context)

        rating = db.query(Rating).filter(
            Rating.id == rating_id,
            Rating.status == "active"
        ).first()
        if not rating:
            raise Exception("Rating not found")
        if rating.user_id != user_id:
            raise Exception("You can only delete your own ratings")

        rating.status = "inactive"

        db.commit()
        return "Rating deleted successfully"
    finally:
        db.close()