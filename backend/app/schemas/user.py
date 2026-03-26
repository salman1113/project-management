from pydantic import BaseModel, EmailStr
from app.models.user import RoleEnum

# Used when CREATING a user (incoming request)
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.developer

# Used when RETURNING user data (outgoing response)
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum

    class Config:
        from_attributes = True  # Allows SQLAlchemy model → Pydantic conversion