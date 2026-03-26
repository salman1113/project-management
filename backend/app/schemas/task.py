from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum

class StatusEnum(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

# Used when CREATING a task
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None

# Used when ASSIGNING a task to a user
class TaskAssign(BaseModel):
    assigned_to: int

# Used when UPDATING task status
class TaskStatusUpdate(BaseModel):
    status: StatusEnum

# Used when RETURNING task data
class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: StatusEnum
    project_id: int
    assigned_to: Optional[int]
    due_date: Optional[date]

    class Config:
        from_attributes = True

# Used for PAGINATED list responses
class PaginatedTaskResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[TaskResponse]