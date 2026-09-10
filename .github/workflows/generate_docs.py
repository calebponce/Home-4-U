#!/usr/bin/env python3
"""
Project Documentation Generator

This script generates PROJECT_DOCUMENTATION.md by reading the current repo
structure and the actual frontend/backend routing contract.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).parent.parent.parent
OUTPUT_FILE = PROJECT_ROOT / "PROJECT_DOCUMENTATION.md"
APP_DIR = PROJECT_ROOT / "application"
BACKEND_DIR = APP_DIR / "backend"
FRONTEND_DIR = APP_DIR / "frontend"

METHOD_ORDER = {"GET": 0, "POST": 1, "PUT": 2, "PATCH": 3, "DELETE": 4}


def get_project_structure(root_path: Path, max_depth: int = 3, exclude_dirs=None) -> str:
    """Generate a tree-like structure of the project."""
    if exclude_dirs is None:
        exclude_dirs = {
            ".git",
            "node_modules",
            "__pycache__",
            ".venv",
            "venv",
            "dist",
            "build",
            "uploads",
        }
    exclude_files = {"home4u.db"}

    lines: list[str] = []

    def walk_dir(path: Path, prefix: str = "", depth: int = 0) -> None:
        if depth > max_depth:
            return

        try:
            visible_items = [
                item
                for item in sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name))
                if item.name not in exclude_dirs
                and item.name not in exclude_files
                and not item.name.startswith(".")
            ]
        except PermissionError:
            return

        for index, item in enumerate(visible_items):
            is_last = index == len(visible_items) - 1
            branch = "└── " if is_last else "├── "
            lines.append(f"{prefix}{branch}{item.name}")

            if item.is_dir():
                extension = "    " if is_last else "│   "
                walk_dir(item, prefix + extension, depth + 1)

    # Keep generated output stable across differently named local/CI checkouts.
    lines.append("Home-4-U/")
    walk_dir(root_path)
    return "\n".join(lines)


def get_backend_dependencies() -> dict[str, str]:
    """Parse backend requirements.txt."""
    req_file = BACKEND_DIR / "requirements.txt"
    deps: dict[str, str] = {}
    if not req_file.exists():
        return deps

    with open(req_file, encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "==" in line:
                name, version = line.split("==", 1)
                deps[name.strip()] = version.strip()
            else:
                deps[line] = "latest"
    return deps


def get_frontend_dependencies() -> dict[str, str]:
    """Parse frontend package.json and surface both runtime and toolchain deps."""
    pkg_file = FRONTEND_DIR / "package.json"
    if not pkg_file.exists():
        return {}

    with open(pkg_file, encoding="utf-8") as file:
        data = json.load(file)

    combined: dict[str, str] = {}
    for section in ("dependencies", "devDependencies"):
        for name, version in data.get(section, {}).items():
            combined[name] = version
    return combined


def join_route_parts(*parts: str) -> str:
    """Join URL path fragments while preserving declared trailing slashes."""
    path = ""
    for part in parts:
        if not part:
            continue
        if not path:
            path = part
            continue
        if path.endswith("/") and part.startswith("/"):
            path += part[1:]
        elif not path.endswith("/") and not part.startswith("/"):
            path += "/" + part
        else:
            path += part

    if not path:
        return "/"
    if not path.startswith("/"):
        path = "/" + path
    return re.sub(r"/{2,}", "/", path)


def get_router_include_prefixes() -> dict[str, str]:
    """Map route module name to any include_router prefix set in api router."""
    router_file = BACKEND_DIR / "app" / "api" / "v1" / "router.py"
    if not router_file.exists():
        return {}

    with open(router_file, encoding="utf-8") as file:
        content = file.read()

    alias_to_module = {
        alias: module
        for module, alias in re.findall(
            r"from app\.api\.v1\.routes\.(\w+) import router as (\w+)", content
        )
    }

    include_prefixes: dict[str, str] = {}
    for alias, arg_block in re.findall(r"include_router\((\w+)(.*?)\)", content):
        module = alias_to_module.get(alias)
        if not module:
            continue
        prefix_match = re.search(r'prefix\s*=\s*["\']([^"\']*)["\']', arg_block)
        include_prefixes[module] = prefix_match.group(1) if prefix_match else ""

    return include_prefixes


def find_api_endpoints() -> list[dict[str, str]]:
    """Find backend API endpoints with their real public paths."""
    routes_dir = BACKEND_DIR / "app" / "api" / "v1" / "routes"
    include_prefixes = get_router_include_prefixes()
    endpoints: list[dict[str, str]] = []
    route_pattern = re.compile(r'@router\.(get|post|put|delete|patch)\(\s*["\']([^"\']+)["\']')

    route_notes = {
        "upload_project_photo": "Accepts JPG, PNG, and WebP uploads up to 5MB.",
        "analyze_project": "Persists room tags, style scores, recommendations, and constraint-optimized purchase plans.",
        "create_recommendation": "Uses a required `project_id` query parameter.",
        "generate_recommendations": "Builds a fresh plan from saved resemblance scores.",
        "create_tag": "Prototype admin endpoint; no auth enforcement is currently wired.",
        "health": "Returns API and database diagnostics.",
    }

    if routes_dir.exists():
        for file in sorted(routes_dir.glob("*.py")):
            if file.name.startswith("_") or file.name == "__init__.py":
                continue

            with open(file, encoding="utf-8") as handle:
                content = handle.read()

            router_match = re.search(r"APIRouter\((.*?)\)", content, re.S)
            local_prefix = ""
            if router_match:
                prefix_match = re.search(r'prefix\s*=\s*["\']([^"\']*)["\']', router_match.group(1))
                if prefix_match:
                    local_prefix = prefix_match.group(1)

            lines = content.splitlines()
            for index, line in enumerate(lines):
                match = route_pattern.search(line)
                if not match:
                    continue

                method = match.group(1).upper()
                route_path = match.group(2)
                segment_end = len(lines)
                for next_index in range(index + 1, len(lines)):
                    if lines[next_index].strip().startswith("@router."):
                        segment_end = next_index
                        break
                segment = "\n".join(lines[index:segment_end])

                fn_match = re.search(r"(?:async\s+)?def\s+(\w+)\(", segment)
                function_name = fn_match.group(1) if fn_match else "unknown_handler"
                access = "Protected" if "Depends(get_current_user)" in segment else "Public"
                public_path = join_route_parts(
                    include_prefixes.get(file.stem, ""),
                    local_prefix,
                    route_path,
                )

                endpoints.append(
                    {
                        "method": method,
                        "path": public_path,
                        "access": access,
                        "handler": f"{file.name}::{function_name}",
                        "note": route_notes.get(function_name, ""),
                    }
                )

    main_file = BACKEND_DIR / "app" / "main.py"
    if main_file.exists():
        with open(main_file, encoding="utf-8") as file:
            content = file.read()
        if '@app.get("/")' in content:
            endpoints.insert(
                0,
                {
                    "method": "GET",
                    "path": "/",
                    "access": "Public",
                    "handler": "main.py::root",
                    "note": "Basic API status message.",
                },
            )

    endpoints.sort(key=lambda item: (item["path"], METHOD_ORDER.get(item["method"], 99)))
    return endpoints


def extract_component_name(element_block: str) -> str:
    """Infer the primary component rendered by a route element."""
    tags = re.findall(r"<([A-Z][A-Za-z0-9_]*)\b", element_block)
    ignored = {"ProtectedRoute", "Suspense", "PageMotion", "RouteChunkFallback", "SessionLoadingGate"}
    meaningful = [tag for tag in tags if tag not in ignored]
    if meaningful:
        return meaningful[-1]
    if "Navigate" in element_block:
        target = re.search(r'to=["\']([^"\']+)["\']', element_block)
        return f"Navigate -> {target.group(1)}" if target else "Navigate"
    return "Unknown"


def get_frontend_routes() -> list[dict[str, str]]:
    """Find route declarations in App.jsx with access notes."""
    app_jsx = FRONTEND_DIR / "src" / "App.jsx"
    if not app_jsx.exists():
        return []

    with open(app_jsx, encoding="utf-8") as file:
        content = file.read()

    route_pattern = re.compile(
        r'<Route\s+path=["\']([^"\']+)["\']\s+element=\{(.*?)\}\s*/>',
        re.S,
    )

    notes = {
        "/about": "Public page that renders inside the authenticated shell when a session exists.",
        "/dashboard": "Primary authenticated landing page.",
        "/project/:id": "Project plan view for a saved room project.",
        "/virtual-tour": "Legacy route that now redirects to `/workspace`.",
        "/workspace": "Protected design workspace with project sync and analysis.",
        "/": "Redirects to `/dashboard`.",
        "*": "Catch-all not-found route.",
    }

    routes: list[dict[str, str]] = []
    for path, element in route_pattern.findall(content):
        access = "Protected" if "ProtectedRoute" in element else "Public"
        if path == "/about":
            access = "Public / Auth-aware"
        elif path == "/virtual-tour":
            access = "Redirect"
        routes.append(
            {
                "path": path,
                "access": access,
                "component": extract_component_name(element),
                "note": notes.get(path, ""),
            }
        )

    return routes


def get_milestones() -> list[dict[str, str]]:
    """Get milestone folders and broad status labels."""
    milestones_dir = PROJECT_ROOT / "milestones"
    milestones: list[dict[str, str]] = []
    if not milestones_dir.exists():
        return milestones

    descriptions = {
        "M1": "Requirements and architecture",
        "M2": "System design and data modeling",
        "M3": "UI, architecture, and implementation review",
        "M4": "Beta prototype and testing",
        "M5": "Final delivery",
    }

    for directory in sorted(milestones_dir.iterdir()):
        if not directory.is_dir() or not directory.name.startswith("M"):
            continue
        milestones.append(
            {
                "name": directory.name,
                "status": "Present" if (directory / "README.md").exists() else "Folder only",
                "description": descriptions.get(directory.name, "Course milestone"),
            }
        )

    return milestones


def build_backend_tech_table(backend_deps: dict[str, str]) -> str:
    """Build backend technology rows."""
    purpose_map = {
        "fastapi": "Web framework",
        "uvicorn[standard]": "ASGI server",
        "pydantic": "Schema validation",
        "python-multipart": "Multipart form parsing",
        "sqlalchemy": "ORM and relational persistence",
        "python-jose": "JWT handling",
        "passlib[bcrypt]": "Password hashing",
        "email-validator": "Email validation",
        "bcrypt": "Password hashing backend",
        "httpx": "HTTP client used by FastAPI test tooling",
    }
    return "".join(
        f"| {name} | {version} | {purpose_map.get(name.lower(), 'Utility')} |\n"
        for name, version in backend_deps.items()
    )


def build_frontend_tech_table(frontend_deps: dict[str, str]) -> str:
    """Build frontend technology rows."""
    included_names = [
        "react",
        "react-dom",
        "react-router-dom",
        "axios",
        "framer-motion",
        "lucide-react",
        "vite",
        "vitest",
        "eslint",
        "@testing-library/react",
    ]
    purpose_map = {
        "react": "UI framework",
        "react-dom": "DOM renderer",
        "react-router-dom": "Client-side routing",
        "axios": "HTTP client",
        "framer-motion": "Motion and transitions",
        "lucide-react": "Icon library",
        "vite": "Build and dev server",
        "vitest": "Component and smoke test runner",
        "eslint": "Linting",
        "@testing-library/react": "UI test utilities",
    }

    rows = []
    for name in included_names:
        version = frontend_deps.get(name)
        if version:
            rows.append(f"| {name} | {version} | {purpose_map.get(name, 'Tooling')} |\n")
    return "".join(rows)


def generate_documentation() -> None:
    """Generate the complete documentation."""
    project_structure = get_project_structure(PROJECT_ROOT, max_depth=3)
    backend_deps = get_backend_dependencies()
    frontend_deps = get_frontend_dependencies()
    api_endpoints = find_api_endpoints()
    frontend_routes = get_frontend_routes()
    milestones = get_milestones()

    backend_tech = build_backend_tech_table(backend_deps)
    frontend_tech = build_frontend_tech_table(frontend_deps)

    api_table = "".join(
        f"| {item['method']} | `{item['path']}` | {item['access']} | `{item['handler']}` | "
        f"{item['note'] or '-'} |\n"
        for item in api_endpoints
    )

    frontend_route_table = "".join(
        f"| `{item['path']}` | {item['access']} | {item['component']} | {item['note'] or '-'} |\n"
        for item in frontend_routes
    )

    milestone_table = "".join(
        f"| {item['name']} | {item['status']} | {item['description']} |\n"
        for item in milestones
    )

    milestone_coverage = ", ".join(item["name"] for item in milestones) or "None detected"

    doc = f"""# Home4U Project Documentation

> **IMPORTANT**: This document is automatically generated from `.github/workflows/generate_docs.py`.
> Update the generator when the repo contract changes; direct edits to this file will be overwritten.

---

## Project Overview

| Property | Value |
|----------|-------|
| **Project Name** | Home4U |
| **Team Alias** | Vibecoding for Internship |
| **Project Type** | Full-Stack Web Application |
| **Status** | Active Development |
| **Milestone Folders Present** | {milestone_coverage} |
| **Runtime API Contract** | Frontend `/api/*` proxy -> backend unversioned routes |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                           Home4U Application                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   React + Vite frontend                                              │
│   127.0.0.1:5173 in development                                      │
│        │                                                             │
│        ├── /api/*      -> proxied to FastAPI backend root routes     │
│        └── /uploads/*  -> proxied to backend-hosted uploaded files   │
│                                │                                     │
│                                ▼                                     │
│                       FastAPI + Uvicorn backend                      │
│                       127.0.0.1:8000                                 │
│                                │                                     │
│                                ▼                                     │
│                  SQLAlchemy-backed relational data layer             │
│                  SQLite by default in development                    │
│                  DATABASE_URL override for other relational DBs      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Runtime Contract

- Backend route modules currently live under `application/backend/app/api/v1/`, but the public backend URLs are **not** versioned as `/api/v1/*`.
- The frontend uses `VITE_API_BASE=/api` in [api.js](application/frontend/src/services/api.js) and [AuthContext.jsx](application/frontend/src/context/AuthContext.jsx).
- In development, [vite.config.js](application/frontend/vite.config.js) strips `/api` before forwarding requests to `http://127.0.0.1:8000`, and proxies `/uploads` directly.
- In production, [nginx.conf](application/deployment/nginx.conf) applies the same `/api` rewrite and `/uploads` proxy behavior.
- Uploaded room images are served by the backend static mount at `/uploads/*`.

---

## Directory Structure

```
{project_structure}
```

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
{backend_tech}

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
{frontend_tech}

### Runtime / Infrastructure

| Layer | Current Repo Reality | Notes |
|------|-----------------------|-------|
| Frontend dev server | Vite on `127.0.0.1:5173` | `start_frontend.sh` uses `--strictPort` |
| Backend app | FastAPI/Uvicorn on `127.0.0.1:8000` | `start_backend.sh` runs without `--reload` |
| Default development database | SQLite file at `application/backend/home4u.db` | Override with `DATABASE_URL` if needed |
| Production edge | Nginx reverse proxy | Strips `/api` before forwarding to backend |
| Production backend service | systemd unit `home4u-backend` | Supports optional `/etc/home4u/home4u.env` for secrets and CORS |

---

## Team Members

| Name | GitHub | Primary responsibility |
|------|--------|------------------------|
| Caleb Ponce | [calebponce](https://github.com/calebponce) | Team Lead / System Architecture |
| Mason Lee | [mlee82](https://github.com/mlee82) | Data Modeling / Scoring Engine |
| Christopher Quach | [rexchris2](https://github.com/rexchris2) | Frontend Development |
| Tyler Morris | [tylerrendon](https://github.com/tylerrendon) | Backend / AI Integration |
| Dias Almat | [vincivv](https://github.com/vincivv) | Technical Writing |

---

## Current Feature Map

- Authentication: signup, login, JWT session validation, and `/auth/me` checks.
- Dashboard flow: protected dashboard, style selection, project creation, and workspace launch.
- Workspace flow: project creation, budget and room-type updates, local photo upload, project analysis, concept-board rendering, and saved recommendations.
- Project management: recommendation retrieval, completion tracking, plan refresh, and three constraint-valid purchasing strategies.
- Decision support: a bounded grouped exhaustive search compares product combinations under hard budget and one-product-per-recommendation constraints.
- Discovery: public style catalog plus fuzzy style search.

---

## Backend Endpoints

| Method | Endpoint | Access | Handler | Notes |
|--------|----------|--------|---------|-------|
{api_table}

### Frontend Routes

| Path | Access | Component / Behavior | Notes |
|------|--------|----------------------|-------|
{frontend_route_table}

---

## Running the Application

### Backend

Recommended script:

```bash
cd application/backend
./start_backend.sh
```

Optional dependency install during startup:

```bash
cd application/backend
INSTALL_DEPS=1 ./start_backend.sh
```

Manual startup:

```bash
cd application/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend URLs:

- API root: `http://127.0.0.1:8000/`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health check: `http://127.0.0.1:8000/health`

### Frontend

Recommended script:

```bash
cd application/frontend
./start_frontend.sh
```

Manual startup:

```bash
cd application/frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Frontend URLs:

- App: `http://127.0.0.1:5173`
- API via dev proxy: `http://127.0.0.1:5173/api/*`
- Uploaded assets via dev proxy: `http://127.0.0.1:5173/uploads/*`

---

## Data and Configuration Notes

- Development defaults to SQLite via [database.py](application/backend/app/core/database.py).
- `HOME4U_ENV=production` moves the default SQLite path outside the repo so deployments do not lose local data on `git pull`.
- `DATABASE_URL` can override the default database connection for other relational database deployments.
- `HOME4U_SECRET_KEY` should be supplied in production rather than relying on the repo default.
- `HOME4U_CORS_ORIGINS` can be used to allow direct cross-origin backend access when the app is not using the same-origin `/api` proxy.
- `HOME4U_LOGIN_RATE_LIMIT_ATTEMPTS`, `HOME4U_LOGIN_RATE_LIMIT_IP_ATTEMPTS`, and `HOME4U_LOGIN_RATE_LIMIT_WINDOW_SECONDS` tune failed-login throttling; defaults are `5`, `20`, and `300`.
- Public-facing repo docs and smoke-test snippets should derive from a single `HOME4U_PUBLIC_URL` value that points to a stable domain or Elastic-IP-backed hostname.
- Validate DNS and the full TLS certificate chain before publishing a live-demo URL. The former deployment is currently unlisted while TLS is repaired.
- The production systemd unit supports an optional `/etc/home4u/home4u.env` file for backend environment variables.
- The backend currently starts without requiring an AI provider key; Workspace analysis uses deterministic scoring and a bounded product-combination optimizer rather than depending on an external model call.

---

## Milestones

| Milestone | Status | Description |
|-----------|--------|-------------|
{milestone_table}

---

## Development Workflow

### Repository Policy

- The root [README.md](README.md) is the portfolio entry point; the preserved course milestones document the original delivery requirements.
- Feature branches and pull requests are still the safer day-to-day workflow, but repository-wide decisions should stay consistent with the course policy documented in the root README.

### Suggested Engineering Workflow

1. Branch from `master` for isolated work.
2. Run local verification before merging: frontend tests, lint, build, and backend smoke checks as appropriate.
3. Merge reviewed work back into `master`.
4. Regenerate project documentation by updating `.github/workflows/generate_docs.py` when the route contract or project structure changes.

### Commit Message Guidance

```text
<type>(<scope>): <description>

Examples: feat(workspace): add project analysis flow
          docs(project): refresh generated runtime contract
          fix(auth): normalize login emails
```

---

## Notes for AI Agents

### Backend Development

- Add backend code under `application/backend/app/`.
- Follow the existing structure: `api/`, `models/`, `schemas/`, `services/`, `utils/`.
- Use FastAPI endpoints with Pydantic schemas and type hints.
- Preserve the current public API contract unless the frontend and proxy config are updated together.

### Frontend Development

- Add frontend code under `application/frontend/src/`.
- Use functional React components and keep route-level behavior aligned with [App.jsx](application/frontend/src/App.jsx).
- The frontend currently expects `/api/*` and `/uploads/*` to be available through dev and production proxies.

### API Design

- The **current live contract** is unversioned backend paths such as `/auth/login`, `/projects/`, `/styles/`, and `/health`.
- If API versioning is introduced later, update backend routes, frontend clients, and proxy rewrites together instead of only changing the folder naming.
- Use meaningful HTTP methods, response models, and authentication boundaries.

---

## Project provenance

- Team Lead: [Caleb Ponce](https://github.com/calebponce)
- Originally developed as a five-person CSC 648/848 team project.
- Contributor attribution is preserved in Git history.

---

*This document is maintained by the repository documentation generator.*
"""

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        file.write(doc)

    print(f"Documentation generated successfully: {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_documentation()
