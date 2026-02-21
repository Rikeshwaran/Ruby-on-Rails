import strawberry

from models.inputtypes.userInputType import UserType

@strawberry.input
class RegisterInput:
    name: str
    email: str
    password: str
    address: str = None


@strawberry.input
class LoginInput:
    email: str
    password: str

