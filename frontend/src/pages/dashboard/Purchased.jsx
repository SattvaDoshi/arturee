import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, ChevronLeft, CheckCircle, ShoppingBag, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import UserLayout from '../../components/layout/UserLayout'
import { purchaseApi } from '../../api/index.js'

const VIEW_LIMIT  = 2   // must match backend VIEW_LIMIT
const SORT_OPTIONS = ['Recently Purchased', 'Title A – Z', 'Highest Price']

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

const formatDuration = (secs) => {
  if (!secs) return ''
  const m = Math.floor(secs / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60); const rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

/* ── Watch-count indicator ────────────────────────── */
function ViewsIndicator({ viewsUsed }) {
  const used      = Math.min(viewsUsed ?? 0, VIEW_LIMIT)
  const remaining = VIEW_LIMIT - used

  return (
    <div className="flex flex-col gap-1 mt-3 pt-3" style={{ borderTop: '1px solid rgba(5,29,46,0.07)' }}>
      {/* pip row */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: VIEW_LIMIT }).map((_, i) => {
          const watched = i < used
          return (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: watched
                  ? (remaining === 0 ? '#f87171' : '#4DD0E1')
                  : 'rgba(5,29,46,0.12)',
              }}
            />
          )
        })}
      </div>

      {/* label */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold" style={{
          color: remaining === 0 ? '#ef4444' : remaining === 1 ? '#f59e0b' : '#4DD0E1'
        }}>
          {remaining === 0
            ? '⚠ No views left'
            : `${remaining} view${remaining !== 1 ? 's' : ''} left`}
        </span>
        <span className="text-[10px] text-[#051d2e]/35 font-medium">
          {used}/{VIEW_LIMIT} watched
        </span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════ */
export default function Purchased() {
  const [sort,      setSort]      = useState('Recently Purchased')
  const [purchases, setPurchases] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

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

  const items = purchases.map(p => {
    const isMobile = p.videoId?.categories?.some(c => c.name?.toUpperCase().includes('MOBILE')) || false
    return {
      _id:          p._id,
      videoId:      p.videoId?._id,
      title:        p.videoId?.title || 'Untitled',
      thumbnailUrl: p.videoId?.thumbnailUrl || undefined,
      price:        p.amountPaise ? p.amountPaise / 100 : 0,
      duration:     formatDuration(p.videoId?.durationSeconds),
      date:         formatDate(p.completedAt),
      currency:     p.currency || 'INR',
      genreName:    p.videoId?.genre?.name || '',
      isMobile:     isMobile || p.videoId?.genre?.name?.toUpperCase().includes('MOBILE'),
      viewsUsed:    p.viewsUsed ?? 0,
    }
  })

  const sorted = [...items].sort((a, b) => {
    if (sort === 'Title A – Z')   return a.title.localeCompare(b.title)
    if (sort === 'Highest Price') return b.price - a.price
    return 0
  })

  const totalSpent   = items.reduce((s, i) => s + i.price, 0)
  const viewsWarning = items.filter(i => i.price > 0 && VIEW_LIMIT - i.viewsUsed <= 1).length

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
              {viewsWarning > 0 && (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold"
                  style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#92400e' }}
                >
                  <EyeOff className="w-4 h-4 text-amber-500" />
                  {viewsWarning} title{viewsWarning > 1 ? 's' : ''} almost expired
                </div>
              )}
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

          {/* Watch policy card */}
          <div
            className="rounded-2xl border border-[#4DD0E1]/20 p-4 space-y-3"
            style={{ background: 'rgba(255,255,255,0.65)' }}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-full bg-white/70 p-1.5 border border-[#4DD0E1]/15">
                <AlertCircle className="w-3.5 h-3.5 text-[#051d2e]/45" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#051d2e]/45 mb-1">Watch policy</p>
                <p className="text-sm font-semibold text-[#051d2e] leading-snug">
                  Each title can be watched <strong>{VIEW_LIMIT} times</strong>. After {VIEW_LIMIT} full views (80%+), it returns to Unpurchased.
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-1.5 pt-2" style={{ borderTop: '1px solid rgba(5,29,46,0.07)' }}>
              <div className="flex items-center gap-2 text-[11px] text-[#051d2e]/50">
                <div className="w-6 h-1.5 rounded-full" style={{ background: '#4DD0E1' }} />
                Views used
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#051d2e]/50">
                <div className="w-6 h-1.5 rounded-full" style={{ background: 'rgba(5,29,46,0.12)' }} />
                Views remaining
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#051d2e]/50">
                <div className="w-6 h-1.5 rounded-full" style={{ background: '#f87171' }} />
                No views left
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
        {error && <p className="text-center text-red-500 py-10">{error}</p>}

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
        {!loading && !error && sorted.length > 0 && (() => {
          const landscape = sorted.filter(i => !i.isMobile)
          const portrait  = sorted.filter(i => i.isMobile)

          const VideoCard = ({ item, isPortrait }) => {
            const isFree    = item.price === 0
            const remaining = isFree ? '∞' : Math.max(0, VIEW_LIMIT - item.viewsUsed)
            const isWarning = !isFree && remaining === 1
            const isOut     = !isFree && remaining === 0
            return (
              <div
                className="group rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-shadow"
                style={{
                  background:  'rgba(255,255,255,0.75)',
                  borderColor: isOut ? 'rgba(248,113,113,0.4)' : isWarning ? 'rgba(245,158,11,0.35)' : 'rgba(77,208,225,0.2)',
                }}
              >
                {/* Thumbnail */}
                <div className={`relative overflow-hidden ${isPortrait ? 'aspect-[9/16]' : 'aspect-video'}`}>
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
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
                  <div
                    className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]"
                    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
                  >
                    <CheckCircle className="w-3 h-3" /> Owned
                  </div>
                  <div
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black backdrop-blur-sm"
                    style={{
                      background: isFree ? 'rgba(5,29,46,0.65)' : isOut ? 'rgba(239,68,68,0.85)' : isWarning ? 'rgba(245,158,11,0.85)' : 'rgba(5,29,46,0.65)',
                      color: '#fff',
                    }}
                  >
                    <Eye className="w-3 h-3" />
                    {isFree ? 'Unlimited' : `${remaining} left`}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#4DD0E1]">Video</span>
                    <span className="text-[10px] font-bold text-[#051d2e]/45">{item.duration}</span>
                  </div>
                  <h3 className="font-black text-sm text-[#051d2e] mb-3 line-clamp-2">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#051d2e]/40 uppercase tracking-wider">Purchased</p>
                      <p className="text-xs font-semibold text-[#051d2e]/60">{item.date}</p>
                    </div>
                    <span className="text-sm font-black text-[#051d2e]">₹{item.price.toFixed(2)}</span>
                  </div>
                  {isFree ? (
                    <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(5,29,46,0.07)' }}>
                      <span className="text-[10px] font-bold text-[#4DD0E1] uppercase tracking-widest">Free • Unlimited Views</span>
                    </div>
                  ) : (
                    <ViewsIndicator viewsUsed={item.viewsUsed} />
                  )}
                </div>
              </div>
            )
          }

          return (
            <div className="space-y-10">
              {/* Landscape section */}
              {landscape.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#051d2e]/40">🖥 Videos</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(77,208,225,0.2)' }} />
                    <span className="text-[10px] text-[#051d2e]/30">{landscape.length} title{landscape.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {landscape.map(item => <VideoCard key={item._id} item={item} isPortrait={false} />)}
                  </div>
                </div>
              )}

              {/* Portrait / Mobile section */}
              {portrait.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#051d2e]/40">📱 Mobile Videos</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(77,208,225,0.2)' }} />
                    <span className="text-[10px] text-[#051d2e]/30">{portrait.length} title{portrait.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {portrait.map(item => <VideoCard key={item._id} item={item} isPortrait={true} />)}
                  </div>
                </div>
              )}
            </div>
          )
        })()}


      </div>
    </UserLayout>
  )
}
