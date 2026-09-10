# Home4U Frontend

Frontend application for Home4U - a room renovation recommendation platform built with React and Vite.

**Live portfolio demo:** https://calebponce.github.io/Home-4-U/

## Project Overview

Home4U helps renters and first-time apartment dwellers transform their living spaces into a desired aesthetic style using structured, data-driven recommendations.

## Tech Stack

- **Framework**: React 19.x
- **Build Tool**: Vite
- **Language**: JavaScript/JSX

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: http://localhost:5173

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm test` - Run optimizer, behavior, accessibility, and smoke checks

## Portfolio Demo Mode

The GitHub Pages workflow builds an API-free portfolio case study by setting `VITE_DEMO_MODE=true` and `VITE_BASE_PATH=/Home-4-U/`. This mode runs the constraint optimizer entirely in the browser against representative data, so reviewers can explore the core product idea without credentials or a paid backend.

The normal build remains the full authenticated product. Demo mode is intentionally a presentation layer over deterministic planning logic—not a replacement for the FastAPI application preserved in the repository.

## API Connection

The frontend communicates with the backend through a proxy configured in vite.config.js:

- API requests to `/api/*` are proxied to `http://localhost:8000`
- CORS is configured to allow connections from `http://localhost:5173`

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable React components
├── demo/            # Browser-side portfolio optimizer and tests
├── pages/           # Page-level components
├── services/        # API service functions
├── App.jsx          # Main application component
├── main.jsx         # Application entry point
└── index.css        # Global styles
```

## Features

- User authentication
- Room project creation and management
- Image upload functionality
- Style selection and comparison
- AI-assisted tag suggestions
- Room resemblance scoring
- Personalized recommendations
- Budget-aware product suggestions

## Team

- **Caleb Ponce** - Team Lead / System Architecture
- **Tyler Morris** - Backend & AI Integration
- **Christopher Quach** - Frontend Development
- **Mason Lee** - Data Modeling & Scoring Engine
- **Dias Almat** - Technical Writer

## License

Home4U is available under the repository's [MIT License](../../LICENSE).

