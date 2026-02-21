from typing import Optional
import strawberry
@strawberry.input
class UserInput:
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    address: Optional[str] = None
    role: Optional[str] = None

@strawberry.type
class UserType:
    id: int
    name: str
    email: str
    password: str
    address: str
    role: str
    status: str