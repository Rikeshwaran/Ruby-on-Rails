from fastapi import APIRouter
from strawberry.fastapi import GraphQLRouter
import strawberry


from resources.utils import get_context
from resources.controllers.loginController import Mutation as login_mutation
from resources.controllers.loginController import Query as login_query
from resources.controllers.userController import Query as user_query
from resources.controllers.userController import Mutation as user_mutation
from resources.controllers.storeController import Query as store_query
from resources.controllers.storeController import Mutation as store_mutation
from resources.controllers.ratingsController import Query as ratings_query
from resources.controllers.ratingsController import Mutation as ratings_mutation




@strawberry.type
class Query(
    login_query,
    user_query,
    store_query,
    ratings_query
):
    pass

@strawberry.type
class Mutation(
    login_mutation,
    user_mutation,
    store_mutation,
    ratings_mutation
):
    pass

schema = strawberry.Schema(query=Query, mutation=Mutation)

graphql_app = GraphQLRouter(schema,context_getter=get_context)
router = APIRouter()

router.include_router(graphql_app, prefix="/rateme")