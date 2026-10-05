import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, Loader2, AlertCircle, Tag, X, Gift } from 'lucide-react'
import UserLayout from '../../components/layout/UserLayout'
import { purchaseApi, videoApi, couponApi } from '../../api/index.js'
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
    if (document.getElementById('razorpay-sdk')) { resolve(true); return }
    const script = document.createElement('script')
    script.id  = 'razorpay-sdk'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/* ─── Format helpers ─────────────────────────────────── */
const fmtINR    = (paise) => `₹${(paise / 100).toFixed(2)}`
const fmtINRraw = (inr)   => `₹${parseFloat(inr).toFixed(2)}`
const parsePrice = (val)  =>
  parseFloat(String(val || '0').replace(/[^0-9.]/g, '').replace(/^\.+/, '')) || 0

const fmtPrice = (price) => {
  if (!price) return 'Free'
  return `₹${parsePrice(price).toFixed(2)}`
}

/* ══════════════════════════════════════════════════════ */
export default function Checkout() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { setCart } = useCart()

  const checkoutData = location.state || null
  const isCartOrigin = !!checkoutData?.items
  const [items, setItems] = useState(() =>
    isCartOrigin ? checkoutData.items : (checkoutData ? [checkoutData] : [])
  )

  const [status,   setStatus]   = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [priceLoading, setPriceLoading] = useState(true)

  // Coupon state
  const [couponInput,    setCouponInput]    = useState('')
  const [couponLoading,  setCouponLoading]  = useState(false)
  const [couponApplied,  setCouponApplied]  = useState(null)  // { code, discount, finalTotal, isFree, description }
  const [couponError,    setCouponError]    = useState('')

  useEffect(() => {
    if (!items.length) navigate('/dashboard', { replace: true })
  }, [items, navigate])

  // Fetch fresh prices from DB
  useEffect(() => {
    if (!items.length) return
    const fetchFreshPrices = async () => {
      try {
        const freshItems = await Promise.all(
          items.map(async (item) => {
            try {
              const res   = await videoApi.get(item.videoId)
              const video = res.data?.data || res.data
              const effectivePrice = video?.discountedPrice ?? video?.price ?? item.price
              return { ...item, price: effectivePrice }
            } catch {
              return item
            }
          })
        )
        setItems(freshItems)
      } finally {
        setPriceLoading(false)
      }
    }
    fetchFreshPrices()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recalculate coupon when items change (e.g. add from suggestions)
  useEffect(() => {
    if (couponApplied && !priceLoading) {
      // Re-validate silently with updated total
      handleApplyCoupon(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, priceLoading])

  /* ── Pricing ── */
  const subtotal    = items.reduce((acc, item) => acc + parsePrice(item.price), 0)
  const platformFee = subtotal * 0.03
  const totalBeforeCoupon = subtotal + platformFee
  const couponDiscount    = couponApplied?.discount   ?? 0
  const finalTotal        = couponApplied?.finalTotal  ?? totalBeforeCoupon
  const isFree            = couponApplied?.isFree      ?? false

  /* ── Apply coupon ── */
  const handleApplyCoupon = useCallback(async (silent = false) => {
    const code = couponApplied?.code || couponInput.trim().toUpperCase()
    if (!code) { setCouponError('Please enter a coupon code.'); return }
    if (!silent) setCouponLoading(true)
    setCouponError('')

    try {
      const res  = await couponApi.validate({ code, cartTotal: totalBeforeCoupon })
      const data = res.data.data
      setCouponApplied({
        code:        data.code,
        description: data.description,
        discount:    data.discount,
        finalTotal:  data.finalTotal,
        isFree:      data.isFree,
      })
      if (!silent) setCouponInput('')
    } catch (err) {
      if (!silent) {
        setCouponError(err.response?.data?.message || 'Invalid or expired coupon.')
        setCouponApplied(null)
      }
    } finally {
      if (!silent) setCouponLoading(false)
    }
  }, [couponInput, couponApplied, totalBeforeCoupon])

  const handleRemoveCoupon = () => {
    setCouponApplied(null)
    setCouponInput('')
    setCouponError('')
  }

  /* ── Pay ── */
  const handlePay = useCallback(async () => {
    setStatus('loading')
    setErrorMsg('')

    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Razorpay SDK could not be loaded.')

      const videoIds = items.map(i => i.videoId)
      const orderRes = await purchaseApi.createOrder({
        videoIds,
        couponCode: couponApplied?.code || undefined,
      })
      const data = orderRes.data.data

      // ── FREE path ─────────────────────────────────────────────────────
      if (data.isFree) {
        if (isCartOrigin) setCart([])
        setStatus('success')
        setTimeout(() => navigate('/dashboard/purchased', { replace: true }), 2500)
        return
      }

      // ── Paid path ─────────────────────────────────────────────────────
      const { orderId, amount, currency, videoTitle } = data
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Tej4v0plBEgW74',
          amount,
          currency:    currency || 'INR',
          order_id:    orderId,
          name:        'arturee',
          description: videoTitle || (items.length > 1 ? `${items.length} Videos` : items[0]?.title) || 'Video Purchase',
          image:       '/logo.png',
          theme: { color: '#4DD0E1' },
          prefill: {},
          handler: async (response) => {
            try {
              await purchaseApi.verify({
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              if (isCartOrigin) setCart([])
              resolve()
            } catch (verifyErr) {
              reject(new Error(verifyErr.response?.data?.message || 'Payment verification failed.'))
            }
          },
          modal: { ondismiss: () => reject(new Error('DISMISSED')) },
        })
        rzp.on('payment.failed', (failResp) =>
          reject(new Error(failResp.error?.description || 'Payment failed.'))
        )
        rzp.open()
      })

      setStatus('success')
      setTimeout(() => navigate('/dashboard/purchased', { replace: true }), 2500)

    } catch (err) {
      if (err.message === 'DISMISSED') {
        setStatus('idle')
      } else {
        setErrorMsg(err.response?.data?.message || err.message || 'Something went wrong.')
        setStatus('error')
      }
    }
  }, [items, isCartOrigin, couponApplied, navigate, setCart])

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
            {isFree ? '🎁 Videos Unlocked for Free!' : 'Payment Successful!'}
          </h2>
          <p className="text-lg mb-2" style={{ color: C.muted }}>
            You now own <strong>{items.length > 1 ? `${items.length} videos` : items[0]?.title}</strong>.
          </p>
          <p className="text-sm mb-8" style={{ color: C.muted }}>Redirecting to your library…</p>
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

  if (!items.length) return null

  const subtotalDisplay      = priceLoading ? '…' : fmtINR(subtotal * 100)
  const platformFeeDisplay   = priceLoading ? '…' : fmtINR(platformFee * 100)
  const beforeCouponDisplay  = priceLoading ? '…' : fmtINRraw(totalBeforeCoupon)
  const discountDisplay      = couponApplied ? `-${fmtINRraw(couponDiscount)}` : null
  const priceDisplay         = priceLoading ? '…' : (isFree ? 'FREE' : fmtINRraw(finalTotal))

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
                <h3 className="text-xl font-black mb-6 uppercase tracking-tight" style={{ color: C.navy }}>
                  Order Summary
                </h3>

                {/* Video list */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      {item.thumbnail && (
                        <img src={item.thumbnail} alt={item.title} className="w-20 h-14 object-cover rounded-lg shadow-sm shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm leading-snug line-clamp-2" style={{ color: C.navy }}>{item.title}</h4>
                        {item.artistName && <p className="text-xs text-[#051d2e]/60 mt-0.5">{item.artistName}</p>}
                      </div>
                      <div className="text-sm font-semibold shrink-0">{fmtPrice(item.price)}</div>
                    </div>
                  ))}
                </div>

                {/* Pricing breakdown */}
                <div className="space-y-3 pt-4 text-sm" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} item{items.length !== 1 && 's'})</span>
                    <span>{subtotalDisplay}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes &amp; fees (3%)</span>
                    <span>{platformFee > 0 ? platformFeeDisplay : 'Included'}</span>
                  </div>
                  {/* Coupon discount row */}
                  {couponApplied && (
                    <div className="flex justify-between font-semibold" style={{ color: '#16a34a' }}>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {couponApplied.code}
                      </span>
                      <span>{discountDisplay}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between font-black text-lg pt-3"
                    style={{ borderTop: '1px solid rgba(0,0,0,0.06)', color: C.navy }}
                  >
                    <span>Total</span>
                    <span style={isFree ? { color: '#16a34a' } : {}}>{priceDisplay}</span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-col gap-2">
                {[
                  { icon: Lock,         text: 'AES-256 Encrypted Payment' },
                  { icon: ShieldCheck,  text: 'Powered by Razorpay — PCI-DSS Compliant' },
                  { icon: CheckCircle2, text: 'Instant Access After Payment' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-gray-400 font-medium">
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
                <h3 className="text-2xl font-black mb-2" style={{ color: C.navy }}>Complete Purchase</h3>
                <p className="text-sm mb-6" style={{ color: C.muted }}>
                  Securely pay via Razorpay — supports UPI, Cards, Net Banking, Wallets &amp; more.
                </p>

                {/* ── Coupon input ── */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.navy }}>
                    Have a coupon?
                  </label>

                  {couponApplied ? (
                    /* Applied coupon badge */
                    <div
                      className="flex items-center justify-between p-3 rounded-2xl"
                      style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)' }}
                    >
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-black text-green-700">{couponApplied.code}</p>
                          {couponApplied.description && (
                            <p className="text-xs text-green-600">{couponApplied.description}</p>
                          )}
                          <p className="text-xs text-green-600 font-semibold">
                            {couponApplied.isFree
                              ? '🎁 Full amount covered — this purchase is FREE!'
                              : `You save ${fmtINRraw(couponApplied.discount)}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                        title="Remove coupon"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* Coupon input */
                    <div className="flex gap-2">
                      <input
                        id="coupon-input"
                        type="text"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Enter coupon code"
                        maxLength={30}
                        className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 transition"
                        style={{
                          borderColor: couponError ? 'rgba(239,68,68,0.5)' : 'rgba(77,208,225,0.3)',
                          boxShadow: couponError ? '' : undefined,
                        }}
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: C.navy }}
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                </div>

                {/* Razorpay method icons — hide if purchase is free */}
                {!isFree && (
                  <div
                    className="grid grid-cols-4 gap-3 mb-6 p-4 rounded-2xl"
                    style={{ background: 'rgba(77,208,225,0.05)', border: '1px solid rgba(77,208,225,0.12)' }}
                  >
                    {[
                      { label: 'UPI',         emoji: '📲' },
                      { label: 'Cards',        emoji: '💳' },
                      { label: 'Net Banking',  emoji: '🏦' },
                      { label: 'Wallets',      emoji: '👛' },
                    ].map(({ label, emoji }) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-[10px] font-semibold text-gray-500">{label}</span>
                      </div>
                    ))}
                  </div>
                )}

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
                  disabled={status === 'loading' || priceLoading}
                  className="w-full py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition hover:opacity-90 active:scale-98 disabled:opacity-60"
                  style={{
                    background: isFree
                      ? 'linear-gradient(135deg,#16a34a,#86efac)'
                      : 'linear-gradient(135deg,#4DD0E1,#C0E863)',
                    color: C.navy,
                  }}
                >
                  {priceLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Calculating price…</>
                  ) : status === 'loading' ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {isFree ? 'Unlocking…' : 'Opening Razorpay…'}</>
                  ) : isFree ? (
                    <><Gift className="w-5 h-5" /> Claim for FREE</>
                  ) : (
                    <><Lock className="w-5 h-5" /> Pay {priceDisplay} Securely</>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  By paying, you agree to our Terms of Service. All purchases are final.
                </p>
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
  const [videos, setVideos]   = useState([])
  const [loading, setLoading] = useState(true)
  const { toggleCart }        = useCart()

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

  const checkoutIds  = currentItems.map(i => i.videoId || i.id)
  const suggestions  = videos.filter(v => !checkoutIds.includes(v._id)).slice(0, 4)
  if (!suggestions.length) return null

  const handleAdd = (video) => {
    toggleCart({
      id:      video._id,
      title:   video.title,
      price:   video.discountedPrice ?? video.price,
      image:   video.thumbnailUrl,
      creator: video.artistId?.name || 'Artist',
    })
    setItems(prev => [...prev, {
      videoId:    video._id,
      title:      video.title,
      price:      video.discountedPrice ?? video.price,
      thumbnail:  video.thumbnailUrl,
      artistName: video.artistId?.name || 'Artist',
    }])
  }

  return (
    <div className="mt-12 mb-8">
      <h3 className="text-xl font-black mb-6" style={{ color: C.navy }}>You might also like</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {suggestions.map((video) => (
          <div key={video._id} className="bg-white rounded-2xl p-3 border shadow-sm flex flex-col" style={{ borderColor: 'rgba(77,208,225,0.2)' }}>
            <img src={video.thumbnailUrl || '/fallback.png'} alt="" className="w-full aspect-video object-cover rounded-xl mb-3" />
            <h4 className="font-bold text-sm leading-tight line-clamp-2 mb-1" style={{ color: C.navy }}>{video.title}</h4>
            <p className="text-xs text-[#051d2e]/60 mb-3">{video.artistId?.name || 'Artist'}</p>
            <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="font-bold text-[#4DD0E1] text-sm">
                ₹{video.discountedPrice ?? video.price}
              </span>
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
