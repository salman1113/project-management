from fastapi import APIRouter
from app.api.routes import auth, users, projects, tasks

# Master router that includes all sub-routers
api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(projects.router)
api_router.include_router(tasks.router)