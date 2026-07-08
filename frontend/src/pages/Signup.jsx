import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { authApi } from '../api/index.js'

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await authApi.signup({ name, email, password })
      navigate('/verify-otp', { state: { email } })
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
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
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#C0E863' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-25 blur-3xl" style={{ background: '#4DD0E1' }} />
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
          <h1 className="text-3xl font-black text-[#051d2e] tracking-tight">Join arturee</h1>
          <p className="text-sm text-[#051d2e]/55 mt-1.5">Discover and support independent creators</p>
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
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#051d2e]/55 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4DD0E1]" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#4DD0E1]/30 rounded-xl py-3 pl-11 pr-4 text-sm text-[#051d2e] focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50 focus:border-[#4DD0E1] transition placeholder:text-[#051d2e]/30"
                />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-[#051d2e]/55 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4DD0E1]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-[#051d2e]/55 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4DD0E1]" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-white border border-[#4DD0E1]/30 rounded-xl py-3 pl-11 pr-11 text-sm text-[#051d2e] focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50 focus:border-[#4DD0E1] transition placeholder:text-[#051d2e]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#051d2e]/40 hover:text-[#051d2e] transition"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-[#051d2e]/45 leading-relaxed">
              By signing up you agree to our{' '}
              <button type="button" className="font-semibold text-[#00BCD4] hover:text-[#051d2e] transition">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="font-semibold text-[#00BCD4] hover:text-[#051d2e] transition">Privacy Policy</button>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-[#051d2e] hover:opacity-90 active:scale-[0.98] transition text-sm shadow-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
            >
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#4DD0E1]/20" />
            <span className="text-xs font-semibold text-[#051d2e]/35 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-[#4DD0E1]/20" />
          </div>

          {/* Social placeholder */}
          <button className="w-full py-3 rounded-xl border border-[#4DD0E1]/30 text-sm font-semibold text-[#051d2e]/65 hover:border-[#4DD0E1] hover:text-[#051d2e] hover:bg-white/60 transition flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <p className="mt-6 text-sm text-center text-[#051d2e]/55">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#00BCD4] hover:text-[#051d2e] transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
