import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Play, Users, Clock, Calendar, Star,
  Bookmark, Check, BookmarkPlus,
  ChevronDown, Music, Loader2, AlertCircle, ShoppingCart,
} from 'lucide-react'
import UserLayout from '../components/layout/UserLayout'
import { videoApi, purchaseApi, wishlistApi } from '../api/index.js'
import { useAuth } from '../context/AuthContext'

/* ─── colour tokens ──────────────────────────────────── */
const C = {
  navy:    '#051d2e',
  primary: '#4DD0E1',
  teal:    '#00BCD4',
  lime:    '#C0E863',
  muted:   '#4a7080',
}

const FALLBACK_IMG = undefined

/* ─── tiny helpers ───────────────────────────────────── */
const GlassCard = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl border shadow-lg ${className}`}
    style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(77,208,225,0.2)' }}
  >
    {children}
  </div>
)

const GradBtn = ({ children, onClick, disabled, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', boxShadow: '0 0 16px rgba(77,208,225,0.4)' }}
  >
    {children}
  </button>
)

const SectionPill = ({ icon, children }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
    style={{ background: 'linear-gradient(135deg,rgba(77,208,225,0.15),rgba(192,232,99,0.12))', border: '1px solid rgba(77,208,225,0.3)', color: C.navy }}
  >
    {icon}{children}
  </span>
)

const fmtDuration = (secs) => {
  if (!secs) return ''
  const m = Math.floor(secs / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

const fmtViews = (n) => {
  if (!n) return '0 views'
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M views`
    : n >= 1000 ? `${(n / 1000).toFixed(0)}K views`
    : `${n} views`
}

/* ─── Skeleton ───────────────────────────────────────── */
const SkeletonBox = ({ className }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
)

const VideoDetailSkeleton = () => (
  <div className="space-y-6">
    <SkeletonBox className="aspect-video w-full rounded-2xl" />
    <div className="space-y-3">
      <SkeletonBox className="h-8 w-3/4" />
      <SkeletonBox className="h-4 w-1/2" />
    </div>
  </div>
)

/* ─── Recommended Video Card ─────────────────────────── */
const RecCard = ({ video }) => {
  const navigate = useNavigate()
  if (!video) return null
  return (
    <div
      className="flex gap-3 group cursor-pointer rounded-xl p-3 border transition-all hover:-translate-y-1"
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(77,208,225,0.15)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onClick={() => navigate(`/video/${video._id}`)}
    >
      <div className="relative w-36 sm:w-40 aspect-video rounded-lg overflow-hidden shrink-0">
        <img
          src={video.thumbnailUrl || FALLBACK_IMG}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        {video.durationSeconds && (
          <span
            className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
            style={{ background: 'rgba(5,29,46,0.8)' }}
          >
            {fmtDuration(video.durationSeconds)}
          </span>
        )}
        {video.price > 0
          ? <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#4DD0E1,#00BCD4)' }}>₹{video.price}</span>
          : <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>Free</span>
        }
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="font-bold text-sm line-clamp-2 mb-1" style={{ color: C.navy }}>{video.title}</h3>
        <p className="text-xs mb-0.5" style={{ color: C.muted }}>{video.artistId?.name || video.category || ''}</p>
        <p className="text-xs" style={{ color: C.muted }}>{fmtViews(video.viewCount)}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
export default function VideoDetail() {
  const { videoId } = useParams()
  const navigate    = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [video,     setVideo]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  const [purchased,   setPurchased]   = useState(false)
  const [checkingPurchase, setCheckingPurchase] = useState(false)

  const [saved,       setSaved]       = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)

  const [recommended, setRecommended] = useState([])

  /* ── Fetch video ── */
  useEffect(() => {
    if (!videoId) {
      setError('No video ID provided.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')

    videoApi.get(videoId)
      .then(res => {
        setVideo(res.data.data)
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Video not found or unavailable.')
      })
      .finally(() => setLoading(false))
  }, [videoId])

  /* ── Check purchase status ── */
  useEffect(() => {
    if (!isAuthenticated || !videoId) return
    setCheckingPurchase(true)
    purchaseApi.checkPurchase(videoId)
      .then(res => setPurchased(res.data.data.purchased))
      .catch(() => {})
      .finally(() => setCheckingPurchase(false))
  }, [isAuthenticated, videoId])

  /* ── Load recommended videos ── */
  useEffect(() => {
    videoApi.list({ limit: 7, sort: 'popular' })
      .then(res => {
        const vids = res.data.data.videos.filter(v => v._id !== videoId)
        setRecommended(vids.slice(0, 6))
      })
      .catch(() => {})
  }, [videoId])

  /* ── Save to wishlist ── */
  const handleSave = useCallback(async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    const next = !saved
    setSaved(next)
    try {
      if (next) {
        await wishlistApi.add(videoId)
      } else {
        await wishlistApi.remove(videoId)
      }
    } catch {
      setSaved(!next) // revert on error
    }
  }, [isAuthenticated, saved, videoId, navigate])

  /* ── Buy now ── */
  const handleBuy = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    navigate('/checkout', {
      state: {
        videoId:   video._id,
        title:     video.title,
        price:     video.price,
        thumbnail: video.thumbnailUrl,
      },
    })
  }

  /* ── Error state ── */
  if (!loading && error) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="w-12 h-12 mb-4" style={{ color: C.primary }} />
          <h1 className="text-2xl font-black mb-2" style={{ color: C.navy }}>Video Unavailable</h1>
          <p className="text-sm mb-6" style={{ color: C.muted }}>{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: C.navy }}
          >
            Back to Dashboard
          </button>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      {/* Back */}
      <div className="px-4 sm:px-6 lg:px-14 pt-6 pb-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition hover:bg-[rgba(77,208,225,0.15)]"
          style={{ color: C.navy }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="px-4 sm:px-6 lg:px-14 py-4 md:py-6">
        <div className="max-w-screen-2xl mx-auto">
          {loading ? (
            <VideoDetailSkeleton />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

              {/* ── LEFT COLUMN ── */}
              <div className="xl:col-span-2 space-y-6">

                {/* ── Video player / preview ── */}
                <div
                  className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border"
                  style={{ borderColor: 'rgba(77,208,225,0.25)' }}
                >
                  <img
                    src={video?.thumbnailUrl || FALLBACK_IMG}
                    alt={video?.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top,rgba(5,29,46,0.7),rgba(5,29,46,0.1))' }}
                  />

                  {/* Lock overlay for paid-unpurchased */}
                  {video?.price > 0 && !purchased && !checkingPurchase && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(5,29,46,0.7)', backdropFilter: 'blur(4px)', border: '2px solid rgba(77,208,225,0.5)' }}
                      >
                        <ShoppingCart className="w-7 h-7" style={{ color: C.primary }} />
                      </div>
                      <p className="text-white font-bold text-lg drop-shadow">Purchase to watch</p>
                      <GradBtn
                        onClick={handleBuy}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-black text-[#051d2e]"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Buy for ₹{video.price}
                      </GradBtn>
                    </div>
                  )}

                  {/* Play button for free or purchased */}
                  {(video?.price === 0 || purchased) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition hover:scale-110 shadow-2xl"
                        style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', boxShadow: '0 0 32px rgba(77,208,225,0.6)' }}
                      >
                        <Play className="w-7 h-7 md:w-9 md:h-9 ml-1" style={{ color: C.navy }} fill={C.navy} />
                      </button>
                    </div>
                  )}

                  {/* Price or Free badge */}
                  <div className="absolute top-4 right-4">
                    {video?.price > 0 ? (
                      <span
                        className="px-3 py-1.5 rounded-full text-sm font-black text-white"
                        style={{ background: 'linear-gradient(135deg,#4DD0E1,#00BCD4)', backdropFilter: 'blur(4px)' }}
                      >
                        ₹{video.price}
                      </span>
                    ) : (
                      <span
                        className="px-3 py-1.5 rounded-full text-sm font-black text-[#051d2e]"
                        style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
                      >
                        Free
                      </span>
                    )}
                  </div>

                  {/* Duration */}
                  {video?.durationSeconds && (
                    <div
                      className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                      style={{ background: 'rgba(5,29,46,0.8)', backdropFilter: 'blur(4px)' }}
                    >
                      {fmtDuration(video.durationSeconds)}
                    </div>
                  )}
                </div>

                {/* ── Title card ── */}
                <GlassCard className="p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {video?.category && (
                          <SectionPill icon={<Music className="w-3 h-3" />}>
                            {video.category}
                          </SectionPill>
                        )}
                        {video?.tags?.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: 'rgba(77,208,225,0.1)', color: C.teal }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3" style={{ color: C.navy }}>
                        {video?.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 md:gap-5 text-sm" style={{ color: C.muted }}>
                        {video?.viewCount > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" style={{ color: C.primary }} />
                            <span>{fmtViews(video.viewCount)}</span>
                          </div>
                        )}
                        {video?.durationSeconds && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" style={{ color: C.primary }} />
                            <span>{fmtDuration(video.durationSeconds)}</span>
                          </div>
                        )}
                        {video?.createdAt && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" style={{ color: C.primary }} />
                            <span>{new Date(video.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price badge */}
                    <span
                      className="inline-flex items-center px-5 py-2 rounded-full text-sm font-black shrink-0"
                      style={
                        video?.price > 0
                          ? { background: 'linear-gradient(135deg,#4DD0E1,#00BCD4)', color: '#fff' }
                          : { background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', boxShadow: '0 0 16px rgba(77,208,225,0.4)', color: C.navy }
                      }
                    >
                      {video?.price > 0 ? `₹${video.price}` : 'Free'}
                    </span>
                  </div>

                  {/* CTA buttons */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 pt-4"
                    style={{ borderTop: '1px solid rgba(77,208,225,0.15)' }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Watch / Buy button */}
                      {video?.price === 0 ? (
                        <GradBtn className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#051d2e]">
                          <Play className="w-4 h-4" fill={C.navy} /> Watch Free
                        </GradBtn>
                      ) : purchased ? (
                        <GradBtn className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#051d2e]">
                          <Play className="w-4 h-4" fill={C.navy} /> Watch Now
                        </GradBtn>
                      ) : (
                        <GradBtn
                          onClick={handleBuy}
                          disabled={checkingPurchase}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#051d2e]"
                        >
                          {checkingPurchase
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
                            : <><ShoppingCart className="w-4 h-4" /> Buy ₹{video?.price}</>
                          }
                        </GradBtn>
                      )}
                    </div>

                    {/* Save button */}
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition border hover:bg-white"
                      style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(77,208,225,0.25)', color: C.navy }}
                    >
                      {saved
                        ? <Bookmark className="w-4 h-4" fill={C.navy} />
                        : <BookmarkPlus className="w-4 h-4" />
                      }
                      {saved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </GlassCard>

                {/* ── Creator / description card ── */}
                {(video?.artistId || video?.description) && (
                  <GlassCard className="p-5 md:p-6">
                    {video.artistId && (
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
                        {video.artistId.avatarUrl ? (
                          <img
                            src={video.artistId.avatarUrl}
                            alt={video.artistId.name}
                            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover shrink-0"
                            style={{ outline: '2px solid rgba(77,208,225,0.4)', outlineOffset: '2px' }}
                          />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black shrink-0"
                            style={{ background: 'rgba(77,208,225,0.12)', color: C.primary }}
                          >
                            {video.artistId.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Link
                              to={`/artist/${video.artistId._id}`}
                              className="text-lg md:text-xl font-bold transition hover:opacity-80"
                              style={{ color: C.navy }}
                            >
                              {video.artistId.name}
                            </Link>
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
                            >
                              <Check className="w-3 h-3" style={{ color: C.navy }} />
                            </div>
                          </div>
                          {video.artistId.email && (
                            <p className="text-sm" style={{ color: C.muted }}>{video.artistId.email}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {video.description && (
                      <div
                        className="pt-4 space-y-3"
                        style={video.artistId ? { borderTop: '1px solid rgba(77,208,225,0.15)' } : {}}
                      >
                        <p
                          className={`text-sm md:text-base leading-relaxed ${!descExpanded ? 'line-clamp-3' : ''}`}
                          style={{ color: `${C.navy}cc` }}
                        >
                          {video.description}
                        </p>
                        {video.description.length > 200 && (
                          <button
                            className="flex items-center gap-1.5 text-sm font-bold transition"
                            style={{ color: C.primary }}
                            onClick={() => setDescExpanded(e => !e)}
                          >
                            <span>{descExpanded ? 'Show less' : 'Show more'}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${descExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                    )}
                  </GlassCard>
                )}

              </div>

              {/* ── RIGHT COLUMN (recommended) ── */}
              <div className="xl:col-span-1">
                <div className="xl:sticky xl:top-24 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter" style={{ color: C.navy }}>
                      Recommended
                    </h2>
                    <Link
                      to="/dashboard"
                      className="text-xs font-black uppercase tracking-wider transition hover:opacity-70"
                      style={{ color: C.teal }}
                    >
                      See All →
                    </Link>
                  </div>

                  {recommended.length === 0 ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                          <SkeletonBox className="w-36 aspect-video shrink-0" />
                          <div className="flex-1 space-y-2 py-1">
                            <SkeletonBox className="h-3 w-full" />
                            <SkeletonBox className="h-2.5 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    recommended.map(v => <RecCard key={v._id} video={v} />)
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </UserLayout>
  )
}
