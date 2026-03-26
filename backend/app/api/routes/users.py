from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import create_user, get_all_users
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User
from typing import List

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=201)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Create / Register a new user.
    No auth required — public endpoint.
    """
    return create_user(db, user_data)


@router.get("/", status_code=200)
def list_users(
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # must be logged in
):
    """
    List all users with pagination.
    Requires login.
    """
    return get_all_users(db, page, page_size)


@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get the currently logged in user's profile.
    """
    return current_user