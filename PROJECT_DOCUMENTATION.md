# Home4U Project Documentation

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
| **Milestone Folders Present** | M1, M2, M3, M4, M5 |
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
Home-4-U/
├── application
│   ├── backend
│   │   ├── alembic
│   │   │   ├── versions
│   │   │   ├── env.py
│   │   │   └── script.py.mako
│   │   ├── app
│   │   │   ├── api
│   │   │   ├── core
│   │   │   ├── models
│   │   │   ├── schemas
│   │   │   ├── services
│   │   │   ├── utils
│   │   │   ├── __init__.py
│   │   │   ├── main.py
│   │   │   ├── tests_analysis_quality_benchmark.py
│   │   │   ├── tests_api_smoke.py
│   │   │   ├── tests_auth_rate_limit.py
│   │   │   ├── tests_plan_optimizer.py
│   │   │   ├── tests_search_smoke.py
│   │   │   └── tests_workspace_analysis_smoke.py
│   │   ├── alembic.ini
│   │   ├── package-lock.json
│   │   ├── requirements.txt
│   │   ├── run_migrations.sh
│   │   ├── run_smoke_tests.sh
│   │   ├── seed.py
│   │   ├── start.cjs
│   │   └── start_backend.sh
│   ├── credentials
│   │   └── README.md
│   ├── deployment
│   │   ├── MANUAL_FIX.md
│   │   ├── deploy.sh
│   │   ├── deploy_fix.sh
│   │   ├── home4u-backend.service
│   │   ├── nginx-ssl.conf
│   │   ├── nginx.conf
│   │   └── quick_fix.sh
│   ├── frontend
│   │   ├── public
│   │   │   └── vite.svg
│   │   ├── src
│   │   │   ├── assets
│   │   │   ├── components
│   │   │   ├── context
│   │   │   ├── pages
│   │   │   ├── services
│   │   │   ├── styles
│   │   │   ├── test
│   │   │   ├── utils
│   │   │   ├── App.css
│   │   │   ├── App.jsx
│   │   │   ├── App.smoke.test.jsx
│   │   │   ├── index.css
│   │   │   └── main.jsx
│   │   ├── PROVISIONAL_UI_UX_CHECKLIST.md
│   │   ├── README.md
│   │   ├── eslint.config.js
│   │   ├── index.html
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── start_frontend.sh
│   │   ├── update_palette.py
│   │   ├── update_tokens.py
│   │   ├── update_tokens_marcelo.py
│   │   └── vite.config.js
│   └── README.md
├── docs
│   ├── mockups
│   │   ├── home4u-product-tour-concept.png
│   │   ├── home4u-product-tour-flow.png
│   │   └── home4u-redesign-concept.svg
│   └── screenshots
│       ├── home4u-dashboard.png
│       ├── home4u-project-plan.png
│       └── home4u-purchase-board.png
├── milestones
│   ├── M1
│   │   ├── feedback
│   │   │   ├── m1v1.md
│   │   │   └── m1v2_feedback.md
│   │   ├── Home4U Milestone 1.V2.pdf
│   │   ├── M1.v1.pdf
│   │   ├── M1v2.pdf
│   │   └── README.md
│   ├── M2
│   │   ├── feedback
│   │   │   ├── m2v1.md
│   │   │   └── m2v2.md
│   │   ├── M2V2.pdf
│   │   ├── M2v1.pdf
│   │   ├── README.md
│   │   └── eer.drawio
│   ├── M3
│   │   ├── feedback
│   │   │   └── m3v2.md
│   │   ├── M3V1.pdf
│   │   ├── M3V2.pdf
│   │   └── README.md
│   ├── M4
│   │   ├── feedback
│   │   │   └── m4feedback.md
│   │   ├── M4V1.pdf
│   │   ├── M4v2.pdf
│   │   └── README.md
│   └── M5
│       ├── M5.pdf
│       └── README.md
├── LICENSE
├── PROJECT_DOCUMENTATION.md
├── README.md
├── TODO.md
├── ecosystem.config.cjs
└── requirements.txt
```

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| fastapi | 0.110.0 | Web framework |
| uvicorn[standard] | 0.27.1 | ASGI server |
| pydantic | 2.6.1 | Schema validation |
| python-multipart | 0.0.9 | Multipart form parsing |
| sqlalchemy | 2.0.25 | ORM and relational persistence |
| python-jose | 3.3.0 | JWT handling |
| passlib[bcrypt] | 1.7.4 | Password hashing |
| email-validator | 2.3.0 | Email validation |
| bcrypt | 4.0.1 | Password hashing backend |
| httpx | 0.27.2 | HTTP client used by FastAPI test tooling |
| alembic | 1.13.1 | Utility |
| psycopg[binary] | 3.1.18 | Utility |
| Pillow | 10.4.0 | Utility |
| anthropic>=0.40.0 | latest | Utility |


### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| react | ^19.2.0 | UI framework |
| react-dom | ^19.2.0 | DOM renderer |
| react-router-dom | ^7.18.3 | Client-side routing |
| axios | ^1.20.0 | HTTP client |
| framer-motion | ^12.38.0 | Motion and transitions |
| lucide-react | ^0.577.0 | Icon library |
| vite | ^8.0.0-beta.13 | Build and dev server |
| vitest | ^4.1.4 | Component and smoke test runner |
| eslint | ^9.39.1 | Linting |
| @testing-library/react | ^16.3.2 | UI test utilities |


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
| GET | `/` | Public | `main.py::root` | Basic API status message. |
| POST | `/auth/login` | Public | `auth.py::login` | - |
| GET | `/auth/me` | Protected | `auth.py::get_me` | - |
| POST | `/auth/signup` | Public | `auth.py::signup` | - |
| GET | `/health` | Public | `health.py::health` | Returns API and database diagnostics. |
| GET | `/projects/` | Protected | `projects.py::get_projects` | - |
| POST | `/projects/` | Protected | `projects.py::create_project` | - |
| GET | `/projects/{project_id}` | Protected | `projects.py::get_project` | - |
| PUT | `/projects/{project_id}` | Protected | `projects.py::update_project` | - |
| DELETE | `/projects/{project_id}` | Protected | `projects.py::delete_project` | - |
| GET | `/projects/{project_id}/analysis` | Protected | `projects.py::get_project_analysis` | - |
| POST | `/projects/{project_id}/analysis` | Protected | `projects.py::analyze_project` | Persists room tags, style scores, recommendations, and constraint-optimized purchase plans. |
| POST | `/projects/{project_id}/photo` | Protected | `projects.py::upload_project_photo` | Accepts JPG, PNG, and WebP uploads up to 5MB. |
| POST | `/recommendations/` | Protected | `recommendations.py::create_recommendation` | Uses a required `project_id` query parameter. |
| POST | `/recommendations/generate/{project_id}` | Protected | `recommendations.py::generate_recommendations` | Builds a fresh plan from saved resemblance scores. |
| GET | `/recommendations/project/{project_id}` | Protected | `recommendations.py::get_project_recommendations` | - |
| PUT | `/recommendations/{recommendation_id}/complete` | Protected | `recommendations.py::mark_recommendation_complete` | - |
| GET | `/search/` | Public | `search.py::search` | - |
| GET | `/styles/` | Public | `styles.py::get_styles` | - |
| GET | `/styles/tags/` | Public | `styles.py::get_all_tags` | - |
| POST | `/styles/tags/` | Protected | `styles.py::create_tag` | Prototype admin endpoint; no auth enforcement is currently wired. |
| GET | `/styles/{style_id}` | Public | `styles.py::get_style` | - |
| GET | `/styles/{style_id}/tags` | Public | `styles.py::get_style_tags` | - |


### Frontend Routes

| Path | Access | Component / Behavior | Notes |
|------|--------|----------------------|-------|
| `/login` | Public | Login | - |
| `/register` | Public | Login | - |
| `/about` | Public / Auth-aware | About | Public page that renders inside the authenticated shell when a session exists. |
| `/dashboard` | Protected | Dashboard | Primary authenticated landing page. |
| `/project/:id` | Protected | ProjectDetails | Project plan view for a saved room project. |
| `/virtual-tour` | Redirect | Navigate | Legacy route that now redirects to `/workspace`. |
| `/workspace` | Protected | Workspace | Protected design workspace with project sync and analysis. |
| `/` | Public | About | Redirects to `/dashboard`. |
| `*` | Public | NotFound | Catch-all not-found route. |


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
| M1 | Present | Requirements and architecture |
| M2 | Present | System design and data modeling |
| M3 | Present | UI, architecture, and implementation review |
| M4 | Present | Beta prototype and testing |
| M5 | Present | Final delivery |


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
