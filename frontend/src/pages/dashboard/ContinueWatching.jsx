import { Link } from 'react-router-dom'
import { Play, ChevronLeft, Clock, RotateCcw } from 'lucide-react'
import UserLayout from '../../components/layout/UserLayout'

const ITEMS = []

const progressColour = (p) => {
  if (p >= 75) return 'linear-gradient(90deg,#C0E863,#4DD0E1)'
  if (p >= 40) return 'linear-gradient(90deg,#4DD0E1,#C0E863)'
  return 'linear-gradient(90deg,#4DD0E1,#80DEEA)'
}

export default function ContinueWatching() {
  const totalMinutes = ITEMS.reduce((acc, i) => {
    const m = parseInt(i.remaining)
    return acc + m
  }, 0)

  return (
    <UserLayout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 py-10">

        {/* ── Page header ── */}
        <div className="flex items-center gap-4 mb-2">
          <Link
            to="/dashboard"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-[#4DD0E1]/30 text-[#051d2e]/60 hover:text-[#051d2e] hover:border-[#4DD0E1] hover:bg-white/50 transition shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#051d2e] tracking-tight">Continue Watching</h1>
            <p className="text-sm text-[#051d2e]/50 mt-0.5">{ITEMS.length} videos in progress</p>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="flex flex-wrap gap-3 mb-8 mt-5">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#4DD0E1]/20 text-sm font-semibold text-[#051d2e]/70"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          >
            <Clock className="w-4 h-4 text-[#4DD0E1]" />
            ~{totalMinutes} min left across all videos
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#4DD0E1]/20 text-sm font-semibold text-[#051d2e]/70"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          >
            <RotateCcw className="w-4 h-4 text-[#4DD0E1]" />
            {ITEMS.filter(i => i.progress >= 75).length} almost done
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {ITEMS.map((item) => (
            <Link
              to="/video"
              key={item.title}
              className="group block rounded-2xl overflow-hidden border border-[#4DD0E1]/20 shadow-sm hover:shadow-lg transition-shadow"
              style={{ background: 'rgba(255,255,255,0.75)' }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#051d2e]/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                  <div
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-[#051d2e] text-sm shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
                  >
                    <Play className="w-4 h-4" fill="#051d2e" /> Resume
                  </div>
                </div>
                {/* Price / free badge */}
                {item.free
                  ? <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: '#C0E863' }}>Free</div>
                  : <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>{item.price}</div>
                }
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#051d2e]/20">
                  <div className="h-full rounded-r-full" style={{ width: `${item.progress}%`, background: progressColour(item.progress) }} />
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4DD0E1]">{item.genre}</span>
                  <span className="text-[10px] font-semibold text-[#051d2e]/50">{item.progress}% watched</span>
                </div>
                <h3 className="font-black text-sm text-[#051d2e] truncate mb-2">{item.title}</h3>
                <div className="flex items-center justify-between text-xs text-[#051d2e]/55">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#4DD0E1]" /> {item.remaining} left
                  </span>
                  <span>{item.total} total</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </UserLayout>
  )
}
