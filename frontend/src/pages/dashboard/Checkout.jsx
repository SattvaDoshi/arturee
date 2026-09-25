import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, Loader2, AlertCircle } from 'lucide-react'
import UserLayout from '../../components/layout/UserLayout'
import { purchaseApi } from '../../api/index.js'
import { useCart } from '../../context/CartContext'

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
const parsePrice = (val) => {
  return parseFloat(String(val || '0').replace(/[^0-9.]/g, '').replace(/^\.+/, '')) || 0;
}

const fmtPrice = (price) => {
  if (!price) return 'Free'
  return `₹${parsePrice(price).toFixed(2)}`
}

/* ══════════════════════════════════════════════════════ */
export default function Checkout() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { setCart } = useCart()

  /**
   * Expected state from navigate:
   *   Single item: { videoId, title, price, thumbnail }
   *   Cart: { items: [...], subtotal, discount, total }
   */
  const checkoutData = location.state || null
  const isCartOrigin = !!checkoutData?.items
  const [items, setItems] = useState(() => {
    return isCartOrigin ? checkoutData.items : (checkoutData ? [checkoutData] : [])
  })

  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  // Redirect to dashboard if no checkout data
  useEffect(() => {
    if (!items.length) {
      navigate('/dashboard', { replace: true })
    }
  }, [items, navigate])

  /* ── Initiate Razorpay payment ── */
  const handlePay = useCallback(async () => {
    setStatus('loading')
    setErrorMsg('')

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Razorpay SDK could not be loaded. Check your internet connection.')

      // 2. Create order on backend
      const videoIds = items.map(i => i.videoId)
      const orderRes = await purchaseApi.createOrder({ videoIds })
      const { orderId, amount, currency, purchaseId, videoTitle } = orderRes.data.data

      // 3. Open Razorpay checkout modal
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Tej4v0plBEgW74',
          amount,
          currency:    currency || 'INR',
          order_id:    orderId,
          name:        'Arturee',
          description: videoTitle || (items.length > 1 ? `${items.length} Videos` : items[0]?.title) || 'Video Purchase',
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
              })
              
              if (isCartOrigin) {
                setCart([]) // clear cart on success
              }
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
            You now own <strong>{items.length > 1 ? `${items.length} videos` : items[0]?.title}</strong>.
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
  if (!items.length) return null

  const subtotal = items.reduce((acc, item) => acc + parsePrice(item.price), 0)
  const platformFee = subtotal * 0.03
  const total = subtotal + platformFee
  
  const subtotalDisplay = fmtINR(subtotal * 100)
  const platformFeeDisplay = fmtINR(platformFee * 100)
  const priceDisplay = fmtINR(total * 100)

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

                {/* Video list */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-20 h-14 object-cover rounded-lg shadow-sm shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm leading-snug line-clamp-2" style={{ color: C.navy }}>
                          {item.title}
                        </h4>
                        {item.artistName && (
                          <p className="text-xs text-[#051d2e]/60 mt-0.5">{item.artistName}</p>
                        )}
                      </div>
                      <div className="text-sm font-semibold shrink-0">
                        {fmtPrice(item.price)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing breakdown */}
                <div
                  className="space-y-3 pt-4 text-sm"
                  style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} item{items.length !== 1 && 's'})</span>
                    <span>{subtotalDisplay}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Taxes &amp; fees (3%)</span>
                    <span>{platformFee > 0 ? platformFeeDisplay : 'Included'}</span>
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

                {/* Test card hint removed as per request */}
              </div>
            </div>
            
          </div>
          
          {/* Suggested Videos */}
          <SuggestedCheckoutVideos currentItems={items} setItems={setItems} />
        </div>
      </div>
    </UserLayout>
  )
}

import { ShoppingCart } from 'lucide-react'

function SuggestedCheckoutVideos({ currentItems, setItems }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const { toggleCart, getCartSummary } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    import('../../api/index.js').then(({ videoApi }) => {
      videoApi.list({ limit: 5, sort: 'popular' })
        .then(res => {
          const vids = res.data?.data?.videos || res.data?.data || []
          setVideos(Array.isArray(vids) ? vids : [])
        })
        .catch(() => setVideos([]))
        .finally(() => setLoading(false))
    })
  }, [])

  if (loading) return null

  // Filter out videos already in checkout list
  const checkoutIds = currentItems.map(i => i.videoId || i.id)
  const suggestions = videos.filter(v => !checkoutIds.includes(v._id)).slice(0, 4)

  if (suggestions.length === 0) return null

  const handleAdd = (video) => {
    toggleCart({
      id: video._id,
      title: video.title,
      price: video.price,
      image: video.thumbnailUrl,
      creator: video.artistId?.name || 'Artist'
    })
    // Update local checkout session items
    const newItem = {
      videoId: video._id,
      title: video.title,
      price: video.price,
      thumbnail: video.thumbnailUrl,
      artistName: video.artistId?.name || 'Artist'
    }
    setItems(prev => [...prev, newItem])
  }

  return (
    <div className="mt-12 mb-8">
      <h3 className="text-xl font-black mb-6" style={{ color: C.navy }}>
        You might also like
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {suggestions.map((video) => (
          <div key={video._id} className="bg-white rounded-2xl p-3 border shadow-sm flex flex-col" style={{ borderColor: 'rgba(77,208,225,0.2)' }}>
            <img src={video.thumbnailUrl || '/fallback.png'} alt="" className="w-full aspect-video object-cover rounded-xl mb-3" />
            <h4 className="font-bold text-sm leading-tight line-clamp-2 mb-1" style={{ color: C.navy }}>{video.title}</h4>
            <p className="text-xs text-[#051d2e]/60 mb-3">{video.artistId?.name || 'Artist'}</p>
            <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="font-bold text-[#4DD0E1] text-sm">Rs. {video.price}</span>
              <button
                onClick={() => handleAdd(video)}
                className="p-1.5 rounded-full bg-[#4DD0E1]/10 text-[#4DD0E1] hover:bg-[#4DD0E1] hover:text-[#051d2e] transition"
                title="Add to Cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
