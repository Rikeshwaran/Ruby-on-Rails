import strawberry

from models.inputtypes.ratingsInputType import RatingsInput , RatingsType
from resources.resolvers.ratingResolver import (
    get_all_ratings_resolver ,
    get_user_ratings_resolver ,
    create_rating_resolver ,
    update_rating_resolver ,
    delete_rating_resolver
)

@strawberry.type
class Query:

    @strawberry.field
    def get_all_ratings(self, info) -> list[RatingsType]:
        return get_all_ratings_resolver(info)
    @strawberry.field
    def get_user_ratings(self, user_id: int, info) -> list[RatingsType]:
        return get_user_ratings_resolver(user_id, info)

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_rating(self, input: RatingsInput, info) -> RatingsType:
        return create_rating_resolver(input, info)

    @strawberry.mutation
    def update_rating(self, rating_id: int, input: RatingsInput, info) -> RatingsType:
        return update_rating_resolver(rating_id, input, info)

    @strawberry.mutation
    def delete_rating(self, rating_id: int, info) -> str:
        return delete_rating_resolver(rating_id, info)
    
schema = strawberry.Schema(query=Query, mutation=Mutation)