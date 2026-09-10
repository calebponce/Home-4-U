# Home4U Frontend

Frontend application for Home4U - a room renovation recommendation platform built with React and Vite.

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

## API Connection

The frontend communicates with the backend through a proxy configured in vite.config.js:

- API requests to `/api/*` are proxied to `http://localhost:8000`
- CORS is configured to allow connections from `http://localhost:5173`

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable React components
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

