import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Public
import Landing from './pages/Landing'
import VideoDetail from './pages/VideoDetail'

// Auth
import Login from './pages/Login'
import Signup from './pages/Signup'

// Dashboards (each brings its own layout)
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Account from './pages/Account'
import ContinueWatching from './pages/ContinueWatching'
import MyList from './pages/MyList'
import Purchased from './pages/Purchased'

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

        {/* ── Auth ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── User Dashboard (UserLayout) ── */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/dashboard/continue" element={<ContinueWatching />} />
        <Route path="/dashboard/mylist" element={<MyList />} />
        <Route path="/dashboard/purchased" element={<Purchased />} />
        <Route path="/account" element={<Account />} />

        {/* ── Admin Dashboard (AdminLayout) ── */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App