
import strawberry

from models.inputtypes.userInputType import UserInput , UserType


from resources.resolvers.userResolver import (

    get_user_resolver ,
    get_all_users_resolver ,
    create_user_resolver ,
    update_user_resolver ,
    delete_user_resolver
)

@strawberry.type
class Query:
    @strawberry.field
    def get_user(self, user_id: int, info) -> UserType:
        return get_user_resolver(user_id, info)

    @strawberry.field
    def get_all_users(self, info) -> list[UserType]:
        return get_all_users_resolver(info)


@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_user(self, input: UserInput, info) -> UserType:
        return create_user_resolver(input, info)

    @strawberry.mutation
    def update_user(self, user_id: int, input: UserInput, info) -> UserType:
        return update_user_resolver(user_id, input, info)

    @strawberry.mutation
    def delete_user(self, user_id: int, info) -> str:
        return delete_user_resolver(user_id, info)

schema = strawberry.Schema(query=Query, mutation=Mutation)