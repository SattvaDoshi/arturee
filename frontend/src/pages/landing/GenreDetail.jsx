import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import { genreApi, videoApi } from '../../api'
import { ArrowLeft } from 'lucide-react'

const genreMetadataMap = {
  'story telling': { icon: '📖', gradient: 'from-[#FFF9C4] to-[#F9A825]', accent: '#F9A825' },
  'poetry': { icon: '✍️', gradient: 'from-[#B2EBF2] to-[#4DD0E1]', accent: '#4DD0E1' },
  'spoken word': { icon: '🎙️', gradient: 'from-[#F8BBD0] to-[#ce6a6b]', accent: '#ce6a6b' },
  'ghazal': { icon: '🎶', gradient: 'from-[#D1C4E9] to-[#7E57C2]', accent: '#7E57C2' },
  'social cause': { icon: '🌍', gradient: 'from-[#DCEDC8] to-[#C0E863]', accent: '#8bc34a' },
  'short films': { icon: '🎬', gradient: 'from-[#D1C4E9] to-[#7E57C2]', accent: '#7E57C2' },
  'dance': { icon: '💃', gradient: 'from-[#DCEDC8] to-[#C0E863]', accent: '#8bc34a' },
  'music': { icon: '🎵', gradient: 'from-[#FFE0B2] to-[#FF9800]', accent: '#FF9800' },
  'visual art': { icon: '🎨', gradient: 'from-[#FCE4EC] to-[#E91E63]', accent: '#E91E63' },
  'theatre': { icon: '🎭', gradient: 'from-[#CFD8DC] to-[#455A64]', accent: '#607D8B' },
}

const fallbackGradients = [
  { icon: '✨', gradient: 'from-[#B2EBF2] to-[#4DD0E1]', accent: '#4DD0E1' },
  { icon: '🌟', gradient: 'from-[#F8BBD0] to-[#ce6a6b]', accent: '#ce6a6b' },
  { icon: '🔥', gradient: 'from-[#D1C4E9] to-[#7E57C2]', accent: '#7E57C2' },
  { icon: '🎭', gradient: 'from-[#DCEDC8] to-[#C0E863]', accent: '#8bc34a' },
  { icon: '🎨', gradient: 'from-[#FFE0B2] to-[#FF9800]', accent: '#FF9800' },
]

const getGenreMeta = (genre) => {
  const key = (genre.name || '').trim().toLowerCase()
  return genreMetadataMap[key] || fallbackGradients[0]
}

const fmtDuration = (secs) => {
  if (!secs) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

const GenreDetail = () => {
  const { genreId } = useParams()
  const navigate = useNavigate()
  
  const [genre, setGenre] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [genreRes, videoRes] = await Promise.all([
          genreApi.list(),
          videoApi.list({ limit: 100 }),
        ])
        
        if (!isMounted) return

        const genreList = Array.isArray(genreRes.data?.data)
          ? genreRes.data.data
          : genreRes.data?.data?.genres || []

        const currentGenre = genreList.find(g => (g._id || g.id) === genreId)
        
        if (!currentGenre) {
          setError('Genre not found.')
          return
        }
        
        setGenre(currentGenre)

        const videoList = Array.isArray(videoRes.data?.data)
          ? videoRes.data.data
          : videoRes.data?.data?.videos || []

        const filtered = videoList.filter(v => (v.genre?._id || v.genre) === genreId)
        setVideos(filtered)

      } catch (err) {
        console.error('Failed to fetch genre details:', err)
        if (isMounted) {
          setError('Unable to load genre details at the moment.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [genreId])

  const { state } = useLocation()
  const fromDashboard = state?.fromDashboard

  if (loading) {
    return (
      <div>
        {!fromDashboard && <Navbar />}
        <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !genre) {
    return (
      <div>
        {!fromDashboard && <Navbar />}
        <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9] pt-32 px-6">
          <div className="max-w-md mx-auto text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm">
            <p className="text-red-500 font-semibold mb-4">{error || 'Genre not found.'}</p>
            <button
              onClick={() => navigate('/genres')}
              className="px-6 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Back to Genres
            </button>
          </div>
        </div>
      </div>
    )
  }

  const meta = getGenreMeta(genre)

  return (
    <div>
      {!fromDashboard && <Navbar />}
      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #E0F7FA 0%, #B2EBF2 50%, #F1F8E9 100%)' }}>

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #051d2e 0%, #0a3347 60%, #051d2e 100%)' }}>
          {/* Glowing blobs */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${meta.accent}40 0%, transparent 70%)` }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(77,208,225,0.15) 0%, transparent 70%)' }} />

          <div className={`relative z-10 max-w-[1200px] mx-auto px-6 lg:px-20 ${fromDashboard ? 'pt-8 md:pt-12' : 'pt-24 md:pt-32'} pb-14`}>
            {/* Back Button */}
            <button
              onClick={() => navigate(fromDashboard ? '/dashboard' : '/genres')}
              className="flex items-center gap-2 mb-8 text-white/60 hover:text-white transition text-sm font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {fromDashboard ? 'Back to Dashboard' : 'All Genres'}
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              {/* Icon */}
              <div className="text-7xl shrink-0 select-none" style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.4))' }}>
                {meta.icon}
              </div>

              {/* Text */}
              <div className="text-center sm:text-left">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-3">
                  <span className={`bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}>
                    {genre.name}
                  </span>
                </h1>
                <p className="text-white/55 text-base max-w-xl font-medium leading-relaxed">
                  {genre.description || 'Explore curated stories and art in this genre.'}
                </p>
                <span
                  className="inline-block mt-4 font-mono text-xs uppercase tracking-widest font-bold px-4 py-1.5 rounded-full border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.08)', color: meta.accent }}
                >
                  {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Videos Grid ── */}
        <div className="px-6 lg:px-20 py-12 max-w-[1200px] mx-auto">
          {videos.length === 0 ? (
            <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-[#4DD0E1]/20 shadow-sm">
              <p className="text-[#051d2e]/50 text-base font-medium">No videos available in {genre.name} yet.</p>
              <p className="text-[#051d2e]/35 text-xs mt-1">Check back soon for upcoming performances!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video, idx) => {
                const videoId = video._id || video.id
                const artistName = video.artistId?.name || video.artist || 'Artist'
                const gradient = fallbackGradients[idx % fallbackGradients.length].gradient

                return (
                  <Link
                    to={`/video/${videoId}`}
                    key={videoId}
                    className="group cursor-pointer block rounded-2xl overflow-hidden border border-white/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <span className="text-white/70 text-4xl group-hover:scale-110 transition-transform duration-300">▶</span>
                        </div>
                      )}
                      {/* Duration */}
                      {video.durationSeconds > 0 && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-[11px] text-white font-mono font-bold">
                          {fmtDuration(video.durationSeconds)}
                        </div>
                      )}
                      {/* Price Badge */}
                      <div className="absolute top-2 left-2">
                        {video.price > 0 ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white shadow" style={{ background: 'linear-gradient(135deg,#051d2e,#0a3347)' }}>
                            Rs. {video.discountedPrice || video.price}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black text-[#051d2e] shadow" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>
                            Free
                          </span>
                        )}
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-[#051d2e]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold border border-white/30">▶</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-black text-[#051d2e] text-sm line-clamp-1 mb-0.5 group-hover:text-[#4DD0E1] transition-colors">
                        {video.title}
                      </h4>
                      <p className="text-[#051d2e]/55 text-xs truncate font-medium">{artistName}</p>
                      <p className="text-[#051d2e]/35 text-[10px] uppercase font-mono tracking-wider mt-1.5">{video.viewCount || 0} views</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GenreDetail
