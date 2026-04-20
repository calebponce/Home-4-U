# Project Info


This directory contains the complete source code for the project.

This README serves as the **main entry point** for the application and is intended to be the primary 
documentation users, reviewers, and potential employers will see once the project is separated from the course 
repository at the end of the semester.

The **Technical Writer** or **GitHub Master** is responsible for keeping this document accurate and up to date throughout the project lifecycle.

---

## About the Project

Home4U is a web-based platform that helps renters and first-time apartment dwellers transform their living spaces into a desired aesthetic style using structured, data-driven recommendations.

Existing inspiration platforms such as Pinterest and Houzz provide visual references but do not translate those references into actionable, personalized guidance based on a user’s actual room and budget.

Home4U solves this gap by:

Allowing users to upload a room image

Capturing room signals such as lighting, palette, and selected design tags

Comparing the room against structured style definitions

Computing a weighted resemblance score

Generating prioritized, budget-aware recommendations

Persisting a project plan that can be reviewed and refined later

The system focuses on explainability, personalization, and structured decision support rather than simple inspiration browsing.

---

## Features

User authentication and account management

Room project creation and management

Image upload and project photo management

Multi-style comparison engine

Weighted resemblance scoring algorithm

Budget-aware prioritization of recommendations

Workspace analysis and saved project plans

Administrative style and weight management

About page with team introduction and company information

---

## Installation and Setup

Prerequisites:

- Python 3.12.x
- Node.js 18+
- SQLite is used by default in development
- PostgreSQL or another relational database is optional via `DATABASE_URL`
- Git

### Backend Setup

**Option 1: Using the startup script (Recommended)**
```bash
cd application/backend
./start_backend.sh
```

**Option 2: Manual setup**
```bash
cd application/backend
python3 -m venv .venv
# Windows: .venv\Scripts\activate
# Mac/Linux: 
source .venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend will run at:

http://127.0.0.1:8000

Swagger docs available at:

http://127.0.0.1:8000/docs

### Frontend Setup

**Option 1: Using the startup script (Recommended)**
```bash
cd application/frontend
./start_frontend.sh
```

**Option 2: Manual setup**
```bash
cd application/frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```


Frontend will run at:

http://127.0.0.1:5173

---

## Usage

Create an account and sign in.

Open the Dashboard and choose a design style.

Launch the Workspace or Virtual Tour from the selected style context.

Upload a room image or load a sample room in Workspace.

Generate a saved plan to create or update a project, upload the photo, and calculate style scores.

Review the returned summary, saved recommendations, and project plan.

Screenshots or short examples may be added if helpful.

---

## Configuration

Environment Variables: 
    Backend supports:
    DATABASE_URL=              # optional; defaults to local SQLite in development
    HOME4U_SECRET_KEY=         # recommended in production
    HOME4U_CORS_ORIGINS=       # optional comma-separated direct backend origins
    HOME4U_LOGIN_RATE_LIMIT_ATTEMPTS=    # optional failed attempts per email+IP window
    HOME4U_LOGIN_RATE_LIMIT_IP_ATTEMPTS= # optional failed attempts per source IP window
    HOME4U_LOGIN_RATE_LIMIT_WINDOW_SECONDS= # optional sliding window size
    HOME4U_ENV=                # optional; set to production to move default SQLite outside repo
    HOME4U_DATA_DIR=           # optional; used with HOME4U_ENV=production

    Frontend supports:
    VITE_API_BASE=             # optional; defaults to /api

For production systemd deployments, these backend variables can be supplied through an optional
`/etc/home4u/home4u.env` file referenced by the repo service unit. Login throttling defaults
to `5` failed attempts per email+IP, `20` failed attempts per source IP, and a `300` second window
if the rate-limit variables are not supplied.

Public repository docs and smoke-test examples should use a single `HOME4U_PUBLIC_URL` value
backed by a stable domain or Elastic IP. Avoid committing the temporary EC2 public hostname
into repo documentation.


Do not include secrets or credentials in this file.

---

## Project Structure

application/
│
├── backend/
│   ├── app/
│   │   ├── api/          # Route definitions
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic layer
│   │   ├── core/         # Configuration and security
│   │   └── main.py       # FastAPI entry point
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level pages (Login, Dashboard, ProjectDetails, About)
│   │   ├── services/     # API calls
│   │   └── App.jsx
│   └── package.json
│
└── deployment/
    └── nginx.conf        # Reverse proxy configuration


---

## Contributing

Repository policy:

- The root repository README identifies `master` as the branch used for grading.
- Feature branches are still recommended for isolated work before merging back into `master`.

Code standards:

- Python follows PEP 8 guidelines.
- Use meaningful variable and function names.
- Include docstrings for public functions.
- All backend endpoints should use Pydantic schemas.
- Frontend components should remain modular and reusable.

Suggested pull request workflow:

1. Create a feature branch from `master`.
2. Complete the change and run local verification.
3. Open a pull request for review.
4. Merge back into `master` after approval.

---

## License

License to be determined.

---

## Credits

Team 4 — Home4U

Caleb Ponce — Team Lead / System Architecture

Tyler Morris — Backend & AI Integration

Christopher Quach — Frontend Development

Mason Lee — Data Modeling & Scoring Engine

Dias Almat — Technical Writer

Instructor: Jose Ortiz

---

**Note:**  
This README is expected to evolve from a course artifact into a professional project README. Teams should write it with 
the assumption that it will be read outside the academic context.
