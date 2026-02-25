# Home4U Project Documentation

> **⚠️ IMPORTANT**: This document is automatically generated and maintained. Do not edit manually.
> Any manual changes will be overwritten by the CI/CD pipeline.

---

## 📋 Project Overview

| Property | Value |
|----------|-------|
| **Project Name** | Home4U |
| **Team Alias** | Vibecoding for Internship |
| **Project Type** | Full-Stack Web Application |
| **Status** | Active Development |
| **Current Milestone** | M1 |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Home4U Application                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────┐         ┌─────────────────────────┐   │
│   │                     │         │                         │   │
│   │   Frontend          │         │   Backend              │   │
│   │   (React + Vite)    │ ◄─────► │   (FastAPI + Python)   │   │
│   │                     │  REST   │                         │   │
│   │   Port: 5173        │         │   Port: 8000            │   │
│   │                     │         │                         │   │
│   └─────────────────────┘         └───────────┬─────────────┘   │
│                                               │                 │
│                                               ▼                 │
│                                    ┌─────────────────────┐     │
│                                    │   Database          │     │
│                                    │   (PostgreSQL)      │     │
│                                    │                     │     │
│                                    │   Host: TBD         │     │
│                                    └─────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
csc648-848-project-sp26-vibecoding-for-internship/
├── application
│   ├── backend
│   │   ├── app
│   │   │   ├── api
│   │   │   ├── core
│   │   │   ├── models
│   │   │   ├── schemas
│   │   │   ├── services
│   │   │   ├── utils
│   │   │   ├── __init__.py
│   │   │   └── main.py
│   │   ├── home4u.db
│   │   ├── requirements.txt
│   │   ├── seed.py
│   │   └── start_backend.sh
│   ├── credentials
│   │   └── README.md
│   ├── frontend
│   │   ├── public
│   │   │   └── vite.svg
│   │   ├── src
│   │   │   ├── assets
│   │   │   ├── context
│   │   │   ├── pages
│   │   │   ├── services
│   │   │   ├── App.css
│   │   │   ├── App.jsx
│   │   │   ├── index.css
│   │   │   └── main.jsx
│   │   ├── README.md
│   │   ├── eslint.config.js
│   │   ├── index.html
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── start_frontend.sh
│   │   └── vite.config.js
│   └── README.md
├── milestones
│   ├── M1
│   │   ├── Home4U Milestone 1.V2.pdf
│   │   ├── M1.v1.pdf
│   │   └── README.md
│   ├── M2
│   │   └── README.md
│   ├── M3
│   │   └── README.md
│   ├── M4
│   │   └── README.md
│   └── M5
│       └── README.md
├── LICENSE
├── PROJECT_DOCUMENTATION.md
├── README.md
└── requirements.txt
```

---

## 🔧 Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| fastapi | 0.110.0 | Web framework |
| uvicorn[standard] | 0.27.1 | Utility |
| pydantic | 2.6.1 | Data validation |
| python-multipart | 0.0.9 | Form data parsing |
| sqlalchemy | 2.0.25 | ORM |
| python-jose | 3.3.0 | JWT handling |
| passlib[bcrypt] | 1.7.4 | Utility |
| email-validator | 2.3.0 | Utility |
| bcrypt | 4.0.1 | Utility |


### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| react | ^19.2.0 | UI framework |
| react-dom | ^19.2.0 | UI framework |
| react-router-dom | ^6.22.0 | Dependency |
| axios | ^1.6.7 | Dependency |


### Infrastructure (Planned)

| Service | Provider | Notes |
|---------|----------|-------|
| Compute | AWS/GCP/Azure | Free tier |
| Database | PostgreSQL | Recommended |
| Web Server | Nginx | For production |

---

## 👥 Team Members

| # | Name | SFSU Email | GitHub | Discord | Role | Contract |
|---|------|------------|--------|---------|------|----------|
| 1 | Caleb Ponce | cponce8@sfsu.edu | calebponce | fusionn8 | Team Lead | ✅ |
| 2 | Mason Lee | mlee82@sfsu.edu | mlee82 | masonl | | ✅ |
| 3 | Christopher Quach | cquach@sfsu.edu | rexchris2 | tanglungg | | ✅ |
| 4 | Tyler Morris | tmorris6@sfsu.edu | tylerrendon | sinigang4463 | Unsure | ✅ |
| 5 | Dias Almat | dalmat@sfsu.edu | vincivv | vinciv | | ✅ |
| 6 | - | - | - | - | | ❌ |
| 7 | - | - | - | - | | ❌ |

---

## 📡 API Endpoints

### Backend Endpoints

| Method | Endpoint | Handler | Status |
|--------|----------|---------|--------|
| GET | `/` | main.py | ✅ Active |
| GET | `/api/v1/health` | health.py | ✅ Active |


### Frontend Routes

| Path | Component |
|------|-----------|
| / | App (root) |

---

## 🚀 Running the Application

### Backend

```bash
# Navigate to backend directory
cd application/backend

# Create virtual environment (if not exists)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
- API Docs (Swagger UI): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend

```bash
# Navigate to frontend directory
cd application/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

## 📄 Milestones

| Milestone | Status | Description |
|-----------|--------|-------------|
| M1 | 📝 In Progress | Requirements & Architecture |
| M2 | ⏳ Pending | Database & API Design |
| M3 | ⏳ Pending | UI/UX Implementation |
| M4 | ⏳ Pending | Integration & Testing |
| M5 | ⏳ Pending | Deployment & Final |


---

## 🔄 Development Workflow

### Branching Strategy

```
master (production-ready)
    │
    └── develop (integration branch)
            │
            ├── feature/feature-name
            ├── bugfix/bug-description
            └── hotfix/urgent-fix
```

### Commit Message Format

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push and create PR to `develop`
4. Request code review
5. Merge after approval

---

## 📝 Notes for AI Agents

When working on this project:

### Backend Development
- All backend code goes in `application/backend/app/`
- Follow the existing module structure (api/, models/, schemas/, services/, utils/)
- Use FastAPI for new endpoints
- Follow PEP 8 style guide
- Add type hints to all functions

### Frontend Development
- All frontend code goes in `application/frontend/src/`
- Use functional components with hooks
- Follow React best practices
- Use CSS modules or styled-components for styling

### Database
- PostgreSQL is the recommended database
- Use SQLAlchemy for ORM
- Follow database naming conventions (snake_case)

### API Design
- RESTful principles
- Version APIs under `/api/v1/`
- Use meaningful HTTP methods and status codes

---

## 📞 Contact

- **Team Lead**: Caleb Ponce (cponce8@sfsu.edu)
- **Repository**: GitHub Classroom
- **Decision Making**: Consensus

---

*Last Updated: 2026-02-25 20:09:18*
*This document is maintained by the CI/CD pipeline*
