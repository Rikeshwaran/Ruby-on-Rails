import strawberry

from models.inputtypes.storeInputType import StoreInput , StoreType
from resources.resolvers.storeResolver import (
    get_store_resolver ,
    get_all_stores_resolver ,
    create_store_resolver ,
    update_store_resolver ,
    delete_store_resolver
)

@strawberry.type
class Query:
    @strawberry.field
    def get_store(self, store_id: int, info) -> StoreType:
        return get_store_resolver(store_id, info)

    @strawberry.field
    def get_all_stores(self, info) -> list[StoreType]:
        return get_all_stores_resolver(info)

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_store(self, input: StoreInput, info) -> StoreType:
        return create_store_resolver(input, info)

    @strawberry.mutation
    def update_store(self, store_id: int, input: StoreInput, info) -> StoreType:
        return update_store_resolver(store_id, input, info)

    @strawberry.mutation
    def delete_store(self, store_id: int, info) -> str:
        return delete_store_resolver(store_id, info)
    
schema = strawberry.Schema(query=Query, mutation=Mutation)