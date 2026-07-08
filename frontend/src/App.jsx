import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ArtistModalProvider } from './context/ArtistModalContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import JoinArtistModal from './components/modals/JoinArtistModal'

// Public
import Landing from './pages/Landing/Landing'
import VideoDetail from './pages/VideoDetail'

// Auth
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'

// Dashboards (each brings its own layout)
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Account from './pages/Account'
import ContinueWatching from './pages/ContinueWatching'
import MyList from './pages/MyList'
import Purchased from './pages/Purchased'
import Checkout from './pages/Checkout'
import AboutUs from './pages/Landing/AboutUs'
import Pricing from './pages/Landing/Pricing'
import Genre from './pages/Landing/Genre'
import Artist from './pages/Landing/Artist'
import ArtistDetail from './pages/ArtistDetail'

/** True when the app is running as an installed PWA (standalone) */
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

const App = () => {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('appSplashShown'))

  const handleSplashComplete = () => {
    sessionStorage.setItem('appSplashShown', 'true')
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <AuthProvider>
        <ArtistModalProvider>
          <CartProvider>
            <JoinArtistModal />
          <BrowserRouter>
            <Routes>
            {/* ── Public / Landing ── */}
            {/* Installed PWA → skip landing, go straight to dashboard */}
            <Route
              path="/"
              element={isStandalone() ? <Navigate to="/dashboard" replace /> : <Landing />}
            />
            <Route path="/video" element={<VideoDetail />} />
            <Route path="/video/:videoId" element={<VideoDetail />} />

            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/genres" element={<Genre />} />
            <Route path="/artists" element={<Artist />} />
            <Route path="/artist/:artistId" element={<ArtistDetail />} />
            <Route path="/artist/marcus-cole" element={<ArtistDetail />} />

            {/* ── Auth ── */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* ── User Dashboard (protected) ── */}
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/continue" element={<ProtectedRoute><ContinueWatching /></ProtectedRoute>} />
            <Route path="/dashboard/mylist" element={<ProtectedRoute><MyList /></ProtectedRoute>} />
            <Route path="/dashboard/purchased" element={<ProtectedRoute><Purchased /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

            {/* ── Admin Dashboard (admin-only) ── */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Routes>
          </BrowserRouter>
          </CartProvider>
        </ArtistModalProvider>
      </AuthProvider>
    </>
  )
}

export default App