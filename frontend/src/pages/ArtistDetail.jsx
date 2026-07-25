import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, Calendar, Eye, Music, AlertCircle, Loader2 } from 'lucide-react'
import UserLayout from '../components/layout/UserLayout'
import { artistApi, videoApi } from '../api/index.js'

const C = {
  navy: '#051d2e',
  primary: '#4DD0E1',
  teal: '#00BCD4',
  lime: '#C0E863',
  muted: '#4a7080',
}

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

const ArtistDetail = () => {
  const navigate = useNavigate()
  const { artistId } = useParams()
  
  const [artist, setArtist] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!artistId) return
    setLoading(true)
    Promise.all([
      artistApi.getById(artistId),
      videoApi.list({ artistId, limit: 100 })
    ]).then(([artistRes, videoRes]) => {
      setArtist(artistRes.data.data)
      setVideos(videoRes.data.data.videos || [])
    }).catch(err => {
      setError(err.response?.data?.message || 'Artist not found')
    }).finally(() => setLoading(false))
  }, [artistId])

  // Aggregate reactions from all videos
  const aggregateReactions = () => {
    let totals = { party: 0, clap: 0, fire: 0, star: 0, heart: 0 }
    videos.forEach(v => {
      if (v.reactions) {
        totals.party += (v.reactions.party || 0)
        totals.clap += (v.reactions.clap || 0)
        totals.fire += (v.reactions.fire || 0)
        totals.star += (v.reactions.star || 0)
        totals.heart += (v.reactions.heart || 0)
      }
    })
    return totals
  }
  
  const totals = aggregateReactions()
  const totalEmoticons = Object.values(totals).reduce((sum, c) => sum + c, 0)

  const REACTION_TYPES = [
    { id: 'party', emoji: '🎉', count: totals.party },
    { id: 'clap', emoji: '👏', count: totals.clap },
    { id: 'fire', emoji: '🔥', count: totals.fire },
    { id: 'star', emoji: '⭐', count: totals.star },
    { id: 'heart', emoji: '❤️', count: totals.heart },
  ]

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-[#4DD0E1]" />
        </div>
      </UserLayout>
    )
  }

  if (error) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="w-12 h-12 mb-4" style={{ color: C.primary }} />
          <h1 className="text-2xl font-black mb-2" style={{ color: C.navy }}>Artist Unavailable</h1>
          <p className="text-sm mb-6" style={{ color: C.muted }}>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: C.navy }}
          >
            Go Back
          </button>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="min-h-screen px-4 sm:px-6 lg:px-14 py-6 md:py-8" style={{ background: 'linear-gradient(145deg,#eafcff,#f8ffed)' }}>
        <div className="max-w-screen-2xl mx-auto space-y-6 md:space-y-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition hover:bg-[rgba(77,208,225,0.15)]"
            style={{ color: C.navy }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <section className="rounded-3xl border overflow-hidden relative" style={{ borderColor: 'rgba(77,208,225,0.22)', boxShadow: '0 18px 40px rgba(5,29,46,0.1)' }}>
            <div className="absolute inset-0">
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#051d2e,#4a7080)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,29,46,0.95) 0%, rgba(5,29,46,0.5) 50%, transparent 100%)' }} />
            </div>
            
            <div className="relative pt-32 sm:pt-48 pb-6 md:pb-8 px-5 md:px-8 flex flex-col lg:flex-row lg:items-end gap-6 md:gap-8">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-5 md:gap-6 flex-1">
                <img
                  src={artist?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist?.name || '?')}&background=4DD0E1&color=051d2e&size=256`}
                  alt={artist?.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shrink-0 shadow-2xl"
                  style={{ border: '3px solid rgba(255,255,255,0.15)' }}
                />
                
                <div className="text-white">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
                    style={{ background: 'linear-gradient(135deg,rgba(77,208,225,0.95),rgba(192,232,99,0.9))', color: C.navy }}>
                    <Music className="w-3.5 h-3.5" /> FEATURED ARTIST
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">{artist?.name}</h1>
                  <p className="text-sm md:text-base text-gray-200 max-w-2xl mb-4">
                    {artist?.bio || 'An amazing artist on the platform.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                <div className="rounded-2xl p-4 min-w-[110px]" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <p className="text-[11px] uppercase font-bold tracking-wider text-gray-300 mb-1">Uploads</p>
                  <p className="text-2xl font-black text-white">{videos.length}</p>
                </div>
                <div className="rounded-2xl p-4 min-w-[140px]" style={{ background: 'rgba(192,232,99,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(192,232,99,0.2)' }}>
                  <p className="text-[11px] uppercase font-bold tracking-wider text-[#C0E863] mb-1">Total Emoticons</p>
                  <p className="text-2xl font-black text-white">{totalEmoticons.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.85)', borderColor: 'rgba(77,208,225,0.25)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-base md:text-lg font-black" style={{ color: C.navy }}>
                Reaction 
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {REACTION_TYPES.map((reaction) => (
                <div
                  key={reaction.id}
                  className="rounded-2xl p-3 flex sm:flex-col lg:flex-row items-center justify-between sm:justify-center lg:justify-between gap-2"
                  style={{ background: 'white', border: '1px solid rgba(77,208,225,0.22)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{reaction.emoji}</span>
                  </div>
                  <span className="text-base font-black" style={{ color: C.navy }}>{reaction.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.82)', borderColor: 'rgba(77,208,225,0.25)' }}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-xl md:text-3xl font-black tracking-tight" style={{ color: C.navy }}>
                All Videos
              </h2>
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider"
                style={{ color: C.teal }}>
                {videos.length} uploads
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {videos.map((video) => (
                <article
                  key={video._id}
                  className="group rounded-2xl overflow-hidden border cursor-pointer"
                  style={{ background: 'white', borderColor: 'rgba(77,208,225,0.2)', boxShadow: '0 8px 18px rgba(5,29,46,0.07)' }}
                  onClick={() => navigate(`/video/${video._id}`)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.title)}&background=4DD0E1&color=051d2e&size=512`}
                      alt={video.title}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300"
                      style={{ background: 'linear-gradient(to top,rgba(5,29,46,0.65),transparent)' }} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                      <span className="w-11 h-11 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>
                        <Play className="w-5 h-5 ml-0.5" style={{ color: C.navy }} fill={C.navy} />
                      </span>
                    </div>
                    {video.durationSeconds && (
                      <span className="absolute bottom-2 right-2 px-2 py-1 rounded text-[11px] font-semibold text-white"
                        style={{ background: 'rgba(5,29,46,0.82)' }}>
                        {fmtDuration(video.durationSeconds)}
                      </span>
                    )}
                    <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={video.price === 0
                        ? { background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: C.navy }
                        : { background: 'linear-gradient(135deg,#4DD0E1,#00BCD4)', color: '#fff' }}>
                      {video.price === 0 ? 'Free' : `₹${video.price}`}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-sm md:text-base line-clamp-2 mb-2" style={{ color: C.navy }}>
                      {video.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: C.muted }}>
                      <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{fmtViews(video.viewCount)}</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(video.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </article>
              ))}
              
              {videos.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No videos uploaded yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </UserLayout>
  )
}

export default ArtistDetail
