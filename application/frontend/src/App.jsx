import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProjectDetails from './pages/ProjectDetails'
import About from './pages/About'
import VirtualTour3D from './pages/VirtualTour3D'
import Workspace from './pages/Workspace'
import NotFound from './pages/NotFound'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import PageMotion from './components/PageMotion'

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth()
  
  if (loading) {
    return <div className="loading">Loading...</div>
  }
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main-content">
        <PageMotion>
          {children}
        </PageMotion>
      </main>
    </div>
  )
}

function App() {
  const location = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (prefersReducedMotion || !finePointer) return

    let activeEl = null
    let rafId = 0
    let pointerX = 0
    let pointerY = 0

    const resetEl = (el) => {
      if (!el) return
      el.classList.remove('is-tilting')
      el.style.removeProperty('--tilt-mx')
      el.style.removeProperty('--tilt-my')
      el.style.removeProperty('--tilt-rx')
      el.style.removeProperty('--tilt-ry')
    }

    const tick = () => {
      rafId = 0
      if (!activeEl) return
      const rect = activeEl.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      const x = Math.max(0, Math.min(1, (pointerX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (pointerY - rect.top) / rect.height))

      const rx = (0.5 - y) * 8
      const ry = (x - 0.5) * 10

      activeEl.style.setProperty('--tilt-mx', `${(x * 100).toFixed(1)}%`)
      activeEl.style.setProperty('--tilt-my', `${(y * 100).toFixed(1)}%`)
      activeEl.style.setProperty('--tilt-rx', `${rx.toFixed(2)}deg`)
      activeEl.style.setProperty('--tilt-ry', `${ry.toFixed(2)}deg`)
    }

    const requestTick = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(tick)
    }

    const onPointerMove = (event) => {
      if (!(event.target instanceof Element)) return
      const next = event.target.closest('[data-tilt]') || null
      if (next !== activeEl) {
        resetEl(activeEl)
        activeEl = next
        if (activeEl) activeEl.classList.add('is-tilting')
      }

      if (!activeEl) return
      pointerX = event.clientX
      pointerY = event.clientY
      requestTick()
    }

    const onScroll = () => {
      if (!activeEl) return
      requestTick()
    }

    const onBlur = () => {
      resetEl(activeEl)
      activeEl = null
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('blur', onBlur)

    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('blur', onBlur)
      if (rafId) window.cancelAnimationFrame(rafId)
      resetEl(activeEl)
      activeEl = null
    }
  }, [])

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageMotion><Login /></PageMotion>} />
          <Route path="/about" element={<PageMotion><About /></PageMotion>} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/project/:id" 
            element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/virtual-tour"
            element={
              <ProtectedRoute>
                <VirtualTour3D />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Catch-all route for undefined paths */}
          <Route path="*" element={<PageMotion><NotFound /></PageMotion>} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  )
}

export default App
