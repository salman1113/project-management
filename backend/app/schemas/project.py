from pydantic import BaseModel
from typing import Optional
from app.schemas.user import UserResponse

# Used when CREATING a project
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

# Used when UPDATING a project (all fields optional)
class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# Used when RETURNING project data
class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int

    class Config:
        from_attributes = True