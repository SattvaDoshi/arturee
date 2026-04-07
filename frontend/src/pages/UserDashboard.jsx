import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Play, Plus, Users, Clock, Star, ChevronLeft, ChevronRight, BookmarkCheck, ShoppingBag, CheckCircle } from 'lucide-react'
import UserLayout from '../components/layout/UserLayout'

/* ─── Hero Slides Data ─────────────────────────────────── */
const HERO_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1920&h=1080&fit=crop',
    badge: 'Featured Premiere',
    live: true,
    title: 'Jazz Night',
    titleGrad: 'Sessions',
    desc: 'Experience an intimate evening with Marcus Cole as he performs live from his Brooklyn studio. Join 2.4K viewers for an unforgettable night of smooth jazz, improvisation, and raw musical talent.',
    meta: { viewers: '2.4K watching', time: 'Started 45 min ago', rating: '4.9 Rating' },
    link: '/video',
  },
  {
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop',
    badge: 'New Release',
    live: false,
    title: 'Midnight',
    titleGrad: 'Sessions',
    desc: 'Alex Rivera takes you on a cinematic journey through sound and light. A visually stunning performance blending electronic beats with live instrumentation from downtown LA.',
    meta: { viewers: '1.2M views', time: '45 min runtime', rating: '4.8 Rating' },
    link: '/video',
  },
  {
    img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1920&h=1080&fit=crop',
    badge: 'Comedy Special',
    live: false,
    title: 'Sarah Chen:',
    titleGrad: 'Raw',
    desc: 'One of the most critically acclaimed stand-up specials of the year. Sarah Chen delivers an hour of sharp, unfiltered comedy that will leave you breathless and laughing.',
    meta: { viewers: '3.1M views', time: '1h 15m runtime', rating: '4.9 Rating' },
    link: '/video',
  },
  {
    img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&h=1080&fit=crop',
    badge: 'Documentary',
    live: false,
    title: 'Behind',
    titleGrad: 'the Lens',
    desc: 'Sam Torres exposes the invisible machinery of modern photography. An exclusive behind-the-scenes documentary series exploring the world of visual storytelling.',
    meta: { viewers: '620K views', time: '38 min runtime', rating: '4.7 Rating' },
    link: '/video',
  },
]

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

const PriceBadge = ({ children }) => (
  <div className="absolute top-2 right-2 px-2.5 py-1 price-badge rounded-full text-[10px] font-black text-[#051d2e]">
    {children}
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
      <Link
        to={viewAllTo}
        className="text-xs md:text-sm font-black text-[#00BCD4] hover:text-[#051d2e] transition uppercase tracking-wider shrink-0 ml-4"
      >
        View All →
      </Link>
    ) : (
      <button className="text-xs md:text-sm font-black text-[#00BCD4] hover:text-[#051d2e] transition uppercase tracking-wider shrink-0 ml-4">
        View All →
      </button>
    )}
  </div>
)

/* ═══════════════════════════════════════════════════════ */
export default function UserDashboard() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState('next')
  const total = HERO_SLIDES.length

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
    const id = setInterval(next, 6000)
    return () => clearInterval(id)
  }, [next])

  const slide = HERO_SLIDES[current]

  return (
    <UserLayout>
      {/* ══════════════ HERO CAROUSEL ══════════════ */}
      <section className="relative w-full flex items-center overflow-hidden" style={{ minHeight: '92vh' }}>

        {/* Slides */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 z-0"
            style={{
              opacity: i === current ? 1 : 0,
              transition: 'opacity 0.7s ease-in-out',
              pointerEvents: i === current ? 'auto' : 'none',
            }}
          >
            <img src={s.img} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 hero-overlay-left" />
            <div className="absolute inset-0 hero-overlay-btm" />
          </div>
        ))}

        {/* Content */}
        <div
          className="relative z-10 w-full max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-14 pt-10 pb-16 md:pb-24"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating
              ? direction === 'next' ? 'translateY(18px)' : 'translateY(-18px)'
              : 'translateY(0)',
            transition: 'opacity 0.45s ease, transform 0.45s ease',
          }}
        >
          <div className="max-w-2xl space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="section-pill">
                <Star className="w-3 h-3" fill="currentColor" /> {slide.badge}
              </span>
              {slide.live && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 rounded-full text-xs font-bold text-white shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Live Now
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold leading-[0.88] tracking-tighter text-[#f0fdfa]">
              {slide.title}<br /><GradText className="italic">{slide.titleGrad}</GradText>
            </h1>

            {/* Description */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 max-w-lg border border-[#4DD0E1]/20 shadow-lg">
              <p className="text-sm md:text-base text-[#051d2e] leading-relaxed font-medium">{slide.desc}</p>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to={slide.link}
                className="flex items-center gap-2 px-7 py-3.5 md:px-9 md:py-4 rounded-xl font-bold text-[#051d2e] hover:scale-105 transition-all cyan-glow text-sm md:text-base"
                style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
              >
                <Play className="w-5 h-5" fill="#051d2e" />{slide.live ? 'Watch Live' : 'Watch Now'}
              </Link>
              <button className="flex items-center gap-2 px-7 py-3.5 md:px-9 md:py-4 bg-white/80 text-[#051d2e] rounded-xl font-bold hover:bg-white transition border border-[#4DD0E1]/25 text-sm md:text-base backdrop-blur-sm">
                More Info
              </button>
              <button className="p-3.5 md:p-4 bg-white/80 text-[#051d2e] rounded-xl hover:bg-white transition border border-[#4DD0E1]/25 backdrop-blur-sm">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-5 text-xs md:text-sm text-[#f0fdfa]/80 font-medium">
              <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#4DD0E1]" /><span>{slide.meta.viewers}</span></div>
              <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#4DD0E1]" /><span>{slide.meta.time}</span></div>
            </div>
          </div>
        </div>

        {/* Bottom bar: dots + arrows */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-4">
          {/* Prev arrow */}
          <button
            onClick={prev}
            className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/20 text-white transition hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((_, i) => (
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

          {/* Next arrow */}
          <button
            onClick={next}
            className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/20 text-white transition hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
          <div
            key={current}
            className="h-full"
            style={{
              background: 'linear-gradient(90deg,#4DD0E1,#C0E863)',
              animation: 'heroProgress 6s linear forwards',
            }}
          />
        </div>

        <style>{`
          @keyframes heroProgress {
            from { width: 0% }
            to   { width: 100% }
          }
        `}</style>
      </section>

      {/* ══════════════ CONTENT ROWS ══════════════ */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-12 py-14 space-y-12">

        {/* Continue Watching */}
        <div id="continue">
          <SectionHeader title="Continue Watching" viewAllTo="/dashboard/continue" />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[
              { img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=450&fit=crop', title: 'Sarah Chen: Raw', sub: '35 min remaining', progress: 35, price: '$9.99' },
              { img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=450&fit=crop', title: 'Urban Stories Ep. 3', sub: '12 min remaining', progress: 68, price: '$3.99' },
              { img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=450&fit=crop', title: 'Sound & Vision Podcast', sub: '42 min remaining', progress: 22, free: true },
              { img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop', title: 'Behind the Lens', sub: '5 min remaining', progress: 89, price: '$4.99' },
            ].map((item) => (
              <Link to="/video" key={item.title} className="flex-shrink-0 w-64 sm:w-72 md:w-80 group cursor-pointer block">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
                  <img src={item.img} alt="Video" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <HoverOverlayWide />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#051d2e]/10">
                    <div className="h-full progress-bar" style={{ width: `${item.progress}%` }} />
                  </div>
                  {item.free
                    ? <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: '#C0E863' }}>Free</div>
                    : <PriceBadge>{item.price}</PriceBadge>}
                </div>
                <h3 className="font-black text-sm text-[#051d2e] mb-0.5 truncate">{item.title}</h3>
                <p className="text-xs text-[#051d2e]/60">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Now */}
        <div id="shows">
          <SectionHeader title="Trending Now" />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[
              { img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop', title: 'Midnight Sessions', sub: 'Alex Rivera', rank: '#1', price: '$4.99', desc: 'An intimate look into the creative process', stats: <><span>1.2M views</span><span>•</span><span>45 min</span></> },
              { img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop', title: 'Urban Stories', sub: 'Maya Chen', rank: '#2', price: '$3.99', desc: 'Stories from the streets told through visuals', stats: <><span>890K views</span><span>•</span><span>32 min</span></> },
              { img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=600&fit=crop', title: 'Sound & Vision', sub: 'Jordan Blake', rank: '#3', price: '$5.99', desc: 'A journey through music and visual storytelling', stats: <><span>750K views</span><span>•</span><span>52 min</span></> },
              { img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop', title: 'Behind the Lens', sub: 'Sam Torres', rank: '#4', price: '$4.99', desc: 'Exclusive behind-the-scenes documentary series', stats: <><span>620K views</span><span>•</span><span>38 min</span></> },
              { img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=600&fit=crop', title: 'Creative Flow', sub: 'Riley Park', rank: '#5', price: '$3.99', desc: 'Exploring the intersection of art and creativity', stats: <><span>580K views</span><span>•</span><span>41 min</span></> },
            ].map((item) => (
              <Link to="/video" key={item.title} className="flex-shrink-0 w-44 sm:w-52 md:w-64 group cursor-pointer block">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
                  <img src={item.img} alt="Video" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <HoverOverlayTall desc={item.desc} stats={item.stats} />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 rounded-full text-[10px] font-black text-white">{item.rank}</div>
                  <PriceBadge>{item.price}</PriceBadge>
                </div>
                <h3 className="font-black text-sm text-[#051d2e] mb-0.5 truncate">{item.title}</h3>
                <p className="text-xs text-[#051d2e]/60">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* New Releases */}
        <div>
          <SectionHeader title="New Releases" />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[
              { img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=450&fit=crop', title: 'Acoustic Sessions Vol. 2', sub: 'Marcus Cole • Released today', price: '$6.99', rating: 5 },
              { img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop', title: "The Artist's Mind Podcast", sub: 'Creative Minds • Episode 45', free: true, rating: 4.8 },
              { img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=450&fit=crop', title: 'David Park: Unscripted', sub: 'Comedy Special • 1h 20m', price: '$8.99', rating: 4.9 },
              { img: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=450&fit=crop', title: 'Street Art Chronicles', sub: 'Documentary • Season 1', price: '$5.99', rating: 4.7 },
            ].map((item) => (
              <Link to="/video" key={item.title} className="flex-shrink-0 w-56 sm:w-64 md:w-72 group cursor-pointer block">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
                  <img src={item.img} alt="Video" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <HoverOverlayWide />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>New</div>
                  {item.free
                    ? <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: '#C0E863' }}>Free</div>
                    : <PriceBadge>{item.price}</PriceBadge>}
                </div>
                <h3 className="font-black text-sm text-[#051d2e] mb-0.5 truncate">{item.title}</h3>
                <p className="text-xs text-[#051d2e]/60 mb-1">{item.sub}</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    i <= Math.floor(item.rating) ? <StarFilled key={i} /> : <StarEmpty key={i} />
                  ))}
                  <span className="text-[10px] text-[#051d2e]/60 ml-1">{item.rating}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stand-Up Comedy */}
        <div id="comedy">
          <SectionHeader title="Stand-Up Comedy" />
          <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[
              { img: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=600&fit=crop', title: 'Sarah Chen: Raw', dur: '1h 15m', price: '$9.99' },
              { img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=600&fit=crop', title: 'David Park: Unscripted', dur: '1h 20m', price: '$8.99' },
              { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop', title: 'Mike Torres: Honest', dur: '58 min', price: '$7.99' },
              { img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop', title: 'Lisa Kim: Breakthrough', dur: '1h 5m', price: '$6.99' },
              { img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=600&fit=crop', title: 'Alex Rivera: Unfiltered', dur: '1h 12m', price: '$8.99' },
            ].map((item) => (
              <Link to="/video" key={item.title} className="flex-shrink-0 w-36 sm:w-44 md:w-56 group cursor-pointer block">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 shadow-lg border border-[#4DD0E1]/20">
                  <img src={item.img} alt="Video" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051d2e]/95 via-[#051d2e]/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <PlayBtn size={20} />
                  </div>
                  <PriceBadge>{item.price}</PriceBadge>
                </div>
                <h3 className="font-black text-xs text-[#051d2e] mb-0.5 truncate">{item.title}</h3>
                <p className="text-[10px] text-[#051d2e]/60">{item.dur}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Podcasts */}
        <div id="podcasts">
          <SectionHeader title="Podcasts & Conversations" />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[
              { img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop', title: 'Creative Minds: The Art of Storytelling', sub: 'Episode 42 • 45 min', free: true },
              { img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=450&fit=crop', title: 'Sound & Vision: Music Production', sub: 'Episode 18 • 52 min', free: true },
              { img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=450&fit=crop', title: "The Artist's Journey: Finding Your Voice", sub: 'Episode 7 • 38 min', price: '$2.99' },
              { img: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=450&fit=crop', title: 'Behind the Canvas: Visual Arts', sub: 'Episode 23 • 41 min', free: true },
            ].map((item) => (
              <Link to="/video" key={item.title} className="flex-shrink-0 w-64 sm:w-72 md:w-80 group cursor-pointer block">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
                  <img src={item.img} alt="Video" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <HoverOverlayWide />
                  {item.free
                    ? <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: '#C0E863' }}>Free</div>
                    : <PriceBadge>{item.price}</PriceBadge>}
                </div>
                <h3 className="font-black text-sm text-[#051d2e] mb-0.5 truncate">{item.title}</h3>
                <p className="text-xs text-[#051d2e]/60">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Performances */}
        <div id="live">
          <SectionHeader title="Live Performances" />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[
              { img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=450&fit=crop', title: 'Jazz Night Sessions', sub: 'Marcus Cole • 2.4K watching', live: true, free: true },
              { img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop', title: 'Acoustic Sessions', sub: 'Riley Park • Tomorrow 8 PM', upcoming: true, price: '$4.99' },
              { img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop', title: 'Behind the Lens Q&A', sub: 'Sam Torres • 1.8K watching', live: true, price: '$3.99' },
              { img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=450&fit=crop', title: 'Creative Flow Workshop', sub: 'Maya Chen • Friday 7 PM', upcoming: true, free: true },
            ].map((item) => (
              <Link to="/video" key={item.title} className="flex-shrink-0 w-56 sm:w-64 md:w-72 group cursor-pointer block">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
                  <img src={item.img} alt="Video" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <HoverOverlayWide />
                  {item.live && (
                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
                    </div>
                  )}
                  {item.upcoming && (
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-black border border-[#4DD0E1]/30" style={{ background: 'rgba(77,208,225,0.15)', color: '#4DD0E1' }}>Upcoming</div>
                  )}
                  {item.free
                    ? <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: '#C0E863' }}>Free</div>
                    : <PriceBadge>{item.price}</PriceBadge>}
                </div>
                <h3 className="font-black text-sm text-[#051d2e] mb-0.5 truncate">{item.title}</h3>
                <p className="text-xs text-[#051d2e]/60">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* My List */}
        <div id="mylist">
          <SectionHeader title="My List" sub="SAVED BY YOU" viewAllTo="/dashboard/mylist" />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[
              { img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop', title: 'Jazz Night Sessions', sub: 'Marcus Cole', price: '$4.99', genre: 'Music' },
              { img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop', title: 'Midnight Sessions', sub: 'Alex Rivera', price: '$4.99', genre: 'Music' },
              { img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop', title: "The Artist's Mind Podcast", sub: 'Creative Minds', free: true, genre: 'Podcast' },
              { img: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=600&fit=crop', title: 'Street Art Chronicles', sub: 'Documentary', price: '$5.99', genre: 'Doc' },
              { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop', title: 'Mike Torres: Honest', sub: 'Stand-up Comedy', price: '$7.99', genre: 'Comedy' },
              { img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop', title: 'Behind the Lens', sub: 'Sam Torres', price: '$4.99', genre: 'Doc' },
            ].map((item) => (
              <Link to="/video" key={item.title} className="flex-shrink-0 w-44 sm:w-52 md:w-64 group cursor-pointer block">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
                  <img src={item.img} alt="Video" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051d2e]/95 via-[#051d2e]/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <PlayBtn size={20} />
                  </div>
                  {item.free
                    ? <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: '#C0E863' }}>Free</div>
                    : <PriceBadge>{item.price}</PriceBadge>}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#051d2e]/80 border border-[#4DD0E1]/30" style={{ background: 'rgba(255,255,255,0.85)' }}>{item.genre}</div>
                  <button className="absolute bottom-2 right-2 p-1.5 rounded-full text-[#C0E863] opacity-0 group-hover:opacity-100 transition">
                    <BookmarkCheck className="w-4 h-4" fill="currentColor" />
                  </button>
                </div>
                <h3 className="font-black text-xs text-[#051d2e] mb-0.5 truncate">{item.title}</h3>
                <p className="text-[10px] text-[#051d2e]/60">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Purchased */}
        <div id="purchased">
          <SectionHeader title="Purchased" sub="YOUR LIBRARY" viewAllTo="/dashboard/purchased" />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[
              { img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=450&fit=crop', title: 'Sarah Chen: Raw', sub: 'Stand-up Comedy • 1h 15m', price: '$9.99', date: 'Mar 2' },
              { img: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=450&fit=crop', title: 'Street Art Chronicles', sub: 'Documentary • Season 1', price: '$5.99', date: 'Feb 14' },
              { img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop', title: 'Midnight Sessions', sub: 'Music • 45 min', price: '$4.99', date: 'Jan 28' },
              { img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=450&fit=crop', title: 'Urban Stories', sub: 'Series • 3 Episodes', price: '$3.99', date: 'Jan 10' },
            ].map((item) => (
              <Link to="/video" key={item.title} className="flex-shrink-0 w-64 sm:w-72 md:w-80 group cursor-pointer block">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg border border-[#4DD0E1]/20">
                  <img src={item.img} alt="Video" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <HoverOverlayWide />
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>
                    <CheckCircle className="w-3 h-3" /> Owned
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-white/20 text-white/80" style={{ background: 'rgba(5,29,46,0.6)' }}>Bought {item.date}</div>
                </div>
                <h3 className="font-black text-sm text-[#051d2e] mb-0.5 truncate">{item.title}</h3>
                <p className="text-xs text-[#051d2e]/60">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>

      </section>
    </UserLayout>
  )
}
