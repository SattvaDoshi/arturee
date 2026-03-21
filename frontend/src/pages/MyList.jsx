import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, ChevronLeft, BookmarkCheck, Trash2 } from 'lucide-react'
import UserLayout from '../components/layout/UserLayout'

const ALL_ITEMS = [
  { img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop',  title: 'Jazz Night Sessions',        sub: 'Marcus Cole',    price: '$4.99', genre: 'Music' },
  { img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',  title: 'Midnight Sessions',          sub: 'Alex Rivera',    price: '$4.99', genre: 'Music' },
  { img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop',  title: "The Artist's Mind Podcast",  sub: 'Creative Minds', free: true,     genre: 'Podcast' },
  { img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=450&fit=crop',  title: 'Sound & Vision: Music Prod', sub: 'Creative Minds', free: true,     genre: 'Podcast' },
  { img: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=600&fit=crop',  title: 'Street Art Chronicles',      sub: 'Documentary',    price: '$5.99', genre: 'Doc' },
  { img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop',  title: 'Behind the Lens',            sub: 'Sam Torres',     price: '$4.99', genre: 'Doc' },
  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop',     title: 'Mike Torres: Honest',        sub: 'Stand-up Comedy', price: '$7.99', genre: 'Comedy' },
  { img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=600&fit=crop',  title: 'Alex Rivera: Unfiltered',    sub: 'Stand-up Comedy', price: '$8.99', genre: 'Comedy' },
  { img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',  title: 'Lisa Kim: Breakthrough',     sub: 'Stand-up Comedy', price: '$6.99', genre: 'Comedy' },
  { img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=600&fit=crop',  title: 'Sound & Vision Film',        sub: 'Jordan Blake',   price: '$5.99', genre: 'Music' },
]

const GENRES = ['All', 'Music', 'Comedy', 'Doc', 'Podcast']

export default function MyList() {
  const [activeGenre, setActiveGenre] = useState('All')
  const [saved, setSaved] = useState(() => ALL_ITEMS.map((_, i) => i))

  const filtered = ALL_ITEMS.filter(
    (item, i) => saved.includes(i) && (activeGenre === 'All' || item.genre === activeGenre)
  )

  const remove = (title) => {
    const idx = ALL_ITEMS.findIndex(i => i.title === title)
    setSaved(prev => prev.filter(i => i !== idx))
  }

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
            <h1 className="text-3xl font-black text-[#051d2e] tracking-tight">My List</h1>
            <p className="text-sm text-[#051d2e]/50 mt-0.5">{saved.length} saved titles</p>
          </div>
        </div>

        {/* ── Genre filter ── */}
        <div className="flex flex-wrap gap-2 mt-6 mb-8">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className="px-4 py-2 rounded-full text-sm font-bold transition-all"
              style={
                activeGenre === g
                  ? { background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e' }
                  : { background: 'rgba(255,255,255,0.7)', color: 'rgba(5,29,46,0.55)', border: '1px solid rgba(77,208,225,0.25)' }
              }
            >
              {g}
            </button>
          ))}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(77,208,225,0.12)' }}
            >
              <BookmarkCheck className="w-8 h-8 text-[#4DD0E1]" />
            </div>
            <p className="text-lg font-black text-[#051d2e]">Nothing saved here yet</p>
            <p className="text-sm text-[#051d2e]/50 mt-1">Bookmark titles from the dashboard to see them here</p>
            <Link
              to="/dashboard"
              className="mt-5 px-6 py-2.5 rounded-xl font-black text-[#051d2e] text-sm hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
            >
              Browse Content
            </Link>
          </div>
        )}

        {/* ── Poster grid ── */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((item) => (
              <div key={item.title} className="group relative">
                <Link to="/video" className="block">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-md border border-[#4DD0E1]/20">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#051d2e]/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
                      >
                        <Play className="w-5 h-5 ml-0.5" fill="#051d2e" />
                      </div>
                    </div>
                    {/* Badges */}
                    {item.free
                      ? <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: '#C0E863' }}>Free</div>
                      : <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black text-[#051d2e]" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>{item.price}</div>
                    }
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/30 text-white/80" style={{ background: 'rgba(5,29,46,0.55)' }}>{item.genre}</div>
                    {/* Bookmark saved indicator */}
                    <div className="absolute bottom-2 right-2 p-1.5 rounded-full" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>
                      <BookmarkCheck className="w-3.5 h-3.5 text-[#051d2e]" fill="#051d2e" />
                    </div>
                  </div>
                  <h3 className="font-black text-xs text-[#051d2e] truncate mb-0.5">{item.title}</h3>
                  <p className="text-[10px] text-[#051d2e]/55">{item.sub}</p>
                </Link>
                {/* Remove button — appears on hover */}
                <button
                  onClick={() => remove(item.title)}
                  title="Remove from My List"
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-600"
                  style={{ zIndex: 10 }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </UserLayout>
  )
}
