from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.project_service import (
    create_project,
    get_all_projects,
    get_project_by_id,
    update_project,
    delete_project
)
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse, status_code=201)
def create_new_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new project.
    The logged in user becomes the creator.
    """
    return create_project(db, project_data, current_user.id)


@router.get("/", status_code=200)
def list_projects(
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all projects with pagination.
    """
    return get_all_projects(db, page, page_size)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_single_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a single project by ID.
    """
    return get_project_by_id(db, project_id)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_existing_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a project.
    Only the creator can update.
    """
    return update_project(db, project_id, project_data, current_user.id)


@router.delete("/{project_id}", status_code=200)
def delete_existing_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a project.
    Only the creator can delete.
    """
    return delete_project(db, project_id, current_user.id)