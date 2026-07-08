import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { authApi } from '../api/index.js'
import { useAuth } from '../context/AuthContext'

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const email = location.state?.email || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index, e) => {
    const value = e.target.value
    if (isNaN(value)) return

    const newOtp = [...otp]
    // allow pasting
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('')
      pasted.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + pasted.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    newOtp[index] = value
    setOtp(newOtp)

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const otpCode = otp.join('')
    try {
      const res = await authApi.verifyOTP({ email, otp: otpCode })
      const { token, user } = res.data
      login(token, user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await authApi.resendOTP({ email })
      setError('')
    } catch (err) {
      setError('Failed to resend OTP.')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-display antialiased relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#e0f7fa 0%,#b2ebf2 50%,#e8f5e9 100%)' }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse" style={{ background: '#C0E863' }} />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full opacity-25 blur-3xl animate-pulse" style={{ background: '#4DD0E1' }} />
      </div>

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-5 duration-500">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg border-2 border-white/50 bg-white/40 backdrop-blur-md relative">
            <Mail className="w-8 h-8 text-[#051d2e]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#e0f7fa]"></div>
          </div>
          <h1 className="text-3xl font-black text-[#051d2e] tracking-tight">Verify Your Email</h1>
          <p className="text-sm text-[#051d2e]/60 mt-2 px-4 leading-relaxed">
            We've sent a 6-digit verification code to <br className="hidden sm:block" />
            <span className="font-bold text-[#00BCD4]">{email || 'your email'}</span>
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 border border-[#4DD0E1]/25 shadow-2xl backdrop-blur-md relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.85)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />
          
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-[#051d2e] bg-white/70 border-2 rounded-xl transition-all outline-none focus:ring-4 focus:ring-[#4DD0E1]/30
                    ${digit ? 'border-[#4DD0E1] scale-105 shadow-md' : 'border-[#4DD0E1]/20 hover:border-[#4DD0E1]/50'}
                  `}
                />
              ))}
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={otp.some(d => d === '') || loading}
                className="w-full py-4 rounded-xl font-black text-[#051d2e] hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:scale-100"
                style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
              
              <p className="text-center text-sm font-semibold text-[#051d2e]/55">
                Didn't receive the code?{' '}
                <button type="button" onClick={handleResend} className="text-[#00BCD4] hover:text-[#051d2e] underline underline-offset-2 transition-colors">
                  Resend OTP
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
