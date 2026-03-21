import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, ChevronLeft, CheckCircle, ShoppingBag, Download } from 'lucide-react'
import UserLayout from '../components/layout/UserLayout'

const ITEMS = [
  { img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=450&fit=crop',  title: 'Sarah Chen: Raw',           genre: 'Stand-up Comedy',  duration: '1h 15m', price: 9.99,  date: 'Mar 2, 2026' },
  { img: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=450&fit=crop',  title: 'Street Art Chronicles',     genre: 'Documentary',      duration: 'Season 1', price: 5.99, date: 'Feb 14, 2026' },
  { img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop',  title: 'Midnight Sessions',         genre: 'Music',            duration: '45 min',  price: 4.99,  date: 'Jan 28, 2026' },
  { img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=450&fit=crop',  title: 'Urban Stories',             genre: 'Series',           duration: '3 episodes', price: 3.99, date: 'Jan 10, 2026' },
  { img: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=600&fit=crop',  title: 'Jordan Blake: Real Talk',   genre: 'Stand-up Comedy',  duration: '1h 05m', price: 9.99,  date: 'Dec 22, 2025' },
  { img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop',  title: 'Behind the Lens',           genre: 'Documentary',      duration: '38 min',  price: 4.99,  date: 'Dec 5, 2025' },
]

const SORT_OPTIONS = ['Recently Purchased', 'Title A – Z', 'Highest Price']

export default function Purchased() {
  const [sort, setSort] = useState('Recently Purchased')

  const sorted = [...ITEMS].sort((a, b) => {
    if (sort === 'Title A – Z') return a.title.localeCompare(b.title)
    if (sort === 'Highest Price') return b.price - a.price
    return 0 // default: keep insertion order (most recent first)
  })

  const totalSpent = ITEMS.reduce((s, i) => s + i.price, 0).toFixed(2)

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
            <h1 className="text-3xl font-black text-[#051d2e] tracking-tight">Your Library</h1>
            <p className="text-sm text-[#051d2e]/50 mt-0.5">Videos and shows you own — yours forever</p>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="flex flex-wrap gap-3 mt-6 mb-8">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#4DD0E1]/20 text-sm font-semibold text-[#051d2e]/70"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          >
            <ShoppingBag className="w-4 h-4 text-[#4DD0E1]" />
            {ITEMS.length} items owned
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#4DD0E1]/20 text-sm font-semibold text-[#051d2e]/70"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          >
            <CheckCircle className="w-4 h-4 text-[#4DD0E1]" />
            ${totalSpent} total spent
          </div>
        </div>

        {/* ── Sort control ── */}
        <div className="flex items-center gap-3 mb-6">
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

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl overflow-hidden border border-[#4DD0E1]/20 shadow-sm hover:shadow-lg transition-shadow"
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
                <Link
                  to="/video"
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
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4DD0E1]">{item.genre}</span>
                  <span className="text-[10px] font-bold text-[#051d2e]/45">{item.duration}</span>
                </div>
                <h3 className="font-black text-sm text-[#051d2e] mb-3">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#051d2e]/40 uppercase tracking-wider">Purchased</p>
                    <p className="text-xs font-semibold text-[#051d2e]/60">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#051d2e]">${item.price.toFixed(2)}</span>
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#4DD0E1]/30 text-[#051d2e]/50 hover:border-[#4DD0E1] hover:text-[#051d2e] hover:bg-white/60 transition"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </UserLayout>
  )
}
