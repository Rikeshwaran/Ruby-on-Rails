import strawberry

from models.inputtypes.loginInputType import LoginInput , RegisterInput

from resources.resolvers.loginResolver import (
    login_resolver , 
    register_resolver
)


@strawberry.type
class Query:
    @strawberry.field
    def instruction(self) -> str:
        return "Register or Login to get access to the API"

@strawberry.type
class Mutation:
    @strawberry.mutation
    def login(self, input: LoginInput) -> str:
        return login_resolver(input)

    @strawberry.mutation
    def register(self, input: RegisterInput) -> str:
        return register_resolver(input)
    
    
    

schema = strawberry.Schema(query=Query, mutation=Mutation)