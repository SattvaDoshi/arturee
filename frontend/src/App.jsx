import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
import SplashScreen from './components/SplashScreen'
import { CartProvider } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider, GlobalToastListener } from './context/ToastContext'
import { ArtistModalProvider } from './context/ArtistModalContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import JoinArtistModal from './components/modals/JoinArtistModal'
import KickedModal from './components/KickedModal'

// ── Landing ──────────────────────────────────────────────
import Landing      from './pages/landing/Landing'
import AboutUs      from './pages/landing/AboutUs'
import ArtistPage   from './pages/landing/Artist'
import Genre        from './pages/landing/Genre'
import GenreDetail  from './pages/landing/GenreDetail'
import Pricing      from './pages/landing/Pricing'

// ── Auth ─────────────────────────────────────────────────
import Login          from './pages/auth/Login'
import Signup         from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'
import VerifyOTP      from './pages/auth/VerifyOTP'

// ── User Dashboard ────────────────────────────────────────
import UserDashboard   from './pages/dashboard/UserDashboard'
import ContinueWatching from './pages/dashboard/ContinueWatching'
import MyList          from './pages/dashboard/MyList'
import Purchased       from './pages/dashboard/Purchased'
import Checkout        from './pages/dashboard/Checkout'

// ── Account ───────────────────────────────────────────────
import Account from './pages/account/Account'

// ── Admin ─────────────────────────────────────────────────
import AdminDashboard from './pages/admin/index'
import AdminVideos    from './pages/admin/VideosPage'
import AdminUsers     from './pages/admin/UsersPage'
import AdminArtists   from './pages/admin/ArtistsPage'
import AdminUpload    from './pages/admin/UploadPage'
import AdminUploadSeries from './pages/admin/UploadSeriesPage'
import AdminSlider    from './pages/admin/SliderPage'
import AdminRevenue   from './pages/admin/RevenuePage'
import AdminApps      from './pages/admin/ApplicationsPage'
import AdminGenres    from './pages/admin/GenresPage'
import AdminCategories from './pages/admin/CategoriesPage'
import AdminSpecialties from './pages/admin/SpecialtiesPage'
import AdminLandingConfig from './pages/admin/LandingPageConfig'

// ── Shared ────────────────────────────────────────────────
import VideoDetail  from './pages/VideoDetail'
import ArtistDetail from './pages/ArtistDetail'

/** Reads kickedReason from AuthContext and renders the modal when set. */
const KickedSessionGate = () => {
  const { kickedReason, dismissKicked } = useAuth()
  return <KickedModal reason={kickedReason} onDismiss={dismissKicked} />
}

/** True when the app is running as an installed PWA */
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
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <ToastProvider>
        <GlobalToastListener />
        <AuthProvider>
          <ArtistModalProvider>
          <CartProvider>
            <BrowserRouter>
              <ScrollToTop />
              <JoinArtistModal />
              {/* ── Global kicked-session modal ──────────────────────────────
                   Sits inside AuthProvider so it can read kickedReason.       */}
              <KickedSessionGate />
              <Routes>
                {/* ── Landing ── */}
                <Route path="/" element={isStandalone() ? <Navigate to="/dashboard" replace /> : <Landing />} />
                <Route path="/aboutus"  element={<AboutUs />} />
                <Route path="/pricing"  element={<Pricing />} />
                <Route path="/genres"   element={<Genre />} />
                <Route path="/artists"  element={<ArtistPage />} />

                {/* ── Video & Artist detail (public) ── */}
                <Route path="/video"          element={<VideoDetail />} />
                <Route path="/video/:videoId" element={<VideoDetail />} />
                <Route path="/artist/:artistId"    element={<ArtistDetail />} />
                <Route path="/artist/marcus-cole"  element={<ArtistDetail />} />
                <Route path="/genre/:genreId"      element={<GenreDetail />} />

                {/* ── Auth ── */}
                <Route path="/login"           element={<Login />} />
                <Route path="/signup"          element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password"  element={<ResetPassword />} />
                <Route path="/verify-otp"      element={<VerifyOTP />} />

                {/* ── User Dashboard (protected) ── */}
                <Route path="/dashboard"           element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/continue"  element={<ProtectedRoute><ContinueWatching /></ProtectedRoute>} />
                <Route path="/dashboard/mylist"    element={<ProtectedRoute><MyList /></ProtectedRoute>} />
                <Route path="/dashboard/purchased" element={<ProtectedRoute><Purchased /></ProtectedRoute>} />
                <Route path="/checkout"            element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/account"             element={<ProtectedRoute><Account /></ProtectedRoute>} />

                {/* ── Admin (admin-only) ── */}
                <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/landing"   element={<AdminRoute><AdminLandingConfig /></AdminRoute>} />
                <Route path="/admin/videos"    element={<AdminRoute><AdminVideos /></AdminRoute>} />
                <Route path="/admin/slider"    element={<AdminRoute><AdminSlider /></AdminRoute>} />
                <Route path="/admin/revenue"   element={<AdminRoute><AdminRevenue /></AdminRoute>} />
                <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/artists"   element={<AdminRoute><AdminArtists /></AdminRoute>} />
                <Route path="/admin/upload"    element={<AdminRoute><AdminUpload /></AdminRoute>} />
                <Route path="/admin/upload-series" element={<AdminRoute><AdminUploadSeries /></AdminRoute>} />
                <Route path="/admin/applications" element={<AdminRoute><AdminApps /></AdminRoute>} />
                <Route path="/admin/genres"    element={<AdminRoute><AdminGenres /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
                <Route path="/admin/specialties" element={<AdminRoute><AdminSpecialties /></AdminRoute>} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </ArtistModalProvider>
      </AuthProvider>
      </ToastProvider>
    </>
    </GoogleOAuthProvider>
  )
}

export default App