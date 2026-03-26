from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.schemas.task import (
    TaskCreate,
    TaskAssign,
    TaskStatusUpdate,
    TaskResponse
)
from app.services.task_service import (
    create_task,
    assign_task,
    update_task_status,
    get_tasks
)
from app.models.task import StatusEnum
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("/", response_model=TaskResponse, status_code=201)
def create_new_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task inside a project.
    """
    return create_task(db, task_data, current_user.id)


@router.patch("/{task_id}/assign", response_model=TaskResponse)
def assign_task_to_user(
    task_id: int,
    assign_data: TaskAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Assign a task to a user.
    """
    return assign_task(db, task_id, assign_data.assigned_to)


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_status(
    task_id: int,
    status_data: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update task status: todo / in_progress / done
    """
    return update_task_status(db, task_id, status_data.status)


@router.get("/", status_code=200)
def list_tasks(
    page: int = 1,
    page_size: int = 10,
    # Optional filters — all three can be used together
    project_id: Optional[int] = Query(None, description="Filter by project"),
    status: Optional[StatusEnum] = Query(None, description="Filter by status"),
    assigned_to: Optional[int] = Query(None, description="Filter by user"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List tasks with optional filters:
    - ?project_id=1
    - ?status=todo
    - ?assigned_to=2
    - ?project_id=1&status=in_progress&assigned_to=2
    All combined with pagination.
    """
    return get_tasks(db, page, page_size, project_id, status, assigned_to)