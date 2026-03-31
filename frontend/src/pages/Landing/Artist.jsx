import React, { useState } from 'react'
import Navbar from '../../components/layout/Navbar'

const artists = [
  {
    id: 1,
    name: 'Suchi Bansal',
    role: 'Poetess & Storyteller',
    specialty: 'Poetry · Storytelling',
    bio: 'A Financial Analyst by day, poetess by soul. Suchi weaves words into worlds — one verse, one journey at a time.',
    videos: 8,
    followers: '2.4k',
    gradient: 'from-[#B2EBF2] to-[#4DD0E1]',
    initials: 'SB',
    tag: 'Founder',
    tagColor: 'bg-[#ce6a6b]/15 text-[#ce6a6b]',
  },
  {
    id: 2,
    name: 'Anjali Jain',
    role: 'Author & Performer',
    specialty: 'Spoken Word · Writing',
    bio: 'World record holder. Award-winning artist. Author of Inking Emotions. For Anjali, writing is worship.',
    videos: 12,
    followers: '5.1k',
    gradient: 'from-[#F8BBD0] to-[#ce6a6b]',
    initials: 'AJ',
    tag: 'Partner',
    tagColor: 'bg-[#4a919e]/15 text-[#4a919e]',
  },
  {
    id: 3,
    name: 'Rohan Mehta',
    role: 'Filmmaker',
    specialty: 'Short Films · Cinematography',
    bio: 'Every frame Rohan shoots carries the weight of silence and the urgency of truth. Cinema is his mother tongue.',
    videos: 6,
    followers: '3.7k',
    gradient: 'from-[#D1C4E9] to-[#7E57C2]',
    initials: 'RM',
    tag: null,
    tagColor: '',
  },
  {
    id: 4,
    name: 'Priya Das',
    role: 'Bharatanatyam Dancer',
    specialty: 'Classical Dance · Fusion',
    bio: 'Priya\'s feet speak before her lips do. A classical dancer bridging ancient rhythms with contemporary emotion.',
    videos: 9,
    followers: '4.2k',
    gradient: 'from-[#DCEDC8] to-[#C0E863]',
    initials: 'PD',
    tag: 'Trending',
    tagColor: 'bg-lime/30 text-navy',
  },
  {
    id: 5,
    name: 'Kabir Nair',
    role: 'Musician & Composer',
    specialty: 'Music · Sound Design',
    bio: 'Kabir builds sonic landscapes from silence. His compositions live in the space between breath and beat.',
    videos: 14,
    followers: '6.8k',
    gradient: 'from-[#FFE0B2] to-[#FF9800]',
    initials: 'KN',
    tag: 'Most Followed',
    tagColor: 'bg-[#FF9800]/15 text-[#e65100]',
  },
  {
    id: 6,
    name: 'Aisha Qureshi',
    role: 'Visual Artist & Storyteller',
    specialty: 'Visual Art · Documentary',
    bio: 'Aisha turns canvas and camera into confessionals. Her art makes the invisible impossible to ignore.',
    videos: 7,
    followers: '2.9k',
    gradient: 'from-[#FCE4EC] to-[#E91E63]',
    initials: 'AQ',
    tag: null,
    tagColor: '',
  },
  {
    id: 7,
    name: 'Ishaan Desai',
    role: 'Classical Musician',
    specialty: 'Hindustani · Fusion',
    bio: 'Trained in Hindustani classical music, Ishaan blends ragas with modern textures to create timeless soundscapes.',
    videos: 5,
    followers: '1.6k',
    gradient: 'from-[#FFF3E0] to-[#FFB300]',
    initials: 'ID',
    tag: 'New',
    tagColor: 'bg-primary/15 text-primary',
  },
  {
    id: 8,
    name: 'Sneha Pillai',
    role: 'Theatre Artist',
    specialty: 'Theatre · Monologue',
    bio: 'A stage is Sneha\'s home. Whether it\'s a packed auditorium or a corner of a café, she commands every space.',
    videos: 4,
    followers: '1.3k',
    gradient: 'from-[#CFD8DC] to-[#607D8B]',
    initials: 'SP',
    tag: null,
    tagColor: '',
  },
]

const specialties = ['All', 'Poetry', 'Spoken Word', 'Short Films', 'Dance', 'Music', 'Visual Art', 'Theatre', 'Storytelling']

const Artist = () => {
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = artists.filter((a) => {
    const matchesFilter = activeFilter === 'All' || a.specialty.toLowerCase().includes(activeFilter.toLowerCase())
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.specialty.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const featuredArtist = selected ? artists.find((a) => a.id === selected) : null

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-linear-to-br from-[#B2EBF2]/40 via-[#E0F7FA]/60 to-[#F1F8E9]">
      {/* Hero */}
      <div className="relative pt-20 pb-14 px-6 lg:px-20 text-center overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-lime/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-5">
          <span className="inline-block font-mono text-[10px] uppercase tracking-[0.5em] text-navy/40">Meet the</span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-navy leading-tight">
            The{' '}
            <span className="bg-linear-to-r from-primary to-lime bg-clip-text text-transparent">
              Artists
            </span>
          </h1>
          <p className="text-navy/55 text-base max-w-md mx-auto">
            Passionate, fearless, and unapologetically authentic. These are the souls behind the art.
          </p>
          <div className="relative max-w-sm mx-auto mt-2">
            <input
              type="text"
              placeholder="Search artists or art forms…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-primary/20 rounded-2xl px-5 py-3 pr-10 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:border-primary/60 shadow-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/30 text-sm">🔍</span>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-20 pb-24">
        <div className="max-w-[1200px] mx-auto">

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2.5 mb-10 justify-center">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setActiveFilter(spec)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeFilter === spec
                    ? 'bg-linear-to-r from-primary to-teal text-white shadow-md'
                    : 'bg-white border border-primary/20 text-navy/55 hover:border-primary/50 hover:text-navy'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Artist Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-navy/30 text-sm">No artists found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => setSelected(selected === artist.id ? null : artist.id)}
                  className={`group cursor-pointer bg-white rounded-3xl border overflow-hidden transition-all duration-300 shadow-md ${
                    selected === artist.id
                      ? 'border-primary shadow-xl shadow-primary/15 scale-[1.02]'
                      : 'border-black/5 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`relative h-32 bg-linear-to-br ${artist.gradient} flex items-center justify-center`}>
                    <span className="text-white font-black text-3xl opacity-80">{artist.initials}</span>
                    {artist.tag && (
                      <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${artist.tagColor}`}>
                        {artist.tag}
                      </span>
                    )}
                    {selected === artist.id && (
                      <div className="absolute inset-0 bg-navy/20 flex items-center justify-center">
                        <span className="text-white text-xl">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-navy text-base">{artist.name}</h3>
                    <p className="text-primary text-xs font-semibold mb-2">{artist.role}</p>
                    <p className="text-navy/50 text-xs leading-relaxed mb-4 line-clamp-2">{artist.bio}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-black/5">
                      <div className="text-center">
                        <p className="text-navy font-bold text-sm">{artist.videos}</p>
                        <p className="text-navy/35 text-[10px] font-mono uppercase">Videos</p>
                      </div>
                      <div className="w-px h-6 bg-black/5" />
                      <div className="text-center">
                        <p className="text-navy font-bold text-sm">{artist.followers}</p>
                        <p className="text-navy/35 text-[10px] font-mono uppercase">Followers</p>
                      </div>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-all duration-200"
                      >
                        Follow
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Artist Expanded View */}
          {featuredArtist && (
            <div className="mt-12 bg-white rounded-3xl border border-primary/20 shadow-xl overflow-hidden">
              <div className={`h-48 bg-linear-to-br ${featuredArtist.gradient} relative flex items-end px-10 pb-8`}>
                <div className="absolute inset-0 bg-navy/20" />
                <div className="relative z-10">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-3 bg-white/20 text-white`}>
                    {featuredArtist.specialty}
                  </span>
                  <h2 className="text-4xl font-black text-white tracking-tighter">{featuredArtist.name}</h2>
                  <p className="text-white/75 text-sm mt-1">{featuredArtist.role}</p>
                </div>
              </div>
              <div className="p-10">
                <p className="text-navy/65 text-base leading-relaxed max-w-2xl mb-8">{featuredArtist.bio}</p>
                <div className="flex flex-wrap gap-6 mb-8">
                  <div>
                    <p className="text-2xl font-black text-navy">{featuredArtist.videos}</p>
                    <p className="text-navy/35 text-xs font-mono uppercase">Published Videos</p>
                  </div>
                  <div className="w-px bg-black/5" />
                  <div>
                    <p className="text-2xl font-black text-navy">{featuredArtist.followers}</p>
                    <p className="text-navy/35 text-xs font-mono uppercase">Followers</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-2.5 rounded-2xl bg-linear-to-r from-primary to-teal text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all">
                    View All Videos
                  </button>
                  <button className="px-6 py-2.5 rounded-2xl border border-primary/30 text-primary font-bold text-sm hover:bg-primary/5 transition-all">
                    Follow Artist
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CTA for artists */}
          <div className="mt-16 text-center bg-navy rounded-3xl px-8 py-14 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-lime/15 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 max-w-lg mx-auto space-y-5">
              <span className="inline-block font-mono text-[10px] uppercase tracking-[0.5em] text-white/30">Are you an artist?</span>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                Ignite the Artist in <span className="text-lime">You</span>
              </h3>
              <p className="text-white/55 text-sm leading-relaxed">
                Arturee is your sky. Spread your wings, share your art, and earn from what you love.
              </p>
              <button className="px-8 py-3 rounded-2xl bg-lime text-navy font-bold text-sm hover:bg-yellow hover:shadow-lg transition-all duration-200">
                Join Us as an Artist
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
    </div>
  )
}

export default Artist