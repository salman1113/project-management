from sqlalchemy import Column, Integer, String, Enum
from app.db.database import Base
import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    developer = "developer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.developer)