# Project Management System

A sleek, modern full-stack project management application designed to organize tasks, assign team members, and track real-time project progress. It enforces seamless Role-Based Access Control and includes intuitive visualizations for task tracking.

## 🚀 Key Features
- **Dynamic Dashboard & UI:** A sleek, dark-themed responsive UI built completely with Tailwind CSS.
- **Role-Based Access Control (RBAC):** Users are categorized into 'admins' and 'developers'. Only admins can assign tasks, edit developers, and change ownership.
- **Task Management Integrity:** Features like uncompleted task notification badges, preventing past due dates, and strict rules against modifying completed (done) tasks.
- **JWT Authentication:** Secure user authentication workflows ensuring isolated and protected views.
- **Advanced Filtering:** Capabilities to sort tasks by status, user assignments, and project.

## 🛠️ Tech Stack
This application leverages the latest modern technologies for high performance and scalability:
- **Frontend:** [Next.js](https://nextjs.org/) (App Router), React, Tailwind CSS, TypeScript
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python) for ultra-fast async endpoints and OpenAPI docs.
- **Database:** PostgreSQL accessed via SQLAlchemy ORM.
- **Authentication:** JWT (JSON Web Tokens) with Argon2/Bcrypt password hashing.

## 📁 Architecture
```text
project-management/
├── backend/          # Python fastAPI backend application
│   └── app/
│       ├── api/      # Route handlers and API endpoints
│       ├── core/     # JWT, configuration, and security dependencies
│       ├── db/       # PostgreSQL connection & cursors
│       ├── models/   # SQLAlchemy Database tables
│       ├── schemas/  # Pydantic schemas for data validation
│       └── services/ # Protected business logic (e.g. status constraints)
├── frontend/         # Next.js Server Components, Actions, & UI
│   ├── app/          # Core pages (Dashboard, Tasks, Users, Auth)
│   ├── components/   # Shared UI Reusable components
│   └── lib/          # Global APIs, Types, Auth Contexts
└── docker-compose.yml 
```

## 🗄️ Database Schema
The database connects efficiently defining Users, Projects, and Tasks with enforced relational integrity:
* **Users:** `id`, `name`, `email` (unique), `password`, `role` (admin/developer)
* **Projects:** `id`, `name`, `description`, `created_by` (FK -> users.id)
* **Tasks:** `id`, `title`, `description`, `status` (todo/in_progress/done), `project_id`, `assigned_to`, `due_date`

---

## 💻 Local Setup & Installation

To run this application, you can either natively build the frontend and backend or utilize Docker.

### Prerequisites
- Python 3.9+
- Node.js v18.17+ & npm
- PostgreSQL running locally (or available via Docker)

### 1. Database Setup
Create a local PostgreSQL database (e.g., `project_manager_db`). 

Ensure you duplicate the template internal environments:
```bash
# In backend
cp .env.example .env
```
Update `.env` with your actual Postgres credentials matching `DATABASE_URL`.

### 2. Backend Environment (FastAPI)
Navigate to the `backend` directory and run:

```bash
cd backend

# Create and activate your virtual environment
python -m venv venv

# Windows
venv\Scripts\activate      
# Mac/Linux
source venv/bin/activate   

# Install dependencies
pip install -r requirements.txt

# Run the backend Application Server
uvicorn app.main:app --reload
```
*The backend API will run on `http://localhost:8000`. And you can access the Swagger UI directly at `http://localhost:8000/docs`.*

### 3. Frontend Environment (Next.js)
Navigate to the `frontend` directory:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the frontend Development Server
npm run dev
```
*The frontend Application will compile and deploy on `http://localhost:3000`.*

### 🐳 With Docker (Alternative)
For a straightforward containerized boot up with all required images configured:
```bash
docker-compose up --build
```