from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from fastapi.openapi.utils import get_openapi
from app.api import api_router
from app.db.database import Base, engine
import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Project Management API",
    description="A mini project management system built with FastAPI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# This fixes Swagger to show a simple token input box
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Project Management API",
        version="1.0.0",
        description="A mini project management system built with FastAPI",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi_schema = None
app.openapi = custom_openapi

@app.get("/", tags=["Root"])
def root():
    return {"message": "Project Management API is running!"}