import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AmbienceProvider } from './context/AmbienceContext'
import { ApiHealthProvider } from './context/ApiHealthContext'
import './styles/tokens.css'
import './styles/atmosphere.css'
import './styles/skeletons.css'
import './styles/material.css'
import './index.css'
import App from './App.jsx'

const PORTFOLIO_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {PORTFOLIO_DEMO_MODE ? (
      <App />
    ) : (
      <BrowserRouter>
        <AuthProvider>
          <AmbienceProvider>
            <ApiHealthProvider>
              <App />
            </ApiHealthProvider>
          </AmbienceProvider>
        </AuthProvider>
      </BrowserRouter>
    )}
  </StrictMode>,
)
