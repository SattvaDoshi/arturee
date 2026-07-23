import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { authApi } from '../../api/index.js'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      const { token, user } = res.data
      login(token, user)
      
      setTimeout(() => {
        if (user.role === 'admin' && from === '/dashboard') {
          navigate('/admin', { replace: true })
        } else {
          navigate(from, { replace: true })
        }
      }, 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-display antialiased"
      style={{ background: 'linear-gradient(160deg,#e0f7fa 0%,#b2ebf2 50%,#e8f5e9 100%)' }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-25 blur-3xl" style={{ background: '#4DD0E1' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#C0E863' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg hover:scale-105 transition"
            style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
          >
            <span className="text-[#051d2e] font-black text-2xl leading-none select-none">A</span>
          </Link>
          <h1 className="text-3xl font-black text-[#051d2e] tracking-tight">Welcome back</h1>
          <p className="text-sm text-[#051d2e]/55 mt-1.5">Sign in to your arturee account</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border border-[#4DD0E1]/25 shadow-2xl backdrop-blur-sm"
          style={{ background: 'rgba(255,255,255,0.88)' }}
        >
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#051d2e]/55 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4DD0E1]" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#4DD0E1]/30 rounded-xl py-3 pl-11 pr-4 text-sm text-[#051d2e] focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50 focus:border-[#4DD0E1] transition placeholder:text-[#051d2e]/30"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#051d2e]/55 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#00BCD4] hover:text-[#051d2e] transition">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4DD0E1]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#4DD0E1]/30 rounded-xl py-3 pl-11 pr-11 text-sm text-[#051d2e] focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50 focus:border-[#4DD0E1] transition placeholder:text-[#051d2e]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#051d2e]/40 hover:text-[#051d2e] transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-[#051d2e] hover:opacity-90 active:scale-[0.98] transition text-sm mt-1 shadow-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#4DD0E1]/20" />
            <span className="text-xs font-semibold text-[#051d2e]/35 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-[#4DD0E1]/20" />
          </div>

          {/* Google */}
          <button className="w-full py-3 rounded-xl border border-[#4DD0E1]/30 text-sm font-semibold text-[#051d2e]/65 hover:border-[#4DD0E1] hover:text-[#051d2e] hover:bg-white/60 transition flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-sm text-center text-[#051d2e]/55">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-[#00BCD4] hover:text-[#051d2e] transition">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
