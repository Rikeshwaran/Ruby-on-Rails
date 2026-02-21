from typing import Optional

import strawberry

@strawberry.input
class RatingsInput:
    user_id: Optional[int] = None
    store_id: Optional[int] = None
    rating: Optional[int] = None

@strawberry.type
class RatingsType:
    id: int
    user_id: int
    store_id: int
    rating: int
    status: str