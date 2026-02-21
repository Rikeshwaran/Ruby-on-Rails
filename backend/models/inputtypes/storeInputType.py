from typing import Optional

import strawberry

@strawberry.input
class StoreInput:
    name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    owner_id: Optional[int] = None


@strawberry.type
class StoreType:
    id: int
    name: str
    email: str
    address: str
    owner_id: int
    status: str