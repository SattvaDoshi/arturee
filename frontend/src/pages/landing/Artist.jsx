import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import { useArtistModal } from '../../context/ArtistModalContext'
import { artistApi, genreApi, landingConfigApi } from '../../api'

const gradients = [
  'from-[#00838F] to-[#4DD0E1]',
  'from-[#AD1457] to-[#F8BBD0]',
  'from-[#4527A0] to-[#D1C4E9]',
  'from-[#558B2F] to-[#C0E863]',
  'from-[#E65100] to-[#FF9800]',
  'from-[#880E4F] to-[#E91E63]',
  'from-[#FF8F00] to-[#FFB300]',
  'from-[#37474F] to-[#607D8B]',
]

const tagColorMap = {
  orange: 'bg-[#FF9800]/20 text-[#e65100]',
  red: 'bg-[#ce6a6b]/20 text-[#ce6a6b]',
  lime: 'bg-lime/40 text-navy font-extrabold',
  teal: 'bg-primary/20 text-primary',
  purple: 'bg-[#7E57C2]/20 text-[#7E57C2]',
  blue: 'bg-blue-500/20 text-blue-700',
  default: 'bg-white/30 text-navy',
}

const getGradient = (index) => gradients[index % gradients.length]

const getInitials = (name) => {
  if (!name) return 'A'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const getArtistTag = (artist, index, customTag, customColor) => {
  if (customTag && customTag.trim()) {
    const colorClass = tagColorMap[customColor] || tagColorMap.orange
    return { tag: customTag, tagColor: colorClass }
  }
  if (artist?.isVerified && index === 0) {
    return { tag: 'Featured', tagColor: 'bg-[#FF9800]/20 text-[#e65100]' }
  }
  if ((artist?.emoticonCount || artist?.followerCount || 0) >= 300) {
    return { tag: 'Most Loved ❤️', tagColor: 'bg-[#ce6a6b]/20 text-[#ce6a6b]' }
  }
  if ((artist?.videoCount || 0) >= 3) {
    return { tag: 'Trending', tagColor: 'bg-lime/40 text-navy font-extrabold' }
  }
  if (artist?.isVerified) {
    return { tag: 'Verified', tagColor: 'bg-primary/20 text-primary' }
  }
  return null
}

const Artist = () => {
  const [artists, setArtists] = useState([])
  const [genres, setGenres] = useState([])
  const [landingConfig, setLandingConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [reactedIds, setReactedIds] = useState({})

  const { openModal } = useArtistModal()

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [artistRes, genreRes, configRes] = await Promise.all([
          artistApi.list({ limit: 100 }),
          genreApi.list(),
          landingConfigApi.get().catch(() => null),
        ])
        if (!isMounted) return

        const artistList = Array.isArray(artistRes.data?.data)
          ? artistRes.data.data
          : artistRes.data?.data?.artists || []

        const genreList = Array.isArray(genreRes.data?.data)
          ? genreRes.data.data
          : genreRes.data?.data?.genres || []

        const cfg = configRes?.data?.data || null

        setArtists(artistList)
        setGenres(genreList)
        setLandingConfig(cfg)
      } catch (err) {
        console.error('Failed to fetch artists or genres:', err)
        if (isMounted) {
          setError(
            'Unable to load artists at the moment. Please check your connection and try again.'
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

  const specialties = useMemo(() => {
    const genreSet = new Set(['All'])
    genres.forEach((g) => {
      if (g.name) genreSet.add(g.name)
    })
    artists.forEach((a) => {
      if (a.genre) genreSet.add(a.genre)
    })
    return Array.from(genreSet)
  }, [genres, artists])

  const filtered = useMemo(() => {
    return artists.filter((a) => {
      const artistGenre = a.genre || ''
      const matchesFilter =
        activeFilter === 'All' ||
        artistGenre.toLowerCase().includes(activeFilter.toLowerCase())
      const matchesSearch =
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        artistGenre.toLowerCase().includes(search.toLowerCase()) ||
        a.bio?.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [artists, activeFilter, search])

  // Admin Configured Artist Cards (up to 8 cards)
  const displayCards = useMemo(() => {
    const configuredCards = landingConfig?.artistPage?.artistCards || []
    if (configuredCards.length > 0 && activeFilter === 'All' && !search) {
      const mapped = configuredCards
        .map((c) => {
          const artistObj =
            typeof c.artistId === 'object' && c.artistId?._id
              ? c.artistId
              : artists.find((a) => (a._id || a.id) === c.artistId)
          if (!artistObj) return null
          return {
            artist: artistObj,
            tag: c.tag,
            tagColor: c.tagColor,
          }
        })
        .filter(Boolean)
      if (mapped.length > 0) return mapped
    }

    // Fallback to filtered artists (max 8)
    return filtered.slice(0, 8).map((a) => ({
      artist: a,
      tag: null,
      tagColor: null,
    }))
  }, [landingConfig, artists, filtered, activeFilter, search])

  const featuredArtist = useMemo(() => {
    if (selected) {
      return artists.find((a) => (a._id || a.id) === selected) || null
    }
    const adminFeaturedId =
      landingConfig?.artistPage?.featuredArtistId?._id ||
      landingConfig?.artistPage?.featuredArtistId
    if (adminFeaturedId) {
      return artists.find((a) => (a._id || a.id) === adminFeaturedId) || null
    }
    return displayCards[0]?.artist || null
  }, [selected, artists, landingConfig, displayCards])

  const handleEmoticonReact = (id, e) => {
    if (e) e.stopPropagation()
    setReactedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const pageHeadline = landingConfig?.artistPage?.headline || 'The Artists'
  const pageSubheadline =
    landingConfig?.artistPage?.subheadline ||
    'Every art form tells a different story. Find yours.'
  const ctaTitle =
    landingConfig?.artistPage?.ctaTitle || 'Ignite the Artist in You'
  const ctaText =
    landingConfig?.artistPage?.ctaText ||
    'Arturee is your sky. Spread your wings, share your art, and earn from what you love.'

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9]">
        {/* Hero */}
        <div className="relative pt-20 pb-14 px-6 lg:px-20 text-center overflow-hidden">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-lime/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <span className="inline-block font-mono text-[10px] uppercase tracking-[0.5em] text-navy/40">
              Meet the
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
                placeholder="Search artists, bios or art forms…"
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
            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2.5 mb-10 justify-center">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setActiveFilter(spec)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeFilter === spec
                      ? 'bg-linear-to-r from-primary to-teal text-white shadow-md scale-105'
                      : 'bg-white border border-primary/20 text-navy/55 hover:border-primary/50 hover:text-navy'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-navy/50">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium">
                  Loading artists from studio…
                </p>
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
            ) : displayCards.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-3xl border border-primary/10">
                <p className="text-navy/50 text-base font-medium">
                  No artists found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setActiveFilter('All')
                    setSearch('')
                  }}
                  className="mt-4 px-5 py-2 rounded-xl bg-navy text-white text-xs font-bold hover:bg-primary transition-all"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* Artist Grid (Max 8 cards configurable from backend) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayCards.map(({ artist, tag, tagColor }, index) => {
                  const artistId = artist._id || artist.id
                  const isSelected = selected === artistId
                  const tagData = getArtistTag(
                    artist,
                    index,
                    tag,
                    tagColor
                  )
                  const gradient = getGradient(index)
                  const isValidImg =
                    artist.avatarUrl &&
                    artist.avatarUrl.startsWith('http') &&
                    !artist.avatarUrl.includes('drive.google.com')

                  const baseEmoticons =
                    artist.emoticonCount || artist.followerCount || 0
                  const isLoved = reactedIds[artistId]
                  const emoticonsTotal = baseEmoticons + (isLoved ? 1 : 0)

                  return (
                    <div
                      key={artistId}
                      onClick={() =>
                        setSelected(isSelected ? null : artistId)
                      }
                      className={`group cursor-pointer bg-white rounded-3xl border overflow-hidden transition-all duration-300 shadow-md block ${
                        isSelected
                          ? 'border-primary shadow-xl shadow-primary/15 scale-[1.02]'
                          : 'border-black/5 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1'
                      }`}
                    >
                      {/* Avatar / Top Banner */}
                      <div
                        className={`relative h-36 bg-linear-to-br ${gradient} flex items-center justify-center overflow-hidden`}
                      >
                        {isValidImg ? (
                          <img
                            src={artist.avatarUrl}
                            alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-white font-black text-4xl opacity-90 tracking-wider">
                            {getInitials(artist.name)}
                          </span>
                        )}

                        {tagData && (
                          <span
                            className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${tagData.tagColor}`}
                          >
                            {tagData.tag}
                          </span>
                        )}

                        {isSelected && (
                          <div className="absolute inset-0 bg-navy/30 backdrop-blur-[1px] flex items-center justify-center transition-opacity">
                            <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold shadow-md">
                              ✓
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col justify-between h-[180px]">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="font-bold text-navy text-base truncate">
                              {artist.name}
                            </h3>
                            {artist.isVerified && (
                              <span
                                className="text-primary text-xs"
                                title="Verified Artist"
                              >
                                ★
                              </span>
                            )}
                          </div>
                          <p className="text-primary text-xs font-semibold mb-2">
                            {artist.genre || 'Story Telling'}
                          </p>
                          <p className="text-navy/55 text-xs leading-relaxed line-clamp-2">
                            {artist.bio ||
                              'Spoken word artist and performer exploring life through poetry and stories.'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-black/5 mt-auto">
                          <div className="text-center">
                            <p className="text-navy font-bold text-sm">
                              {artist.videoCount ?? 0}
                            </p>
                            <p className="text-navy/35 text-[10px] font-mono uppercase">
                              Videos
                            </p>
                          </div>
                          <div className="w-px h-6 bg-black/5" />
                          <div className="text-center">
                            <p className="text-navy font-bold text-sm">
                              {emoticonsTotal}
                            </p>
                            <p className="text-navy/35 text-[10px] font-mono uppercase">
                              Emoticons ❤️🔥
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleEmoticonReact(artistId, e)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                              isLoved
                                ? 'bg-red-500 text-white shadow-xs'
                                : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                            }`}
                          >
                            <span>❤️</span>
                            <span>{isLoved ? 'Loved' : 'Love'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Selected / Featured Artist Expanded View */}
            {featuredArtist && (
              <div className="mt-12 bg-white rounded-3xl border border-primary/20 shadow-xl overflow-hidden animate-in fade-in duration-300">
                <div
                  className={`h-48 bg-linear-to-br ${getGradient(
                    artists.findIndex(
                      (a) =>
                        (a._id || a.id) ===
                        (featuredArtist._id || featuredArtist.id)
                    )
                  )} relative flex items-end px-10 pb-8`}
                >
                  <div className="absolute inset-0 bg-navy/30" />
                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-3 bg-white/20 text-white backdrop-blur-xs">
                      {featuredArtist.genre || 'Story Telling'}
                    </span>
                    <h2 className="text-4xl font-black text-white tracking-tighter">
                      {featuredArtist.name}
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      {featuredArtist.isVerified ? 'Verified Creator • ' : ''}
                      {featuredArtist.genre || 'Storytelling & Poetry'}
                    </p>
                  </div>
                </div>
                <div className="p-10">
                  <p className="text-navy/70 text-base leading-relaxed max-w-3xl mb-8 whitespace-pre-line">
                    {featuredArtist.bio ||
                      'An inspiring creator bringing unique stories and performances to life.'}
                  </p>
                  <div className="flex flex-wrap gap-8 mb-8">
                    <div>
                      <p className="text-2xl font-black text-navy">
                        {featuredArtist.videoCount ?? 0}
                      </p>
                      <p className="text-navy/40 text-xs font-mono uppercase">
                        Published Videos
                      </p>
                    </div>
                    <div className="w-px bg-black/10" />
                    <div>
                      <p className="text-2xl font-black text-navy">
                        {(featuredArtist.emoticonCount ||
                          featuredArtist.followerCount ||
                          0) +
                          (reactedIds[
                            featuredArtist._id || featuredArtist.id
                          ]
                            ? 1
                            : 0)}
                      </p>
                      <p className="text-navy/40 text-xs font-mono uppercase">
                        Emoticons ❤️🔥⭐
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={`/artist/${
                        featuredArtist._id || featuredArtist.id
                      }`}
                      className="px-6 py-2.5 rounded-2xl bg-linear-to-r from-primary to-teal text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all inline-block"
                    >
                      View Profile & Videos
                    </Link>
                    <button
                      onClick={() =>
                        handleEmoticonReact(
                          featuredArtist._id || featuredArtist.id
                        )
                      }
                      className={`px-6 py-2.5 rounded-2xl border font-bold text-sm transition-all flex items-center gap-2 ${
                        reactedIds[featuredArtist._id || featuredArtist.id]
                          ? 'border-red-500 bg-red-500 text-white shadow-md'
                          : 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                      }`}
                    >
                      <span>❤️🔥⭐</span>
                      <span>
                        {reactedIds[
                          featuredArtist._id || featuredArtist.id
                        ]
                          ? 'Supporting with Emoticons!'
                          : 'Send Love & Emoticons'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CTA for artists - dynamic from backend config */}
            <div className="mt-16 text-center bg-navy rounded-3xl px-8 py-14 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-lime/15 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative z-10 max-w-lg mx-auto space-y-5">
                <span className="inline-block font-mono text-[10px] uppercase tracking-[0.5em] text-white/40">
                  Are you an artist?
                </span>
                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                  {ctaTitle.includes('You') ? (
                    <>
                      {ctaTitle.replace('You', '')}
                      <span className="text-lime">You</span>
                    </>
                  ) : (
                    ctaTitle
                  )}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {ctaText}
                </p>
                <button
                  onClick={openModal}
                  className="px-8 py-3.5 rounded-2xl bg-lime text-navy font-bold text-sm hover:bg-yellow hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
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
