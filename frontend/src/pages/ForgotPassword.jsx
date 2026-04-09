import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, KeyRound } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    // Optional: navigate back to login after brief delay or manual click
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
          <h1 className="text-3xl font-black text-[#051d2e] tracking-tight">Reset Password</h1>
          <p className="text-sm text-[#051d2e]/60 mt-2 px-4 leading-relaxed">
            {submitted 
              ? "Check your inbox for reset instructions." 
              : "Enter your email address and we'll send you a link to reset your password."}
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
              <div>
                <label className="block text-xs font-bold text-[#051d2e]/55 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4DD0E1]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full bg-white/90 border-2 border-[#4DD0E1]/20 rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#051d2e] focus:outline-none focus:ring-4 focus:ring-[#4DD0E1]/20 focus:border-[#4DD0E1] transition-all placeholder:text-[#051d2e]/30 shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-black text-[#051d2e] hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-lg border border-white/50"
                style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
              >
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="relative z-10 text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-[#e8f5e9] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#C0E863]">
                <Mail className="w-8 h-8 text-[#4caf50]" />
              </div>
              <h3 className="text-lg font-bold text-[#051d2e] mb-2">Email Sent!</h3>
              <p className="text-sm text-[#051d2e]/60 mb-6">
                We've sent a password reset link to <span className="font-bold text-[#051d2e]">{email}</span>.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-xl font-bold bg-[#051d2e]/5 text-[#051d2e] hover:bg-[#051d2e]/10 transition-all text-sm border border-[#051d2e]/10"
              >
                Return to Login
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
