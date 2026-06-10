import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Play, Users, Clock, Calendar, Star,
  Bookmark, Check,
  ChevronDown, Music,
} from 'lucide-react'
import UserLayout from '../components/layout/UserLayout'

/* ─── colour tokens (match dashboard) ───────────────────── */
const C = {
  navy:    '#051d2e',
  primary: '#4DD0E1',
  teal:    '#00BCD4',
  lime:    '#C0E863',
  muted:   '#4a7080',
  ice:     '#e0f7fa',
}

/* ─── tiny helpers ───────────────────────────────────────── */
const GradText = ({ children, className = '' }) => (
  <span
    className={className}
    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
  >{children}</span>
)

const GradBtn = ({ children, className = '', onClick, style = {} }) => (
  <button
    onClick={onClick}
    className={`transition-all hover:scale-105 ${className}`}
    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', boxShadow: '0 0 16px rgba(77,208,225,0.4)', ...style }}
  >{children}</button>
)

const SectionPill = ({ icon, children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
    style={{ background: 'linear-gradient(135deg,rgba(77,208,225,0.15),rgba(192,232,99,0.12))', border: '1px solid rgba(77,208,225,0.3)', color: C.navy }}>
    {icon}{children}
  </span>
)

const PriceBadge = ({ children, free }) => (
  <span
    className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black"
    style={free
      ? { background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: C.navy }
      : { background: 'linear-gradient(135deg,#4DD0E1,#00BCD4)', color: '#fff' }
    }
  >{children}</span>
)

const StarRating = ({ count = 5 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(count)].map((_, i) => (
      <Star key={i} className="w-4 h-4" style={{ fill: C.lime, color: C.lime }} />
    ))}
  </div>
)

/* ─── recommended videos data ─────────────────────────────── */
const RECOMMENDED = [
  { img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=450&fit=crop', title: 'Urban Stories: Episode 3', creator: 'Maya Chen', views: '890K views', time: '2 days ago', duration: '32:15', price: '$3.99' },
  { img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=450&fit=crop', title: 'Sarah Chen: Raw - Stand-Up Special', creator: 'Sarah Chen', views: '1.2M views', time: '1 week ago', duration: '1:15:20', price: '$9.99' },
  { img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop', title: 'Creative Minds: The Art of Storytelling', creator: 'Podcast Network', views: '750K views', time: '3 days ago', duration: '45:30', free: true },
  { img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=450&fit=crop', title: 'Sound & Vision: Music Production', creator: 'Jordan Blake', views: '620K views', time: '5 days ago', duration: '52:45', price: '$5.99' },
  { img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop', title: 'Behind the Lens: Documentary', creator: 'Sam Torres', views: '580K views', time: '1 week ago', duration: '38:20', price: '$4.99' },
  { img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=450&fit=crop', title: 'Creative Flow: Finding Your Voice', creator: 'Riley Park', views: '490K views', time: '2 weeks ago', duration: '41:15', price: '$3.99' },
  { img: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=450&fit=crop', title: 'Street Art Chronicles: Season 1', creator: 'Art Collective', views: '380K views', time: '3 weeks ago', duration: '28:40', free: true },
]

const MORE_FROM_MARCUS = [
  { img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=450&fit=crop', title: 'Acoustic Sessions Vol. 2', views: '1.2M views', time: '2 weeks ago', duration: '52:18', price: '$6.99' },
  { img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop', title: 'Behind the Music: My Journey', views: '890K views', time: '1 month ago', duration: '38:45', price: '$4.99' },
  { img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop', title: 'Summer Jazz Festival 2024', views: '2.1M views', time: '3 months ago', duration: '1:15:22', free: true },
  { img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop', title: 'Midnight Reflections EP', views: '650K views', time: '2 months ago', duration: '44:30', price: '$5.99' },
]

const COMMENTS = [
  { img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', name: 'Sarah Mitchell', time: '2 hours ago', text: 'This is absolutely incredible! The improvisation at 45:30 gave me chills. Marcus, you\'re a true master of your craft. Can\'t wait for the new album! 🎵', likes: 245 },
  { img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', name: 'James Park', time: '3 hours ago', text: 'Been following Marcus since his early days. This performance is everything I hoped for and more. The chemistry with the band is phenomenal!', likes: 189 },
  { img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', name: 'Riley Chen', time: '4 hours ago', text: 'The sound quality is amazing! Love that we can experience this live from anywhere in the world. This is the future of music streaming! 🎶', likes: 156 },
]

const REACTIONS = [
  { id: 'heart', emoji: '❤️', label: 'Love', count: 1264 },
  { id: 'party', emoji: '🎉', label: 'Party', count: 842 },
  { id: 'fire', emoji: '👏', label: 'Clap', count: 663 },
  { id: 'wow', emoji: '😍', label: 'Wow', count: 579 },
  { id: 'star', emoji: '⭐', label: 'Star', count: 932 },
]

/* ─── sub-components ─────────────────────────────────────── */
const GlassCard = ({ children, className = '' }) => (
  <div className={`rounded-2xl border shadow-lg ${className}`}
    style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(77,208,225,0.2)' }}>
    {children}
  </div>
)

const ActionBtn = ({ icon, label, primary }) => (
  primary ? (
    <GradBtn className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#051d2e]">
      {icon}{label && <span>{label}</span>}
    </GradBtn>
  ) : (
    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition border hover:bg-white"
      style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(77,208,225,0.25)', color: C.navy }}>
      {icon}{label && <span>{label}</span>}
    </button>
  )
)

const RecCard = ({ item }) => {
  const navigate = useNavigate()
  return (
    <div
      className="flex gap-3 group cursor-pointer rounded-xl p-3 border transition-all hover:-translate-y-1"
      style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(77,208,225,0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
      onClick={() => navigate('/video')}
    >
      <div className="relative w-36 sm:w-40 aspect-video rounded-lg overflow-hidden shrink-0">
        <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
          style={{ background: 'rgba(5,29,46,0.8)' }}>{item.duration}</span>
        {item.free
          ? <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black text-[#051d2e]"
              style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>Free</span>
          : <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#4DD0E1,#00BCD4)' }}>{item.price}</span>
        }
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="font-bold text-sm line-clamp-2 mb-1" style={{ color: C.navy }}>{item.title}</h3>
        <p className="text-xs mb-0.5" style={{ color: C.muted }}>{item.creator}</p>
        <p className="text-xs" style={{ color: C.muted }}>{item.views} · {item.time}</p>
      </div>
    </div>
  )
}

const VideoCard = ({ item }) => {
  const navigate = useNavigate()
  return (
    <div className="group cursor-pointer" onClick={() => navigate('/video')}
      style={{ transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg border border-primary/20"
        style={{ borderColor: 'rgba(77,208,225,0.2)' }}>
        <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300"
          style={{ background: 'linear-gradient(to top,rgba(5,29,46,0.7),transparent)' }}>
          <button className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>
            <Play className="w-5 h-5 ml-0.5" style={{ color: C.navy }} fill={C.navy} />
          </button>
        </div>
        {item.free
          ? <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-black text-[#051d2e]"
              style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>Free</span>
          : <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#4DD0E1,#00BCD4)' }}>{item.price}</span>
        }
        <span className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-semibold text-white"
          style={{ background: 'rgba(5,29,46,0.8)' }}>{item.duration}</span>
      </div>
      <h3 className="font-bold text-sm mb-0.5 truncate" style={{ color: C.navy }}>{item.title}</h3>
      <p className="text-xs" style={{ color: C.muted }}>{item.views} · {item.time}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
export default function VideoDetail() {
  const [activeReaction, setActiveReaction] = useState(null)
  const [reactionCounts, setReactionCounts] = useState(
    REACTIONS.reduce((acc, reaction) => {
      acc[reaction.id] = reaction.count
      return acc
    }, {})
  )
  const [saved, setSaved] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [descExpanded, setDescExpanded] = useState(false)
  const navigate = useNavigate()

  const handleReactionClick = (reactionId) => {
    setReactionCounts((prev) => {
      const next = { ...prev }

      if (activeReaction === reactionId) {
        next[reactionId] = Math.max(0, next[reactionId] - 1)
      } else {
        if (activeReaction) {
          next[activeReaction] = Math.max(0, next[activeReaction] - 1)
        }
        next[reactionId] += 1
      }

      return next
    })

    setActiveReaction((prev) => (prev === reactionId ? null : reactionId))
  }

  return (
    <UserLayout>
      {/* Back button row */}
      <div className="px-4 sm:px-6 lg:px-14 pt-6 pb-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition hover:bg-[rgba(77,208,225,0.15)]"
          style={{ color: C.navy }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* ══════════════ MAIN ══════════════ */}
      <div className="px-4 sm:px-6 lg:px-14 py-4 md:py-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* ── LEFT COLUMN ── */}
            <div className="xl:col-span-2 space-y-6">

              {/* Video player */}
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border"
                style={{ borderColor: 'rgba(77,208,225,0.25)' }}>
                <img src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1920&h=1080&fit=crop" alt="Jazz Night Sessions" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(5,29,46,0.5),transparent)' }} />
                {/* Play */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition hover:scale-110 shadow-2xl"
                    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', boxShadow: '0 0 32px rgba(77,208,225,0.6)' }}>
                    <Play className="w-7 h-7 md:w-9 md:h-9 ml-1" style={{ color: C.navy }} fill={C.navy} />
                  </button>
                </div>
                {/* Live badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full text-xs font-bold text-white shadow-lg">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />LIVE NOW
                </div>
                {/* Duration */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                  style={{ background: 'rgba(5,29,46,0.8)', backdropFilter: 'blur(4px)' }}>1:24:35</div>
              </div>

              {/* Title card */}
              <GlassCard className="p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <SectionPill icon={<Music className="w-3 h-3" />}>Jazz &amp; Live Music</SectionPill>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 rounded-full text-xs font-bold text-white">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3" style={{ color: C.navy }}>
                      Jazz Night Sessions
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 md:gap-5 text-sm" style={{ color: C.muted }}>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" style={{ color: C.primary }} /><span>2.4K watching</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" style={{ color: C.primary }} /><span>Started 1h 24m ago</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" style={{ color: C.primary }} /><span>Dec 15, 2024</span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-5 py-2 rounded-full text-sm font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', boxShadow: '0 0 16px rgba(77,208,225,0.4)', color: C.navy }}>
                    Free
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4"
                  style={{ borderTop: '1px solid rgba(77,208,225,0.15)' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {REACTIONS.map((reaction) => {
                      const selected = activeReaction === reaction.id
                      return (
                        <button
                          key={reaction.id}
                          type="button"
                          onClick={() => handleReactionClick(reaction.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                          style={selected
                            ? {
                                color: C.navy,
                                background: 'linear-gradient(135deg,rgba(77,208,225,0.28),rgba(192,232,99,0.28))',
                                border: '1px solid rgba(77,208,225,0.65)',
                                boxShadow: '0 0 14px rgba(77,208,225,0.26)',
                              }
                            : {
                                color: C.navy,
                                background: 'rgba(255,255,255,0.75)',
                                border: '1px solid rgba(77,208,225,0.24)',
                              }}
                          aria-label={`${reaction.label} reaction`}
                        >
                          <span className="text-base leading-none">{reaction.emoji}</span>
                          <span className="text-xs md:text-sm">{reactionCounts[reaction.id]}</span>
                        </button>
                      )
                    })}
                  </div>
                  <ActionBtn
                    icon={<Bookmark className="w-4 h-4" fill={saved ? C.navy : 'none'} />}
                    label="Save"
                  />
                </div>
              </GlassCard>

              {/* Creator card */}
              <GlassCard className="p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                    alt="Marcus Cole"
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover shrink-0"
                    style={{ ring: '2px solid rgba(77,208,225,0.5)', outline: '2px solid rgba(77,208,225,0.4)', outlineOffset: '2px' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <button
                        onClick={() => navigate('/artist/marcus-cole')}
                        className="text-lg md:text-xl font-bold transition hover:opacity-80"
                        style={{ color: C.navy }}
                      >
                        Marcus Cole
                      </button>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>
                        <Check className="w-3 h-3" style={{ color: C.navy }} />
                      </div>
                    </div>
                     </div>
                </div>
                <div className="pt-4 space-y-3" style={{ borderTop: '1px solid rgba(77,208,225,0.15)' }}>
                  <p className="text-sm md:text-base leading-relaxed" style={{ color: `${C.navy}cc` }}>
                    Join me for an intimate evening of smooth jazz, improvisation, and raw musical talent. Tonight's session features original compositions from my upcoming album "Midnight Reflections" along with classic jazz standards reimagined.
                  </p>
                  {descExpanded && (
                    <p className="text-sm md:text-base leading-relaxed" style={{ color: `${C.navy}cc` }}>
                      This live performance is streaming directly from my Brooklyn studio, where I'll be performing with a full band including Sarah Mitchell on saxophone, James Park on bass, and Riley Chen on drums. We'll be taking requests from the chat and sharing stories behind the music.
                    </p>
                  )}
                  <button
                    className="flex items-center gap-1.5 text-sm font-bold transition"
                    style={{ color: C.primary }}
                    onClick={() => setDescExpanded(e => !e)}
                  >
                    <span>{descExpanded ? 'Show less' : 'Show more'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${descExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </GlassCard>

              {/* More from Marcus Cole */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter" style={{ color: C.navy }}>
                    More from Marcus Cole
                  </h2>
                  <button
                    className="text-xs md:text-sm font-black uppercase tracking-wider transition hover:text-navy"
                    style={{ color: C.teal }}
                    onClick={() => navigate('/artist/marcus-cole')}
                  >
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MORE_FROM_MARCUS.map(item => <VideoCard key={item.title} item={item} />)}
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN (recommended) ── */}
            <div className="xl:col-span-1">
              <div className="xl:sticky xl:top-24 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter" style={{ color: C.navy }}>
                    Recommended
                  </h2>
                  <button className="text-xs font-black uppercase tracking-wider transition hover:text-navy"
                    style={{ color: C.teal }}>See All →</button>
                </div>
                {RECOMMENDED.map(item => <RecCard key={item.title} item={item} />)}
              </div>
            </div>

          </div>
        </div>
      </div>
    </UserLayout>
  )
}
