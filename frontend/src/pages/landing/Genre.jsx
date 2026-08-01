import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import { genreApi, videoApi, landingConfigApi } from '../../api'

const genreMetadataMap = {
  'story telling': {
    icon: '📖',
    gradient: 'from-[#FFF9C4] to-[#F9A825]',
    accent: '#F9A825',
    tag: 'Popular',
  },
  'poetry': {
    icon: '✍️',
    gradient: 'from-[#B2EBF2] to-[#4DD0E1]',
    accent: '#4DD0E1',
    tag: 'Most Loved',
  },
  'spoken word': {
    icon: '🎙️',
    gradient: 'from-[#F8BBD0] to-[#ce6a6b]',
    accent: '#ce6a6b',
    tag: 'Trending',
  },
  'ghazal': {
    icon: '🎶',
    gradient: 'from-[#D1C4E9] to-[#7E57C2]',
    accent: '#7E57C2',
    tag: 'Classic',
  },
  'social cause': {
    icon: '🌍',
    gradient: 'from-[#DCEDC8] to-[#C0E863]',
    accent: '#8bc34a',
    tag: 'Impact',
  },
  'short films': {
    icon: '🎬',
    gradient: 'from-[#D1C4E9] to-[#7E57C2]',
    accent: '#7E57C2',
    tag: null,
  },
  'dance': {
    icon: '💃',
    gradient: 'from-[#DCEDC8] to-[#C0E863]',
    accent: '#8bc34a',
    tag: 'New',
  },
  'music': {
    icon: '🎵',
    gradient: 'from-[#FFE0B2] to-[#FF9800]',
    accent: '#FF9800',
    tag: 'Popular',
  },
  'visual art': {
    icon: '🎨',
    gradient: 'from-[#FCE4EC] to-[#E91E63]',
    accent: '#E91E63',
    tag: null,
  },
  'theatre': {
    icon: '🎭',
    gradient: 'from-[#CFD8DC] to-[#455A64]',
    accent: '#607D8B',
    tag: 'Exclusive',
  },
}

const fallbackGradients = [
  { icon: '✨', gradient: 'from-[#B2EBF2] to-[#4DD0E1]', accent: '#4DD0E1' },
  { icon: '🌟', gradient: 'from-[#F8BBD0] to-[#ce6a6b]', accent: '#ce6a6b' },
  { icon: '🔥', gradient: 'from-[#D1C4E9] to-[#7E57C2]', accent: '#7E57C2' },
  { icon: '🎭', gradient: 'from-[#DCEDC8] to-[#C0E863]', accent: '#8bc34a' },
  { icon: '🎨', gradient: 'from-[#FFE0B2] to-[#FF9800]', accent: '#FF9800' },
]

const getGenreMeta = (genre, idx, isAdminFeatured) => {
  const key = (genre.name || '').trim().toLowerCase()
  const meta =
    genreMetadataMap[key] || fallbackGradients[idx % fallbackGradients.length]
  return {
    icon: meta.icon || '🎨',
    gradient: meta.gradient || 'from-[#B2EBF2] to-[#4DD0E1]',
    accent: meta.accent || '#4DD0E1',
    tag: isAdminFeatured ? 'Featured ⭐' : meta.tag || null,
  }
}

const fmtDuration = (secs) => {
  if (!secs) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

const Genre = () => {
  const [genres, setGenres] = useState([])
  const [videos, setVideos] = useState([])
  const [landingConfig, setLandingConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [genreRes, videoRes, configRes] = await Promise.all([
          genreApi.list(),
          videoApi.list({ limit: 100 }),
          landingConfigApi.get().catch(() => null),
        ])
        if (!isMounted) return

        const genreList = Array.isArray(genreRes.data?.data)
          ? genreRes.data.data
          : genreRes.data?.data?.genres || []

        const videoList = Array.isArray(videoRes.data?.data)
          ? videoRes.data.data
          : videoRes.data?.data?.videos || []

        const cfg = configRes?.data?.data || null

        setGenres(genreList)
        setVideos(videoList)
        setLandingConfig(cfg)
      } catch (err) {
        console.error('Failed to fetch genres or videos:', err)
        if (isMounted) {
          setError(
            'Unable to load genres at the moment. Please check your connection and try again.'
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredGenres = useMemo(() => {
    const list = genres.filter(
      (g) =>
        g.name?.toLowerCase().includes(search.toLowerCase()) ||
        g.description?.toLowerCase().includes(search.toLowerCase())
    )

    const featuredIds = (landingConfig?.genrePage?.featuredGenres || []).map(
      (g) => g._id || g
    )

    // Sort featured genres first
    return [...list].sort((a, b) => {
      const aFeatured = featuredIds.includes(a._id || a.id) ? 1 : 0
      const bFeatured = featuredIds.includes(b._id || b.id) ? 1 : 0
      return bFeatured - aFeatured
    })
  }, [genres, search, landingConfig])

  const activeGenre = useMemo(() => {
    if (!selected) return null
    return genres.find((g) => (g._id || g.id) === selected) || null
  }, [selected, genres])

  const filteredVideos = useMemo(() => {
    if (!selected) return videos
    return videos.filter((v) => {
      const gId = v.genre?._id || v.genre
      return gId === selected
    })
  }, [selected, videos])

  const getGenreVideoCount = (genreId) => {
    return videos.filter((v) => (v.genre?._id || v.genre) === genreId).length
  }

  const pageHeadline = landingConfig?.genrePage?.headline || 'Explore by Genre'
  const pageSubheadline =
    landingConfig?.genrePage?.subheadline ||
    'Passionate, fearless, and unapologetically authentic.'

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9]">
        {/* Hero */}
        <div className="relative pt-20 pb-14 px-6 lg:px-20 text-center overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-lime/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <span className="inline-block font-mono text-[10px] uppercase tracking-[0.5em] text-navy/40">
              Browse by
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-navy leading-tight">
              {pageHeadline.includes(' ') ? (
                <>
                  {pageHeadline.split(' ').slice(0, -1).join(' ')}{' '}
                  <span className="bg-linear-to-r from-primary to-lime bg-clip-text text-transparent">
                    {pageHeadline.split(' ').slice(-1)[0]}
                  </span>
                </>
              ) : (
                <span className="bg-linear-to-r from-primary to-lime bg-clip-text text-transparent">
                  {pageHeadline}
                </span>
              )}
            </h1>
            <p className="text-navy/55 text-base max-w-md mx-auto">
              {pageSubheadline}
            </p>
            <div className="relative max-w-sm mx-auto mt-2">
              <input
                type="text"
                placeholder="Search genres or themes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-primary/20 rounded-2xl px-5 py-3 pr-10 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:border-primary/60 shadow-sm transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/30 text-sm">
                🔍
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 lg:px-20 pb-24">
          <div className="max-w-[1200px] mx-auto">
            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-navy/50">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium">Loading genres…</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-3xl border border-red-300 max-w-md mx-auto p-8 shadow-sm">
                <p className="text-red-500 font-semibold mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Try Again
                </button>
              </div>
            ) : filteredGenres.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-3xl border border-primary/10">
                <p className="text-navy/50 text-base font-medium">
                  No genres found matching your search.
                </p>
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 px-5 py-2 rounded-xl bg-navy text-white text-xs font-bold hover:bg-primary transition-all"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              /* Genre Cards Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-16">
                {filteredGenres.map((genre, idx) => {
                  const genreId = genre._id || genre.id
                  const isSelected = selected === genreId
                  const isFeatured = (
                    landingConfig?.genrePage?.featuredGenres || []
                  )
                    .map((g) => g._id || g)
                    .includes(genreId)
                  const meta = getGenreMeta(genre, idx, isFeatured)
                  const count = getGenreVideoCount(genreId)

                  return (
                    <button
                      key={genreId}
                      onClick={() =>
                        setSelected(isSelected ? null : genreId)
                      }
                      className={`group relative text-left rounded-3xl overflow-hidden p-6 transition-all duration-300 border ${
                        isSelected
                          ? 'ring-2 ring-offset-2 scale-[1.03] shadow-2xl border-transparent'
                          : 'border-white/60 hover:scale-[1.02] hover:shadow-xl shadow-md bg-white/60 backdrop-blur-xs'
                      }`}
                      style={
                        isSelected ? { ringColor: meta.accent } : {}
                      }
                    >
                      <div
                        className={`absolute inset-0 bg-linear-to-br ${
                          meta.gradient
                        } transition-opacity duration-300 ${
                          isSelected
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-20'
                        }`}
                      />
                      <div className="relative z-10">
                        {meta.tag && (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-3 shadow-xs ${
                              isSelected
                                ? 'bg-white/30 text-white'
                                : isFeatured
                                ? 'bg-[#FF9800]/20 text-[#e65100]'
                                : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {meta.tag}
                          </span>
                        )}
                        <div className="text-3xl mb-3">{meta.icon}</div>
                        <h3
                          className={`font-bold text-lg leading-tight mb-1 ${
                            isSelected ? 'text-white' : 'text-navy'
                          }`}
                        >
                          {genre.name}
                        </h3>
                        <p
                          className={`text-xs leading-relaxed mb-4 line-clamp-2 ${
                            isSelected
                              ? 'text-white/80'
                              : 'text-navy/50'
                          }`}
                        >
                          {genre.description ||
                            'Explore curated stories and art in this genre.'}
                        </p>
                        <span
                          className={`font-mono text-[10px] uppercase tracking-widest ${
                            isSelected
                              ? 'text-white/70'
                              : 'text-navy/35 font-semibold'
                          }`}
                        >
                          {count} {count === 1 ? 'video' : 'videos'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Videos Section */}
            {!loading && !error && (
              <div>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter text-navy">
                      {activeGenre ? activeGenre.name : 'All Genres'}
                    </h2>
                    <p className="text-navy/55 text-sm mt-1">
                      {activeGenre
                        ? activeGenre.description ||
                          'Hand-picked performances across this genre'
                        : 'Hand-picked across every art form'}
                    </p>
                  </div>
                  {selected && (
                    <button
                      onClick={() => setSelected(null)}
                      className="text-sm font-semibold text-navy/50 hover:text-navy flex items-center gap-1.5 transition-colors"
                    >
                      ← All genres
                    </button>
                  )}
                </div>

                {filteredVideos.length === 0 ? (
                  <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-primary/15 shadow-sm">
                    <p className="text-navy/50 text-base font-medium">
                      No videos available in{' '}
                      {activeGenre ? activeGenre.name : 'this genre'} yet.
                    </p>
                    <p className="text-navy/35 text-xs mt-1">
                      Check back soon for upcoming performances and releases!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {filteredVideos.map((video, idx) => {
                      const videoId = video._id || video.id
                      const artistName =
                        video.artistId?.name || video.artist || 'Artist'
                      const gradient =
                        fallbackGradients[idx % fallbackGradients.length]
                          .gradient

                      return (
                        <Link
                          to={`/video/${videoId}`}
                          key={videoId}
                          className="group cursor-pointer block bg-white/70 rounded-2xl p-2 border border-white hover:shadow-xl transition-all duration-300"
                        >
                          <div
                            className="relative rounded-xl overflow-hidden mb-3 shadow-md"
                            style={{ aspectRatio: '16/9' }}
                          >
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div
                                className={`w-full h-full bg-linear-to-br ${gradient} flex items-center justify-center`}
                              >
                                <span className="text-white/70 text-4xl group-hover:scale-110 transition-transform duration-300">
                                  ▶
                                </span>
                              </div>
                            )}
                            {video.durationSeconds > 0 && (
                              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs rounded text-[11px] text-white font-mono font-bold">
                                {fmtDuration(video.durationSeconds)}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-navy/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                              <span className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center text-white text-sm font-bold">
                                ▶
                              </span>
                            </div>
                          </div>
                          <div className="px-1 pb-1">
                            <h4 className="font-semibold text-navy text-sm truncate">
                              {video.title}
                            </h4>
                            <p className="text-navy/50 text-xs mt-0.5 truncate">
                              {artistName} • {video.viewCount || 0} views
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Genre
