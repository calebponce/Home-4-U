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

Identifying key visual elements through AI-assisted tagging

Comparing the room against structured style definitions

Computing a weighted resemblance score

Generating prioritized, budget-aware recommendations

Suggesting curated product items aligned with the selected style

The system focuses on explainability, personalization, and structured decision support rather than simple inspiration browsing.

---

## Features

User authentication and account management

Room project creation and management

Image upload and AI-assisted tag suggestion

Multi-style comparison engine

Weighted resemblance scoring algorithm

Budget-aware prioritization of recommendations

Curated product suggestions

Administrative style and weight management

---

## Installation and Setup

Describe how to set up the application locally or in a development environment.

Prerequisites:

- Python 3.12.x
- Node.js 18+
- PostgreSQL 14+
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
python -m venv .venv
# Windows: .venv\Scripts\activate
# Mac/Linux: 
source .venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload
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
npm run dev
```


Frontend will run at:

http://localhost:5173

---

## Usage

Explain how to run and use the application once it is installed.

Create an account.

Create a new Room Project.

Upload a room image.

Select one or more target styles.

Confirm or adjust AI-suggested tags.

View resemblance score.

Review prioritized recommendations.

Explore curated product suggestions.

Screenshots or short examples may be added if helpful.

---

## Configuration

Environment Variables: 
    Backend requires: 
    DATABASE_URL=
    OPENAI_API_KEY=
    JWT_SECRET_KEY=


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
│   │   ├── pages/        # Route-level pages
│   │   ├── services/     # API calls
│   │   └── App.jsx
│   └── package.json
│
└── deployment/
    └── nginx/            # Reverse proxy configuration


---

## Contributing

Describe how contributors should work with the codebase:

Branching Strategy

master (or main) — stable branch

Feature branches:
feature/backend-auth
feature/frontend-upload

Code Standards: 

Python follows PEP 8 guidelines.

Use meaningful variable and function names.

Include docstrings for public functions.

All backend endpoints must use Pydantic schemas.

Frontend components must be modular and reusable

Pull Request Workflow: 

Create feature branch.

Complete feature.

Ensure code runs locally.

Submit pull request.

Require at least one team review before merge.

This section is especially important if the project is continued after the course.

---

## License

Specify the license under which this project is released, if applicable.

If no license has been chosen yet, state that explicitly.

License to be determined.

---

## Credits

List the project contributors and their roles.

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
