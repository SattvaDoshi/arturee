import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, ArrowLeft, KeyRound, Loader2, AlertCircle } from 'lucide-react'
import { authApi } from '../../api/index.js'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const emailParam = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token || !emailParam) {
      setError('Invalid or missing reset token.')
    }
  }, [token, emailParam])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    setError('')
    try {
      await authApi.resetPassword({ email: emailParam, token, newPassword: password })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-display antialiased relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#e0f7fa 0%,#b2ebf2 50%,#e8f5e9 100%)' }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-10 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse" style={{ background: '#C0E863' }} />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-25 blur-3xl animate-pulse" style={{ background: '#4DD0E1' }} />
      </div>

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-5 duration-500">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg border-2 border-white/50 bg-white/40 backdrop-blur-md relative">
            <KeyRound className="w-8 h-8 text-[#051d2e]" />
          </div>
          <h1 className="text-3xl font-black text-[#051d2e] tracking-tight">Create New Password</h1>
          <p className="text-sm text-[#051d2e]/60 mt-2 px-4 leading-relaxed">
            {submitted 
              ? "Your password has been successfully reset." 
              : "Please enter your new password below."}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 border border-[#4DD0E1]/25 shadow-2xl backdrop-blur-md relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.85)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[#051d2e]/55 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4DD0E1]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/90 border-2 border-[#4DD0E1]/20 rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#051d2e] focus:outline-none focus:ring-4 focus:ring-[#4DD0E1]/20 focus:border-[#4DD0E1] transition-all placeholder:text-[#051d2e]/30 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#051d2e]/55 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4DD0E1]" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/90 border-2 border-[#4DD0E1]/20 rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#051d2e] focus:outline-none focus:ring-4 focus:ring-[#4DD0E1]/20 focus:border-[#4DD0E1] transition-all placeholder:text-[#051d2e]/30 shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token || !emailParam}
                className="w-full flex items-center justify-center py-3.5 rounded-xl font-black text-[#051d2e] hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-lg border border-white/50 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="relative z-10 text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-[#e8f5e9] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#C0E863]">
                <KeyRound className="w-8 h-8 text-[#4caf50]" />
              </div>
              <h3 className="text-lg font-bold text-[#051d2e] mb-2">Password Reset!</h3>
              <p className="text-sm text-[#051d2e]/60 mb-6">
                Your password has been changed successfully.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-xl font-bold bg-[#051d2e]/5 text-[#051d2e] hover:bg-[#051d2e]/10 transition-all text-sm border border-[#051d2e]/10"
              >
                Log In
              </button>
            </div>
          )}

          {!submitted && (
            <div className="mt-6 text-center relative z-10">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm font-bold text-[#051d2e]/60 hover:text-[#051d2e] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
