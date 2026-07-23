import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, Loader2, AlertCircle } from 'lucide-react'
import UserLayout from '../../components/layout/UserLayout'
import { purchaseApi } from '../../api/index.js'

const C = {
  navy:    '#051d2e',
  primary: '#4DD0E1',
  teal:    '#00BCD4',
  lime:    '#C0E863',
  muted:   '#4a7080',
}

/* ─── Load Razorpay checkout script once ─────────────── */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.id  = 'razorpay-sdk'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/* ─── Format helpers ─────────────────────────────────── */
const fmtINR = (paise) => `₹${(paise / 100).toFixed(2)}`
const fmtPrice = (price) => {
  if (!price) return 'Free'
  // price may already be in rupees from the video object
  return `₹${Number(price).toFixed(2)}`
}

/* ══════════════════════════════════════════════════════ */
export default function Checkout() {
  const navigate  = useNavigate()
  const location  = useLocation()

  /**
   * Expected state from navigate:
   *   { videoId, title, price, thumbnail }  — for a video purchase
   * Fallback to demo if nothing is passed.
   */
  const checkoutData = location.state || null

  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  // Redirect to dashboard if no checkout data
  useEffect(() => {
    if (!checkoutData?.videoId) {
      navigate('/dashboard', { replace: true })
    }
  }, [checkoutData, navigate])

  /* ── Initiate Razorpay payment ── */
  const handlePay = useCallback(async () => {
    setStatus('loading')
    setErrorMsg('')

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Razorpay SDK could not be loaded. Check your internet connection.')

      // 2. Create order on backend
      const orderRes = await purchaseApi.createOrder({ videoId: checkoutData.videoId })
      const { orderId, amount, currency, purchaseId, videoTitle } = orderRes.data.data

      // 3. Open Razorpay checkout modal
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RmCmc4bECn3PRU',
          amount,
          currency:    currency || 'INR',
          order_id:    orderId,
          name:        'Arturee',
          description: videoTitle || checkoutData.title || 'Video Purchase',
          image:       '/logo.png', // optional — uses fallback if not found
          theme: {
            color: '#4DD0E1',
          },
          prefill: {
            // Razorpay can prefill from user profile; we leave it optional
          },
          handler: async (response) => {
            try {
              // 4. Verify on backend
              await purchaseApi.verify({
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                purchaseId,
              })
              resolve()
            } catch (verifyErr) {
              reject(new Error(verifyErr.response?.data?.message || 'Payment verification failed.'))
            }
          },
          modal: {
            ondismiss: () => reject(new Error('DISMISSED')),
          },
        })
        rzp.on('payment.failed', (failResp) => {
          reject(new Error(failResp.error?.description || 'Payment failed.'))
        })
        rzp.open()
      })

      setStatus('success')
      // Redirect to purchased library after 2.5 seconds
      setTimeout(() => navigate('/dashboard/purchased', { replace: true }), 2500)

    } catch (err) {
      if (err.message === 'DISMISSED') {
        setStatus('idle')
      } else {
        setErrorMsg(err.response?.data?.message || err.message || 'Something went wrong.')
        setStatus('error')
      }
    }
  }, [checkoutData, navigate])

  /* ── Success screen ── */
  if (status === 'success') {
    return (
      <UserLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg,rgba(77,208,225,0.2),rgba(192,232,99,0.3))' }}
          >
            <CheckCircle2 className="w-12 h-12" style={{ color: C.teal }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: C.navy }}>
            Payment Successful!
          </h2>
          <p className="text-lg mb-2" style={{ color: C.muted }}>
            You now own <strong>{checkoutData?.title}</strong>.
          </p>
          <p className="text-sm mb-8" style={{ color: C.muted }}>
            Redirecting to your library…
          </p>
          <button
            onClick={() => navigate('/dashboard/purchased')}
            className="px-8 py-3 rounded-full font-bold text-lg shadow-lg"
            style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: C.navy }}
          >
            Go to Library
          </button>
        </div>
      </UserLayout>
    )
  }

  /* ── Guard: no data ── */
  if (!checkoutData?.videoId) return null

  const priceDisplay = fmtPrice(checkoutData.price)
  const amountPaise  = Math.round(Number(checkoutData.price) * 100)

  return (
    <UserLayout>
      <div className="min-h-screen px-4 py-8 md:py-14" style={{ background: '#f8fafc' }}>
        <div className="max-w-3xl mx-auto">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition hover:bg-gray-200 mb-8"
            style={{ color: C.navy }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── Order Summary ── */}
            <div className="lg:col-span-2 space-y-6">
              <div
                className="rounded-3xl p-6 bg-white border shadow-sm"
                style={{ borderColor: 'rgba(77,208,225,0.2)' }}
              >
                <h3
                  className="text-xl font-black mb-6 uppercase tracking-tight"
                  style={{ color: C.navy }}
                >
                  Order Summary
                </h3>

                {/* Video thumbnail + title */}
                <div className="flex gap-4 items-start mb-6">
                  {checkoutData.thumbnail && (
                    <img
                      src={checkoutData.thumbnail}
                      alt={checkoutData.title}
                      className="w-24 h-16 object-cover rounded-xl shadow-sm shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1"
                      style={{ background: 'rgba(77,208,225,0.12)', color: C.teal }}
                    >
                      Lifetime Access
                    </span>
                    <h4 className="font-bold text-sm leading-snug line-clamp-3" style={{ color: C.navy }}>
                      {checkoutData.title}
                    </h4>
                  </div>
                </div>

                {/* Pricing breakdown */}
                <div
                  className="space-y-3 pt-4 text-sm"
                  style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{priceDisplay}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes &amp; fees</span>
                    <span>Included</span>
                  </div>
                  <div
                    className="flex justify-between font-black text-lg pt-3"
                    style={{ borderTop: '1px solid rgba(0,0,0,0.06)', color: C.navy }}
                  >
                    <span>Total</span>
                    <span>{priceDisplay}</span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-col gap-2">
                {[
                  { icon: Lock, text: 'AES-256 Encrypted Payment' },
                  { icon: ShieldCheck, text: 'Powered by Razorpay — PCI-DSS Compliant' },
                  { icon: CheckCircle2, text: 'Instant Access After Payment' },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-xs text-gray-400 font-medium"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-[#4DD0E1]" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Payment Panel ── */}
            <div className="lg:col-span-3">
              <div
                className="rounded-3xl p-6 md:p-10 bg-white border shadow-sm"
                style={{ borderColor: 'rgba(77,208,225,0.2)' }}
              >
                <h3 className="text-2xl font-black mb-2" style={{ color: C.navy }}>
                  Complete Purchase
                </h3>
                <p className="text-sm mb-8" style={{ color: C.muted }}>
                  Securely pay via Razorpay — supports UPI, Cards, Net Banking, Wallets &amp; more.
                </p>

                {/* Razorpay method icons */}
                <div
                  className="grid grid-cols-4 gap-3 mb-8 p-4 rounded-2xl"
                  style={{ background: 'rgba(77,208,225,0.05)', border: '1px solid rgba(77,208,225,0.12)' }}
                >
                  {[
                    { label: 'UPI', emoji: '📲' },
                    { label: 'Cards', emoji: '💳' },
                    { label: 'Net Banking', emoji: '🏦' },
                    { label: 'Wallets', emoji: '👛' },
                  ].map(({ label, emoji }) => (
                    <div key={label} className="flex flex-col items-center gap-1">
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-[10px] font-semibold text-gray-500">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Error */}
                {status === 'error' && (
                  <div
                    className="flex items-start gap-3 p-4 rounded-2xl mb-6"
                    style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-500 font-medium">{errorMsg}</p>
                  </div>
                )}

                {/* Pay button */}
                <button
                  id="pay-now-btn"
                  onClick={handlePay}
                  disabled={status === 'loading'}
                  className="w-full py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition hover:opacity-90 active:scale-98 disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg,#4DD0E1,#C0E863)',
                    color: C.navy,
                  }}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Opening Razorpay…
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay {priceDisplay} Securely
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  By paying, you agree to our Terms of Service. All purchases are final.
                </p>

                {/* Test card hint (only in development) */}
                {import.meta.env.DEV && (
                  <div
                    className="mt-6 p-4 rounded-2xl text-xs space-y-1"
                    style={{ background: 'rgba(192,232,99,0.08)', border: '1px solid rgba(192,232,99,0.2)' }}
                  >
                    <p className="font-black text-[#051d2e]/60 uppercase tracking-widest">🧪 Test Mode</p>
                    <p className="text-gray-500">Card: <code className="font-mono">4111 1111 1111 1111</code></p>
                    <p className="text-gray-500">Expiry: any future date &nbsp; CVV: any 3 digits</p>
                    <p className="text-gray-500">UPI: <code className="font-mono">success@razorpay</code></p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </UserLayout>
  )
}
