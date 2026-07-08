import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, ChevronLeft, CheckCircle, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react'
import UserLayout from '../../components/layout/UserLayout'
import { purchaseApi } from '../../api/index.js'

const SORT_OPTIONS = ['Recently Purchased', 'Title A – Z', 'Highest Price']

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatDuration = (secs) => {
  if (!secs) return ''
  const m = Math.floor(secs / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

export default function Purchased() {
  const [sort, setSort] = useState('Recently Purchased')
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await purchaseApi.getMyPurchases()
        setPurchases(res.data.data)
      } catch {
        setError('Failed to load your library. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const items = purchases.map(p => ({
    _id: p._id,
    videoId: p.videoId?._id,
    title: p.videoId?.title || 'Untitled',
    thumbnailUrl: p.videoId?.thumbnailUrl || 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=450&fit=crop',
    price: p.amountPaise ? p.amountPaise / 100 : 0,
    duration: formatDuration(p.videoId?.durationSeconds),
    date: formatDate(p.completedAt),
    currency: p.currency || 'INR',
  }))

  const sorted = [...items].sort((a, b) => {
    if (sort === 'Title A – Z') return a.title.localeCompare(b.title)
    if (sort === 'Highest Price') return b.price - a.price
    return 0
  })

  const totalSpent = items.reduce((s, i) => s + i.price, 0)

  return (
    <UserLayout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_280px] lg:items-start">
          <div>
            {/* ── Page header ── */}
            <div className="flex items-center gap-4 mb-2">
              <Link
                to="/dashboard"
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-[#4DD0E1]/30 text-[#051d2e]/60 hover:text-[#051d2e] hover:border-[#4DD0E1] hover:bg-white/50 transition shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-3xl font-black text-[#051d2e] tracking-tight">Your Library</h1>
                <p className="text-sm text-[#051d2e]/50 mt-0.5">Videos and shows you own — yours forever</p>
              </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="flex flex-wrap gap-3 mt-6 mb-5">
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#4DD0E1]/20 text-sm font-semibold text-[#051d2e]/70"
                style={{ background: 'rgba(255,255,255,0.7)' }}
              >
                <ShoppingBag className="w-4 h-4 text-[#4DD0E1]" />
                {items.length} items owned
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#4DD0E1]/20 text-sm font-semibold text-[#051d2e]/70"
                style={{ background: 'rgba(255,255,255,0.7)' }}
              >
                Total spent: ₹{totalSpent.toFixed(2)}
              </div>
            </div>

            {/* ── Sort control ── */}
            <div className="flex items-center gap-3 mb-0">
              <span className="text-xs font-bold text-[#051d2e]/45 uppercase tracking-widest">Sort by</span>
              <div className="flex gap-2 flex-wrap">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSort(opt)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={
                      sort === opt
                        ? { background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e' }
                        : { background: 'rgba(255,255,255,0.7)', color: 'rgba(5,29,46,0.55)', border: '1px solid rgba(77,208,225,0.25)' }
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl border border-[#4DD0E1]/20 p-4"
            style={{ background: 'rgba(255,255,255,0.65)' }}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-full bg-white/70 p-1.5 border border-[#4DD0E1]/15">
                <AlertCircle className="w-3.5 h-3.5 text-[#051d2e]/45" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#051d2e]/45 mb-1">Watch policy</p>
                <p className="text-sm font-semibold text-[#051d2e] leading-snug">
                  Each title can be watched twice. After that, it returns to Unpurchased.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#4DD0E1]" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 py-10">{error}</p>
        )}

        {/* Empty state */}
        {!loading && !error && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(77,208,225,0.12)' }}>
              <ShoppingBag className="w-8 h-8 text-[#4DD0E1]" />
            </div>
            <p className="text-lg font-black text-[#051d2e]">No purchases yet</p>
            <p className="text-sm text-[#051d2e]/50 mt-1">Browse content and buy your first video</p>
            <Link to="/dashboard" className="mt-5 px-6 py-2.5 rounded-xl font-black text-[#051d2e] text-sm hover:opacity-90 transition" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>
              Browse Content
            </Link>
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && sorted.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((item) => (
              <div
                key={item._id}
                className="group rounded-2xl overflow-hidden border border-[#4DD0E1]/20 shadow-sm hover:shadow-lg transition-shadow"
                style={{ background: 'rgba(255,255,255,0.75)' }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {/* Hover overlay */}
                  <Link
                    to={`/video/${item.videoId}`}
                    className="absolute inset-0 bg-[#051d2e]/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center"
                  >
                    <div
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-[#051d2e] text-sm shadow-lg"
                      style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
                    >
                      <Play className="w-4 h-4" fill="#051d2e" /> Watch Now
                    </div>
                  </Link>
                  {/* Owned badge */}
                  <div
                    className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]"
                    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
                  >
                    <CheckCircle className="w-3 h-3" /> Owned
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#4DD0E1]">Video</span>
                    <span className="text-[10px] font-bold text-[#051d2e]/45">{item.duration}</span>
                  </div>
                  <h3 className="font-black text-sm text-[#051d2e] mb-3">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#051d2e]/40 uppercase tracking-wider">Purchased</p>
                      <p className="text-xs font-semibold text-[#051d2e]/60">{item.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#051d2e]">₹{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </UserLayout>
  )
}
