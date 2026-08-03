import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Play, Plus, Users, Clock, Star, ChevronLeft, ChevronRight,
  BookmarkCheck, ShoppingBag, CheckCircle, Bookmark, BookmarkPlus,
  ShoppingCart, Loader2,
} from 'lucide-react'
import UserLayout from '../../components/layout/UserLayout'
import { useCart } from '../../context/CartContext'
import { videoApi, wishlistApi, purchaseApi, progressApi, genreApi } from '../../api/index.js'

/* ─── Fallback thumbnail ─────────────────────────────────── */
const FALLBACK_IMG = undefined

/* ─── Format helpers ─────────────────────────────────────── */
const fmtDuration = (secs) => {
  if (!secs) return ''
  const m = Math.floor(secs / 60)
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`
}
const fmtViews = (n) => {
  if (!n) return '0 views'
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M views` : n >= 1000 ? `${(n / 1000).toFixed(0)}K views` : `${n} views`
}
const fmtPrice = (price, currency) => {
  if (!price) return 'Free'
  return `${currency === 'INR' ? 'Rs. ' : '$'}${price}`
}

/* ─── tiny helpers ─────────────────────────────────────── */
const GradText = ({ children, className = '' }) => (
  <span className={`dash-grad-text ${className}`}>{children}</span>
)

const PlayBtn = ({ size = 14 }) => {
  const isLarge = size >= 20
  return (
    <button
      className={`rounded-full flex items-center justify-center hover:scale-110 transition cyan-glow
        ${isLarge
          ? 'w-9 h-9 sm:w-14 sm:h-14 md:w-20 md:h-20'
          : 'w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14'}`}
      style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
    >
      <Play
        className={`ml-0.5 text-[#051d2e]
          ${isLarge ? 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5' : 'w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5'}`}
        fill="#051d2e"
      />
    </button>
  )
}

const StarFilled = ({ className = '' }) => (
  <Star className={`w-3 h-3 text-[#C0E863] ${className}`} fill="#C0E863" />
)
const StarEmpty = () => <Star className="w-3 h-3 text-[#5a7a8a]" />

const PriceBadge = ({ price, currency }) => (
  <div className="absolute top-2 right-2 px-2.5 py-1 price-badge rounded-full text-[10px] font-black text-[#051d2e]">
    {fmtPrice(price, currency)}
  </div>
)

const HoverOverlayWide = () => (
  <div className="absolute inset-0 bg-gradient-to-t from-[#051d2e]/95 via-[#051d2e]/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
    <PlayBtn size={14} />
  </div>
)

const HoverOverlayTall = ({ desc, stats }) => (
  <div className="absolute inset-0 bg-gradient-to-t from-[#051d2e]/95 via-[#051d2e]/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <PlayBtn size={20} />
    </div>
    {(desc || stats) && (
      <div className="absolute bottom-4 left-3 right-3">
        {desc && <p className="text-[10px] text-[#f0fdfa]/80 mb-1 line-clamp-2">{desc}</p>}
        {stats && <div className="flex items-center gap-1.5 text-[10px] text-[#4DD0E1]">{stats}</div>}
      </div>
    )}
  </div>
)

const SectionHeader = ({ title, sub, viewAllTo }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[#051d2e]">{title}</h2>
      {sub && <p className="text-xs text-[#4DD0E1] font-mono tracking-widest">{sub}</p>}
    </div>
    {viewAllTo ? (
      <Link to={viewAllTo} className="text-xs md:text-sm font-black text-[#00BCD4] hover:text-[#051d2e] transition uppercase tracking-wider shrink-0 ml-4">
        View All →
      </Link>
    ) : (
      <button className="text-xs md:text-sm font-black text-[#00BCD4] hover:text-[#051d2e] transition uppercase tracking-wider shrink-0 ml-4">
        View All →
      </button>
    )}
  </div>
)

/* Video action buttons — save to wishlist + add to cart */
const VideoActionButtons = ({ videoId, videoData }) => {
  const { toggleCart, toggleSavedList, isInCart, isInSavedList } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleCart(videoData)
  }

  const handleSaveToList = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSavedList(videoData)
    // Also call wishlist API if user is logged in
    try {
      if (isInSavedList(videoId)) {
        await wishlistApi.remove(videoId)
      } else {
        await wishlistApi.add(videoId)
      }
    } catch {
      // silently ignore auth errors (guest user)
    }
  }

  return (
    <div className="absolute bottom-2 right-2 flex items-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
      <button
        onClick={handleSaveToList}
        className="p-1.5 md:p-2 rounded-full bg-white/90 hover:bg-[#4DD0E1]/80 shadow-md backdrop-blur-sm transition transform hover:scale-110"
        title="Save to list"
      >
        {isInSavedList(videoId) ? (
          <Bookmark className="w-4 h-4 text-[#051d2e] fill-[#051d2e]" />
        ) : (
          <BookmarkPlus className="w-4 h-4 text-[#051d2e]" />
        )}
      </button>
      <button
        onClick={handleAddToCart}
        className="p-1.5 md:p-2 rounded-full bg-[#4DD0E1]/90 hover:bg-[#00BCD4] shadow-md backdrop-blur-sm transition transform hover:scale-110"
        title="Add to cart"
      >
        <ShoppingCart className={`w-4 h-4 text-[#051d2e] ${isInCart(videoId) ? 'fill-[#051d2e]' : ''}`} />
      </button>
    </div>
  )
}

/* Horizontal scroll row for wide-thumbnail videos */
const WideRow = ({ videos, widthClass = 'w-64 sm:w-72 md:w-80' }) => (
  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
    {videos.map((v) => (
      <Link to={`/video/${v._id}`} key={v._id} className={`flex-shrink-0 ${widthClass} group cursor-pointer block`}>
        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
          <img src={v.thumbnailUrl || FALLBACK_IMG} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
          <HoverOverlayWide />
          <VideoActionButtons videoId={v._id} videoData={{ id: v._id, image: v.thumbnailUrl, title: v.title, price: fmtPrice(v.price, v.currency) }} />
          {v.price
            ? <PriceBadge price={v.price} currency={v.currency} />
            : <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: '#C0E863' }}>Free</div>
          }
        </div>
        <h3 className="font-black text-sm text-[#051d2e] mb-0.5 truncate">{v.title}</h3>
        <p className="text-xs text-[#051d2e]/60">{v.artistId?.name || v.genre?.name || ''}{v.durationSeconds ? ` • ${fmtDuration(v.durationSeconds)}` : ''}</p>
      </Link>
    ))}
  </div>
)

/* Tall poster row */
const TallRow = ({ videos, showRank = false }) => (
  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
    {videos.map((v, idx) => (
      <Link to={`/video/${v._id}`} key={v._id} className="flex-shrink-0 w-44 sm:w-52 md:w-64 group cursor-pointer block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
          <img src={v.thumbnailUrl || FALLBACK_IMG} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
          <HoverOverlayTall
            desc={v.description}
            stats={<><span>{fmtViews(v.viewCount)}</span>{v.durationSeconds && <><span>•</span><span>{fmtDuration(v.durationSeconds)}</span></>}</>}
          />
          <VideoActionButtons videoId={v._id} videoData={{ id: v._id, image: v.thumbnailUrl, title: v.title, price: fmtPrice(v.price, v.currency) }} />
          {showRank && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 rounded-full text-[10px] font-black text-white">#{idx + 1}</div>
          )}
          {v.price
            ? <PriceBadge price={v.price} currency={v.currency} />
            : <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: '#C0E863' }}>Free</div>
          }
        </div>
        <h3 className="font-black text-sm text-[#051d2e] mb-0.5 truncate">{v.title}</h3>
        <p className="text-xs text-[#051d2e]/60">{v.artistId?.name || v.genre?.name || ''}</p>
      </Link>
    ))}
  </div>
)

/* Small section skeleton while loading */
const RowSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto pb-2">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex-shrink-0 w-64">
        <div className="aspect-video rounded-xl bg-[#051d2e]/10 animate-pulse mb-3" />
        <div className="h-3 bg-[#051d2e]/10 rounded animate-pulse mb-1.5 w-3/4" />
        <div className="h-2.5 bg-[#051d2e]/10 rounded animate-pulse w-1/2" />
      </div>
    ))}
  </div>
)

/* ═══════════════════════════════════════════════════════ */
export default function UserDashboard() {
  // ── Hero carousel state ───────────────────────────────
  const [heroVideos, setHeroVideos] = useState([])
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState('next')

  // ── Content rows ──────────────────────────────────────
  const [genresWithVideos, setGenresWithVideos] = useState([])
  const [latestVideos, setLatestVideos] = useState([])
  const [continueWatching, setContinueWatching] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [purchases, setPurchases] = useState([])

  const [loadingHero, setLoadingHero] = useState(true)
  const [loadingContent, setLoadingContent] = useState(true)

  // Load all data
  useEffect(() => {
    // Hero: 4 newest featured videos (or just 4 newest)
    videoApi.list({ limit: 4, sort: 'new', featured: true })
      .then(res => {
        let vids = res.data.data.videos
        if (!vids.length) return videoApi.list({ limit: 4, sort: 'new' })
        setHeroVideos(vids)
        setLoadingHero(false)
      })
      .catch(() => setLoadingHero(false))

    // Fetch genres and all videos to group them
    Promise.all([
      genreApi.list(),
      videoApi.list({ limit: 100, sort: 'new' })
    ]).then(([genreRes, videoRes]) => {
      const allGenres = genreRes.data?.data || []
      const allVideos = videoRes.data?.data?.videos || []
      
      setLatestVideos(allVideos.slice(0, 8))

      const grouped = allGenres.map(g => {
        const vids = allVideos.filter(v => v.genre?._id === g._id || v.genre === g._id)
        return { ...g, videos: vids }
      }).filter(g => g.videos.length > 0)
      
      setGenresWithVideos(grouped)
    }).catch(() => {}).finally(() => setLoadingContent(false))

    // User-specific: wishlist, purchases, watch progress
    wishlistApi.get().then(res => setWishlist(res.data.data)).catch(() => {})
    purchaseApi.getMyPurchases().then(res => setPurchases(res.data.data)).catch(() => {})
    progressApi.getAll().then(res => {
      if (Array.isArray(res.data.data)) setContinueWatching(res.data.data)
    }).catch(() => {})
  }, [])

  // Hero-specific: when featured videos don't exist, fall back to latest
  useEffect(() => {
    if (!loadingHero && heroVideos.length === 0 && latestVideos.length > 0) {
      setHeroVideos(latestVideos.slice(0, 4))
    }
  }, [loadingHero, heroVideos.length, latestVideos])

  const total = heroVideos.length || 1

  const goTo = useCallback((index, dir = 'next') => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setCurrent(index)
      setAnimating(false)
    }, 500)
  }, [animating])

  const next = useCallback(() => goTo((current + 1) % total, 'next'), [current, goTo, total])
  const prev = useCallback(() => goTo((current - 1 + total) % total, 'prev'), [current, goTo, total])

  useEffect(() => {
    if (heroVideos.length === 0) return
    const id = setInterval(next, 6000)
    return () => clearInterval(id)
  }, [next, heroVideos.length])

  const slide = heroVideos[current]

  return (
    <UserLayout>
      {/* ══════════════ HERO CAROUSEL ══════════════ */}
      <section className="relative w-full flex items-center overflow-hidden" style={{ minHeight: 'calc(100vh - 73px)' }}>

        {/* Loading state */}
        {loadingHero && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#051d2e' }}>
            <Loader2 className="w-10 h-10 animate-spin text-[#4DD0E1]" />
          </div>
        )}

        {/* Slides */}
        {heroVideos.map((s, i) => (
          <div
            key={s._id}
            className="absolute inset-0 z-0"
            style={{
              opacity: i === current ? 1 : 0,
              transition: 'opacity 0.7s ease-in-out',
              pointerEvents: i === current ? 'auto' : 'none',
            }}
          >
            <img src={s.thumbnailUrl || FALLBACK_IMG} alt={s.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 hero-overlay-left" />
            <div className="absolute inset-0 hero-overlay-btm" />
          </div>
        ))}

        {/* Content */}
        {slide && (
          <div
            className="relative z-10 w-full max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-14 pt-8 pb-16 md:pb-20"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating
                ? direction === 'next' ? 'translateY(18px)' : 'translateY(-18px)'
                : 'translateY(0)',
              transition: 'opacity 0.45s ease, transform 0.45s ease',
            }}
          >
            <div className="max-w-2xl space-y-4 sm:space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-pill">
                  <Star className="w-3 h-3" fill="currentColor" /> {slide.genre?.name || 'Featured'}
                </span>
                {slide.featured && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[#4DD0E1] rounded-full text-xs font-bold text-[#051d2e] shadow-lg">
                    Featured
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#f0fdfa] max-w-3xl line-clamp-2">
                {slide.title.split(' ').slice(0, -1).join(' ')}{' '}
                <GradText className="italic">{slide.title.split(' ').slice(-1)[0]}</GradText>
              </h1>

              {/* Description */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 max-w-lg border border-[#4DD0E1]/20 shadow-lg">
                <p className="text-xs md:text-sm text-[#051d2e] leading-relaxed font-medium line-clamp-3">
                  {slide.description || 'Watch this exclusive content on arturee.'}
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to={`/video/${slide._id}`}
                  className="flex items-center gap-2 px-6 py-2.5 md:px-7 md:py-3 rounded-xl font-bold text-[#051d2e] hover:scale-105 transition-all cyan-glow text-sm md:text-base"
                  style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
                >
                  <Play className="w-5 h-5" fill="#051d2e" /> Watch Now
                </Link>
                <button className="flex items-center gap-2 px-6 py-2.5 md:px-7 md:py-3 bg-white/80 text-[#051d2e] rounded-xl font-bold hover:bg-white transition border border-[#4DD0E1]/25 text-sm md:text-base backdrop-blur-sm">
                  More Info
                </button>
                <button className="p-2.5 md:p-3 bg-white/80 text-[#051d2e] rounded-xl hover:bg-white transition border border-[#4DD0E1]/25 backdrop-blur-sm">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-5 text-xs text-[#f0fdfa]/80 font-medium">
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#4DD0E1]" /><span>{fmtViews(slide.viewCount)}</span></div>
                {slide.durationSeconds && (
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#4DD0E1]" /><span>{fmtDuration(slide.durationSeconds)} runtime</span></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Carousel controls */}
        {heroVideos.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-4">
            <button onClick={prev} className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/20 text-white transition hover:scale-110" aria-label="Previous">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {heroVideos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? 'next' : 'prev')}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 28 : 8,
                    height: 8,
                    background: i === current ? 'linear-gradient(135deg,#4DD0E1,#C0E863)' : 'rgba(255,255,255,0.4)',
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/20 text-white transition hover:scale-110" aria-label="Next">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
          <div key={current} className="h-full" style={{ background: 'linear-gradient(90deg,#4DD0E1,#C0E863)', animation: 'heroProgress 6s linear forwards' }} />
        </div>
        <style>{`@keyframes heroProgress { from { width: 0% } to { width: 100% } }`}</style>
      </section>

      {/* ══════════════ CONTENT ROWS ══════════════ */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-12 py-14 space-y-12">

        {/* Continue Watching — from real progress API */}
        {continueWatching.length > 0 && (
          <div id="continue">
            <SectionHeader title="Continue Watching" viewAllTo="/dashboard/continue" />
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {continueWatching.slice(0, 8).map((item) => {
                const v = item.videoId || {}
                const pct = item.progressSeconds && v.durationSeconds
                  ? Math.round((item.progressSeconds / v.durationSeconds) * 100)
                  : 0
                const remaining = v.durationSeconds
                  ? fmtDuration(v.durationSeconds - (item.progressSeconds || 0))
                  : ''
                return (
                  <Link to={`/video/${v._id || item.videoId}`} key={item._id} className="flex-shrink-0 w-64 sm:w-72 md:w-80 group cursor-pointer block">
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
                      <img src={v.thumbnailUrl || FALLBACK_IMG} alt={v.title || 'Video'} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      <HoverOverlayWide />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#051d2e]/10">
                        <div className="h-full progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <h3 className="font-black text-sm text-[#051d2e] mb-0.5 truncate">{v.title || 'Untitled'}</h3>
                    <p className="text-xs text-[#051d2e]/60">{remaining ? `${remaining} remaining` : ''}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Genres sections */}
        {loadingContent ? (
          <>
            <div className="mb-8"><SectionHeader title="Loading Genres..." /><RowSkeleton /></div>
            <div><SectionHeader title="" /><RowSkeleton /></div>
          </>
        ) : genresWithVideos.length > 0 ? (
          genresWithVideos.map((genre) => (
            <div key={genre._id}>
              <SectionHeader title={genre.name} sub={genre.description || "DISCOVER"} />
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {genre.videos.map((v) => (
                  <Link to={`/video/${v._id}`} key={v._id} className="flex-shrink-0 w-56 sm:w-64 md:w-72 group cursor-pointer block">
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
                      <img src={v.thumbnailUrl || FALLBACK_IMG} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      <HoverOverlayWide />
                      <VideoActionButtons videoId={v._id} videoData={{ id: v._id, image: v.thumbnailUrl, title: v.title, price: fmtPrice(v.price, v.currency) }} />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>{genre.name}</div>
                      {v.price
                        ? <PriceBadge price={v.price} currency={v.currency} />
                        : <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: '#C0E863' }}>Free</div>
                      }
                    </div>
                    <h3 className="font-black text-sm text-[#051d2e] mb-0.5 truncate">{v.title}</h3>
                    <p className="text-xs text-[#051d2e]/60 mb-1">{v.artistId?.name || v.genre?.name || ''}</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => i <= 4 ? <StarFilled key={i} /> : <StarEmpty key={i} />)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-[#051d2e]/40 text-sm py-6 text-center">No videos yet — check back soon!</p>
        )}

        {/* My List — from wishlist API */}
        {wishlist.length > 0 && (
          <div id="mylist">
            <SectionHeader title="My List" sub="SAVED BY YOU" viewAllTo="/dashboard/mylist" />
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {wishlist.slice(0, 8).map((v) => (
                <Link to={`/video/${v._id}`} key={v._id} className="flex-shrink-0 w-44 sm:w-52 md:w-64 group cursor-pointer block">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
                    <img src={v.thumbnailUrl || FALLBACK_IMG} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#051d2e]/95 via-[#051d2e]/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <PlayBtn size={20} />
                    </div>
                    {v.price
                      ? <PriceBadge price={v.price} currency={v.currency} />
                      : <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: '#C0E863' }}>Free</div>
                    }
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#051d2e]/80 border border-[#4DD0E1]/30" style={{ background: 'rgba(255,255,255,0.85)' }}>
                      {v.genre?.name || 'Video'}
                    </div>
                    <div className="absolute bottom-2 right-2 p-1.5 rounded-full" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>
                      <BookmarkCheck className="w-3.5 h-3.5 text-[#051d2e]" fill="#051d2e" />
                    </div>
                  </div>
                  <h3 className="font-black text-xs text-[#051d2e] mb-0.5 truncate">{v.title}</h3>
                  <p className="text-[10px] text-[#051d2e]/60">{v.artistId?.name || v.genre?.name || ''}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Purchased — from purchase API */}
        {purchases.length > 0 && (
          <div id="purchased">
            <SectionHeader title="Purchased" sub="YOUR LIBRARY" viewAllTo="/dashboard/purchased" />
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {purchases.slice(0, 6).map((p) => {
                const v = p.videoId || {}
                return (
                  <Link to={`/video/${v._id || p.videoId}`} key={p._id} className="flex-shrink-0 w-64 sm:w-72 md:w-80 group cursor-pointer block">
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
                      <img src={v.thumbnailUrl || FALLBACK_IMG} alt={v.title || 'Video'} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      <HoverOverlayWide />
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>
                        <CheckCircle className="w-3 h-3" /> Owned
                      </div>
                    </div>
                    <h3 className="font-black text-sm text-[#051d2e] mb-0.5 truncate">{v.title || 'Untitled'}</h3>
                    <p className="text-xs text-[#051d2e]/60">Rs. {(p.amountPaise / 100).toFixed(2)} • {new Date(p.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* All Videos fallback when DB has content but no specific category */}
        {!loadingContent && genresWithVideos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg,rgba(77,208,225,0.15),rgba(192,232,99,0.15))' }}>
              <ShoppingBag className="w-10 h-10 text-[#4DD0E1]" />
            </div>
            <h2 className="text-2xl font-black text-[#051d2e] mb-2">Content Coming Soon</h2>
            <p className="text-[#051d2e]/55 text-sm max-w-sm">The admin is adding new videos. Check back soon for exclusive content!</p>
          </div>
        )}
      </section>
    </UserLayout>
  )
}
