# Project Management System

A full-stack mini project management system built with FastAPI, PostgreSQL, and Next.js.

## Tech Stack
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Frontend**: Next.js + Tailwind CSS
- **Auth**: JWT (JSON Web Tokens)

## Architecture
```
project-management/
├── backend/          # FastAPI application
│   └── app/
│       ├── api/      # Route handlers
│       ├── core/     # JWT, config, security
│       ├── db/       # Database connection
│       ├── models/   # SQLAlchemy models
│       ├── schemas/  # Pydantic schemas
│       └── services/ # Business logic
├── frontend/         # Next.js application
├── docker-compose.yml
└── README.md
```

## ER Diagram
```
users
├── id (PK)
├── name
├── email (unique)
├── password
└── role (admin/developer)

projects
├── id (PK)
├── name
├── description
└── created_by (FK → users.id)

tasks
├── id (PK)
├── title
├── description
├── status (todo/in_progress/done)
├── project_id (FK → projects.id)
├── assigned_to (FK → users.id)
└── due_date
```

## Setup

### Without Docker

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
# Create .env from .env.example and update values
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### With Docker
```bash
docker-compose up --build
```

## API Documentation
Swagger UI available at: `http://localhost:8000/docs`

## Environment Variables
See `.env.example` for required variables.

## Key Features
- JWT Authentication
- Role-based access (admin/developer)
- Full CRUD for Projects and Tasks
- Task filtering by project, status, assigned user
- Pagination on all list endpoints
- Interactive Swagger documentation