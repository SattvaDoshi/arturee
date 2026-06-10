import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Calendar, Eye, Music, Users } from 'lucide-react'
import UserLayout from '../components/layout/UserLayout'

const C = {
  navy: '#051d2e',
  primary: '#4DD0E1',
  teal: '#00BCD4',
  lime: '#C0E863',
  muted: '#4a7080',
}

const ARTIST_VIDEOS = [
  {
    title: 'Jazz Night Sessions',
    thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=675&fit=crop',
    duration: '1:24:35',
    views: '2.4M views',
    date: 'Dec 15, 2024',
    price: 'Free',
    free: true,
  },
  {
    title: 'Acoustic Sessions Vol. 2',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=675&fit=crop',
    duration: '52:18',
    views: '1.2M views',
    date: 'Nov 30, 2024',
    price: '$6.99',
  },
  {
    title: 'Behind the Music: My Journey',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=675&fit=crop',
    duration: '38:45',
    views: '890K views',
    date: 'Oct 22, 2024',
    price: '$4.99',
  },
  {
    title: 'Summer Jazz Festival 2024',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&h=675&fit=crop',
    duration: '1:15:22',
    views: '2.1M views',
    date: 'Aug 14, 2024',
    price: 'Free',
    free: true,
  },
  {
    title: 'Midnight Reflections EP',
    thumbnail: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=675&fit=crop',
    duration: '44:30',
    views: '650K views',
    date: 'Sep 01, 2024',
    price: '$5.99',
  },
  {
    title: 'Live in Brooklyn: Session One',
    thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&h=675&fit=crop',
    duration: '47:12',
    views: '730K views',
    date: 'Jul 12, 2024',
    price: '$3.99',
  },
  {
    title: 'Blue Hour Improvisations',
    thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=1200&h=675&fit=crop',
    duration: '35:06',
    views: '540K views',
    date: 'Jun 25, 2024',
    price: '$2.99',
  },
  {
    title: 'Night Train: Studio Cut',
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=675&fit=crop',
    duration: '29:58',
    views: '420K views',
    date: 'May 18, 2024',
    price: '$2.49',
  },
]

const ARTIST_REACTIONS = [
  { id: 'heart', emoji: '❤️', label: 'Love', count: 1264 },
  { id: 'party', emoji: '🎉', label: 'Party', count: 842 },
  { id: 'fire', emoji: '👏', label: 'Clap', count: 663 },
  { id: 'wow', emoji: '😍', label: 'Wow', count: 579 },
  { id: 'star', emoji: '⭐', label: 'Star', count: 932 },
]

const ArtistDetail = () => {
  const navigate = useNavigate()
  const totalEmoticons = ARTIST_REACTIONS.reduce((sum, reaction) => sum + reaction.count, 0)

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
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1800&h=700&fit=crop"
                alt="Marcus Cole background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,29,46,0.95) 0%, rgba(5,29,46,0.5) 50%, transparent 100%)' }} />
            </div>
            
            <div className="relative pt-32 sm:pt-48 pb-6 md:pb-8 px-5 md:px-8 flex flex-col lg:flex-row lg:items-end gap-6 md:gap-8">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-5 md:gap-6 flex-1">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop"
                  alt="Marcus Cole profile"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shrink-0 shadow-2xl"
                  style={{ border: '3px solid rgba(255,255,255,0.15)' }}
                />
                
                <div className="text-white">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
                    style={{ background: 'linear-gradient(135deg,rgba(77,208,225,0.95),rgba(192,232,99,0.9))', color: C.navy }}>
                    <Music className="w-3.5 h-3.5" /> FEATURED ARTIST
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Marcus Cole</h1>
                  <p className="text-sm md:text-base text-gray-200 max-w-2xl mb-4">
                    Jazz composer and live performer creating immersive studio sessions and soulful improvisations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                <div className="rounded-2xl p-4 min-w-[110px]" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <p className="text-[11px] uppercase font-bold tracking-wider text-gray-300 mb-1">Uploads</p>
                  <p className="text-2xl font-black text-white">{ARTIST_VIDEOS.length}</p>
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
              {ARTIST_REACTIONS.map((reaction) => (
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
                {ARTIST_VIDEOS.length} uploads
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {ARTIST_VIDEOS.map((video) => (
                <article
                  key={video.title}
                  className="group rounded-2xl overflow-hidden border cursor-pointer"
                  style={{ background: 'white', borderColor: 'rgba(77,208,225,0.2)', boxShadow: '0 8px 18px rgba(5,29,46,0.07)' }}
                  onClick={() => navigate('/video')}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
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
                    <span className="absolute bottom-2 right-2 px-2 py-1 rounded text-[11px] font-semibold text-white"
                      style={{ background: 'rgba(5,29,46,0.82)' }}>
                      {video.duration}
                    </span>
                    <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={video.free
                        ? { background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: C.navy }
                        : { background: 'linear-gradient(135deg,#4DD0E1,#00BCD4)', color: '#fff' }}>
                      {video.price}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-sm md:text-base line-clamp-2 mb-2" style={{ color: C.navy }}>
                      {video.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: C.muted }}>
                      <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{video.views}</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{video.date}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </UserLayout>
  )
}

export default ArtistDetail
