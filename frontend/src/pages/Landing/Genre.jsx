import React, { useState } from 'react'
import Navbar from '../../components/layout/Navbar'

const genres = [
  {
    id: 1,
    name: 'Poetry',
    icon: '✍️',
    description: 'Words that breathe, verses that ache.',
    videoCount: 24,
    gradient: 'from-[#B2EBF2] to-[#4DD0E1]',
    accent: '#4DD0E1',
    tag: 'Most Loved',
  },
  {
    id: 2,
    name: 'Spoken Word',
    icon: '🎙️',
    description: 'Raw voice. Real stories.',
    videoCount: 18,
    gradient: 'from-[#F8BBD0] to-[#ce6a6b]',
    accent: '#ce6a6b',
    tag: 'Trending',
  },
  {
    id: 3,
    name: 'Short Films',
    icon: '🎬',
    description: 'Cinema stripped to its soul.',
    videoCount: 31,
    gradient: 'from-[#D1C4E9] to-[#7E57C2]',
    accent: '#7E57C2',
    tag: null,
  },
  {
    id: 4,
    name: 'Dance',
    icon: '💃',
    description: 'Movement as a mother tongue.',
    videoCount: 22,
    gradient: 'from-[#DCEDC8] to-[#C0E863]',
    accent: '#8bc34a',
    tag: 'New',
  },
  {
    id: 5,
    name: 'Music',
    icon: '🎵',
    description: 'Melodies that outlive their moment.',
    videoCount: 40,
    gradient: 'from-[#FFE0B2] to-[#FF9800]',
    accent: '#FF9800',
    tag: 'Popular',
  },
  {
    id: 6,
    name: 'Storytelling',
    icon: '📖',
    description: 'Once upon a now.',
    videoCount: 15,
    gradient: 'from-[#FFF9C4] to-[#F9A825]',
    accent: '#F9A825',
    tag: null,
  },
  {
    id: 7,
    name: 'Visual Art',
    icon: '🎨',
    description: 'Colour as conversation.',
    videoCount: 19,
    gradient: 'from-[#FCE4EC] to-[#E91E63]',
    accent: '#E91E63',
    tag: null,
  },
  {
    id: 8,
    name: 'Theatre',
    icon: '🎭',
    description: 'Live magic, captured forever.',
    videoCount: 12,
    gradient: 'from-[#CFD8DC] to-[#455A64]',
    accent: '#607D8B',
    tag: 'Exclusive',
  },
]

const allVideos = [
  { id: 1, genreId: 1, title: 'Petals in the Rain', artist: 'Suchi Bansal', duration: '4:12', views: '2.1k', gradient: 'from-[#B2EBF2] to-[#4DD0E1]' },
  { id: 2, genreId: 1, title: 'Letters to Yesterday', artist: 'Ritika Sharma', duration: '3:45', views: '1.8k', gradient: 'from-[#B2EBF2] to-[#26C6DA]' },
  { id: 3, genreId: 2, title: 'Inking Emotions — Live', artist: 'Anjali Jain', duration: '9:30', views: '5.4k', gradient: 'from-[#F8BBD0] to-[#ce6a6b]' },
  { id: 4, genreId: 2, title: 'The Weight of Words', artist: 'Karan Verma', duration: '7:15', views: '3.2k', gradient: 'from-[#FFCCBC] to-[#FF7043]' },
  { id: 5, genreId: 3, title: 'The Last Canvas', artist: 'Rohan Mehta', duration: '18:40', views: '4.7k', gradient: 'from-[#D1C4E9] to-[#7E57C2]' },
  { id: 6, genreId: 3, title: 'One Frame at a Time', artist: 'Sneha Pillai', duration: '22:10', views: '3.9k', gradient: 'from-[#C5CAE9] to-[#3F51B5]' },
  { id: 7, genreId: 4, title: 'Mitti ki Khushboo', artist: 'Priya Das', duration: '6:05', views: '6.1k', gradient: 'from-[#DCEDC8] to-[#C0E863]' },
  { id: 8, genreId: 4, title: 'Footprints of Soul', artist: 'Meera Nair', duration: '5:30', views: '4.3k', gradient: 'from-[#F0F4C3] to-[#C6FF00]' },
  { id: 9, genreId: 5, title: 'Silence Speaks', artist: 'Kabir Nair', duration: '3:58', views: '7.2k', gradient: 'from-[#FFE0B2] to-[#FF9800]' },
  { id: 10, genreId: 5, title: 'Raag of Tomorrow', artist: 'Ishaan Desai', duration: '11:20', views: '5.0k', gradient: 'from-[#FFF3E0] to-[#FFB300]' },
  { id: 11, genreId: 6, title: 'The Train That Waits', artist: 'Aisha Qureshi', duration: '14:00', views: '2.9k', gradient: 'from-[#FFF9C4] to-[#F9A825]' },
  { id: 12, genreId: 7, title: 'Woven Dreams', artist: 'Aisha Qureshi', duration: '8:45', views: '3.5k', gradient: 'from-[#FCE4EC] to-[#E91E63]' },
]

const Genre = () => {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  const activeGenre = genres.find((g) => g.id === selected)
  const videos = selected
    ? allVideos.filter((v) => v.genreId === selected)
    : allVideos

  const filteredGenres = genres.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
   <div>
    <Navbar/>
     <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9]">
      {/* Hero */}
      <div className="relative pt-20 pb-14 px-6 lg:px-20 text-center overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-lime/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-5">
          <span className="inline-block font-mono text-[10px] uppercase tracking-[0.5em] text-navy/40">Browse by</span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-navy leading-tight">
            Explore by{' '}
            <span className="bg-linear-to-r from-primary to-lime bg-clip-text text-transparent">
              Genre
            </span>
          </h1>
          <p className="text-navy/55 text-base max-w-md mx-auto">
            Every art form tells a different story. Find yours.
          </p>
          <div className="relative max-w-sm mx-auto mt-2">
            <input
              type="text"
              placeholder="Search genres…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-primary/20 rounded-2xl px-5 py-3 pr-10 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:border-primary/60 shadow-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/30 text-sm">🔍</span>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-20 pb-24">
        {/* Genre Cards Grid */}
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-16">
            {filteredGenres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelected(selected === genre.id ? null : genre.id)}
                className={`group relative text-left rounded-3xl overflow-hidden p-6 transition-all duration-300 border ${
                  selected === genre.id
                    ? 'ring-2 ring-offset-2 scale-[1.03] shadow-2xl border-transparent'
                    : 'border-white/60 hover:scale-[1.02] hover:shadow-xl shadow-md bg-white/60'
                }`}
                style={selected === genre.id ? { ringColor: genre.accent } : {}}
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${genre.gradient} transition-opacity duration-300 ${
                    selected === genre.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-20'
                  }`}
                />
                <div className="relative z-10">
                  {genre.tag && (
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-3 ${
                        selected === genre.id
                          ? 'bg-white/30 text-white'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {genre.tag}
                    </span>
                  )}
                  <div className="text-3xl mb-3">{genre.icon}</div>
                  <h3
                    className={`font-bold text-lg leading-tight mb-1 ${
                      selected === genre.id ? 'text-white' : 'text-navy'
                    }`}
                  >
                    {genre.name}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed mb-4 ${
                      selected === genre.id ? 'text-white/80' : 'text-navy/50'
                    }`}
                  >
                    {genre.description}
                  </p>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest ${
                      selected === genre.id ? 'text-white/70' : 'text-navy/30'
                    }`}
                  >
                    {genre.videoCount} videos
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Videos Section */}
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-navy">
                  {activeGenre ? activeGenre.name : 'All Genres'}
                </h2>
                <p className="text-navy/45 text-sm mt-1">
                  {activeGenre ? activeGenre.description : 'Hand-picked across every art form'}
                </p>
              </div>
              {selected && (
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm text-navy/40 hover:text-navy flex items-center gap-1 transition-colors"
                >
                  ← All genres
                </button>
              )}
            </div>

            {videos.length === 0 ? (
              <div className="text-center py-20 text-navy/30 text-sm">
                No videos in this genre yet. Check back soon.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {videos.map((video) => (
                  <div key={video.id} className="group cursor-pointer">
                    <div className="relative rounded-2xl overflow-hidden mb-3 shadow-md" style={{ aspectRatio: '16/9' }}>
                      <div className={`w-full h-full bg-linear-to-br ${video.gradient} flex items-center justify-center`}>
                        <span className="text-white/50 text-4xl group-hover:scale-110 transition-transform duration-300">▶</span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-xs text-white font-mono">
                        {video.duration}
                      </div>
                      <div className="absolute inset-0 bg-navy/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    </div>
                    <h4 className="font-semibold text-navy text-sm truncate">{video.title}</h4>
                    <p className="text-navy/40 text-xs mt-0.5">{video.artist} · {video.views} views</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
   </div>
  )
}

export default Genre