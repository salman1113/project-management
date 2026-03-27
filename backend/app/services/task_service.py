from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
from app.models.task import Task, StatusEnum
from app.models.project import Project
from app.models.user import User
from app.schemas.task import TaskCreate

def create_task(db: Session, task_data: TaskCreate, user_id: int):
    # Check if the project exists
    project = db.query(Project).filter(Project.id == task_data.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # If assigned_to is given, check if that user exists
    if task_data.assigned_to:
        user = db.query(User).filter(User.id == task_data.assigned_to).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found"
            )
    
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        project_id=task_data.project_id,
        assigned_to=task_data.assigned_to,
        due_date=task_data.due_date,
        status=StatusEnum.todo  # Always starts as todo
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


def assign_task(db: Session, task_id: int, assigned_to: int, current_user: User):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can assign tasks"
        )
    # Check task exists
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task.status == StatusEnum.done:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a completed task"
        )
    
    # Check user exists
    user = db.query(User).filter(User.id == assigned_to).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    task.assigned_to = assigned_to
    db.commit()
    db.refresh(task)
    return task


def update_task_status(db: Session, task_id: int, new_status: StatusEnum, current_user: User):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
        
    if task.status == StatusEnum.done:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed tasks cannot be modified"
        )
        
    if current_user.role != "admin" and task.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task's status"
        )
    
    task.status = new_status
    db.commit()
    db.refresh(task)
    return task


def get_all_tasks(db: Session, page: int = 1, page_size: int = 10, 
                  project_id: int = None, status: StatusEnum = None, assigned_to: int = None, current_user: User = None):
    query = db.query(Task)
    
    if current_user and current_user.role != "admin":
        query = query.filter(Task.assigned_to == current_user.id)
        
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status is not None:
        query = query.filter(Task.status == status)
    if assigned_to and (not current_user or current_user.role == "admin"):
        query = query.filter(Task.assigned_to == assigned_to)
    
    # Pagination
    skip = (page - 1) * page_size
    total = query.count()
    tasks = query.offset(skip).limit(page_size).all()
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": tasks
    }