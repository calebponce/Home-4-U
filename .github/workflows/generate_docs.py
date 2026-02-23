#!/usr/bin/env python3
"""
Project Documentation Generator

This script automatically generates the PROJECT_DOCUMENTATION.md file
by analyzing the project structure and codebase.
"""

import os
import json
from pathlib import Path
from datetime import datetime

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
OUTPUT_FILE = PROJECT_ROOT / "PROJECT_DOCUMENTATION.md"
APP_DIR = PROJECT_ROOT / "application"
BACKEND_DIR = APP_DIR / "backend"
FRONTEND_DIR = APP_DIR / "frontend"


def get_project_structure(root_path: Path, max_depth: int = 3, exclude_dirs=None) -> str:
    """Generate a tree-like structure of the project."""
    if exclude_dirs is None:
        exclude_dirs = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build'}

    lines = []

    def walk_dir(path: Path, prefix: str = "", depth: int = 0):
        if depth > max_depth:
            return

        try:
            items = sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name))
        except PermissionError:
            return

        for i, item in enumerate(items):
            if item.name in exclude_dirs or item.name.startswith('.'):
                continue

            is_last = i == len(items) - 1
            current_prefix = "└── " if is_last else "├── "
            lines.append(f"{prefix}{current_prefix}{item.name}")

            if item.is_dir():
                extension = "    " if is_last else "│   "
                walk_dir(item, prefix + extension, depth + 1)

    lines.append(root_path.name + "/")
    walk_dir(root_path)
    return "\n".join(lines)


def get_backend_dependencies() -> dict:
    """Parse backend requirements.txt."""
    req_file = BACKEND_DIR / "requirements.txt"
    deps = {}
    if req_file.exists():
        with open(req_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if '==' in line:
                        name, version = line.split('==')
                        deps[name.strip()] = version.strip()
                    else:
                        deps[line] = "latest"
    return deps


def get_frontend_dependencies() -> dict:
    """Parse frontend package.json."""
    pkg_file = FRONTEND_DIR / "package.json"
    deps = {}
    if pkg_file.exists():
        with open(pkg_file) as f:
            data = json.load(f)
            deps.update(data.get('dependencies', {}))
    return deps


def find_api_endpoints() -> list:
    """Find all API endpoints in the backend."""
    endpoints = []
    routes_dir = BACKEND_DIR / "app" / "api" / "v1" / "routes"

    if routes_dir.exists():
        for file in routes_dir.glob("*.py"):
            if file.name.startswith('_'):
                continue
            with open(file) as f:
                content = f.read()
                # Simple regex to find @router.get, @router.post, etc.
                import re
                methods = re.findall(r'@router\.(get|post|put|delete|patch)\([\'"]/?(\w+)[\'"]\)', content)
                for method, path in methods:
                    endpoints.append({
                        'method': method.upper(),
                        'path': f"/api/v1/{path}",
                        'file': file.name
                    })

    # Add root endpoint from main.py
    main_file = BACKEND_DIR / "app" / "main.py"
    if main_file.exists():
        with open(main_file) as f:
            content = f.read()
            if '@app.get("/")' in content or '@app.get("/")' in content:
                endpoints.insert(0, {
                    'method': 'GET',
                    'path': '/',
                    'file': 'main.py'
                })

    return endpoints


def get_frontend_routes() -> list:
    """Find all routes in the frontend."""
    routes = []
    src_dir = FRONTEND_DIR / "src"

    if src_dir.exists():
        # Check App.jsx for routes
        app_jsx = src_dir / "App.jsx"
        if app_jsx.exists():
            with open(app_jsx) as f:
                content = f.read()
                # Look for React Router patterns
                import re
                path_matches = re.findall(r'path=[\'"](/[\w-]*)[\'"]', content)
                routes.extend(path_matches)

    return routes


def get_milestones() -> list:
    """Get milestone information."""
    milestones_dir = PROJECT_ROOT / "milestones"
    milestones = []

    if milestones_dir.exists():
        for d in sorted(milestones_dir.iterdir()):
            if d.is_dir() and d.name.startswith('M'):
                readme = d / "README.md"
                status = "⏳ Pending"
                if d.name == "M1":
                    status = "📝 In Progress"

                milestones.append({
                    'name': d.name,
                    'status': status,
                    'has_readme': readme.exists()
                })

    return milestones


def generate_documentation():
    """Generate the complete documentation."""

    # Get project info
    project_structure = get_project_structure(PROJECT_ROOT, max_depth=3)
    backend_deps = get_backend_dependencies()
    frontend_deps = get_frontend_dependencies()
    api_endpoints = find_api_endpoints()
    frontend_routes = get_frontend_routes()
    milestones = get_milestones()

    # Build technology tables
    backend_tech = ""
    for name, version in backend_deps.items():
        purpose = {
            'fastapi': 'Web framework',
            'uvicorn': 'ASGI server',
            'pydantic': 'Data validation',
            'sqlalchemy': 'ORM',
            'psycopg2-binary': 'PostgreSQL driver',
            'python-jose': 'JWT handling',
            'passlib': 'Password hashing',
            'python-multipart': 'Form data parsing'
        }.get(name.lower(), 'Utility')
        backend_tech += f"| {name} | {version} | {purpose} |\n"

    frontend_tech = ""
    for name, version in frontend_deps.items():
        if name in ['react', 'react-dom']:
            purpose = 'UI framework'
        elif name == 'vite':
            purpose = 'Build tool'
        else:
            purpose = 'Dependency'
        frontend_tech += f"| {name} | {version} | {purpose} |\n"

    # Build API endpoints table
    api_table = ""
    for ep in api_endpoints:
        api_table += f"| {ep['method']} | `{ep['path']}` | {ep['file']} | ✅ Active |\n"

    # Build milestones table
    milestones_table = ""
    desc = {
        'M1': 'Requirements & Architecture',
        'M2': 'Database & API Design',
        'M3': 'UI/UX Implementation',
        'M4': 'Integration & Testing',
        'M5': 'Deployment & Final'
    }
    for m in milestones:
        milestones_table += f"| {m['name']} | {m['status']} | {desc.get(m['name'], 'TBD')} |\n"

    # Generate the markdown
    doc = f"""# Home4U Project Documentation

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
{project_structure}
```

---

## 🔧 Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
{backend_tech}

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
{frontend_tech}

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
{api_table}

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
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

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
{milestones_table}

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

*Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
*This document is maintained by the CI/CD pipeline*
"""

    # Write the documentation
    with open(OUTPUT_FILE, 'w') as f:
        f.write(doc)

    print(f"Documentation generated successfully: {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_documentation()

