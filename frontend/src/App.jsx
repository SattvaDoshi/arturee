import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Public
import Landing from './pages/Landing'
import VideoDetail from './pages/VideoDetail'

// Dashboards (each brings its own layout)
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'

/** True when the app is running as an installed PWA (standalone) */
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public / Landing ── */}
        {/* Installed PWA → skip landing, go straight to dashboard */}
        <Route
          path="/"
          element={isStandalone() ? <Navigate to="/dashboard" replace /> : <Landing />}
        />
        <Route path="/video" element={<VideoDetail />} />

        {/* ── User Dashboard (UserLayout) ── */}
        <Route path="/dashboard" element={<UserDashboard />} />

        {/* ── Admin Dashboard (AdminLayout) ── */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App