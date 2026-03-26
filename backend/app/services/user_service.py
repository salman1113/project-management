from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password

def create_user(db: Session, user_data: UserCreate):
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password before saving
    hashed = hash_password(user_data.password)
    
    # Create new user object
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()          # Save to database
    db.refresh(new_user) # Get the new ID back
    return new_user


def get_all_users(db: Session, page: int = 1, page_size: int = 10):
    # Calculate how many records to skip
    skip = (page - 1) * page_size
    
    total = db.query(User).count()
    users = db.query(User).offset(skip).limit(page_size).all()
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": users
    }


def get_user_by_id(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user