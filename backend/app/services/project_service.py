from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

def create_project(db: Session, project_data: ProjectCreate, user_id: int):
    new_project = Project(
        name=project_data.name,
        description=project_data.description,
        created_by=user_id  # logged in user becomes the creator
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


def get_all_projects(db: Session, page: int = 1, page_size: int = 10):
    skip = (page - 1) * page_size
    
    total = db.query(Project).count()
    projects = db.query(Project).offset(skip).limit(page_size).all()
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": projects
    }


def get_project_by_id(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


def update_project(db: Session, project_id: int, project_data: ProjectUpdate, user_id: int):
    project = get_project_by_id(db, project_id)
    
    # Only the creator or admin can update
    if project.created_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )
    
    # Only update fields that were actually sent
    # exclude_unset=True means: ignore fields not included in request
    update_data = project_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: int, user_id: int):
    project = get_project_by_id(db, project_id)
    
    # Only the creator can delete
    if project.created_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this project"
        )
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}