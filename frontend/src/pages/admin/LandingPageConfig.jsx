import { useState, useEffect } from 'react'
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layout,
  UserCheck,
  Bookmark,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { landingConfigApi, artistApi, genreApi } from '../../api/index.js'

export default function LandingPageConfig() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const [activeTab, setActiveTab] = useState('artists') // 'artists' | 'genres' | 'hero'

  const [allArtists, setAllArtists] = useState([])
  const [allGenres, setAllGenres] = useState([])

  const [config, setConfig] = useState({
    artistPage: {
      headline: 'The Artists',
      subheadline: 'Every art form tells a different story. Find yours.',
      artistCards: [],
      featuredArtistId: null,
      ctaTitle: 'Ignite the Artist in You',
      ctaText:
        'Arturee is your sky. Spread your wings, share your art, and earn from what you love.',
    },
    genrePage: {
      headline: 'Explore by Genre',
      subheadline: 'Passionate, fearless, and unapologetically authentic.',
      featuredGenres: [],
    },
    heroSection: {
      title: 'Where Art Speaks louder than Words',
      subtitle:
        'Discover premium spoken word, poetry, and storytelling performances.',
      ctaButtonText: 'Explore Artists',
      ctaButtonLink: '/artists',
    },
  })

  useEffect(() => {
    let isMounted = true
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [configRes, artistsRes, genresRes] = await Promise.all([
          landingConfigApi.get(),
          artistApi.list({ limit: 100 }),
          genreApi.list(),
        ])

        if (!isMounted) return

        const fetchedConfig = configRes.data?.data || {}
        const artistList = Array.isArray(artistsRes.data?.data)
          ? artistsRes.data.data
          : artistsRes.data?.data?.artists || []
        const genreList = Array.isArray(genresRes.data?.data)
          ? genresRes.data.data
          : genresRes.data?.data?.genres || []

        setAllArtists(artistList)
        setAllGenres(genreList)

        // Normalize artistCards artistId reference
        const normalizedCards = (fetchedConfig.artistPage?.artistCards || []).map((card) => ({
          ...card,
          artistId: card.artistId?._id || card.artistId || '',
        }))

        const normalizedFeatured =
          fetchedConfig.artistPage?.featuredArtistId?._id ||
          fetchedConfig.artistPage?.featuredArtistId ||
          ''

        const normalizedFeaturedGenres = (fetchedConfig.genrePage?.featuredGenres || []).map(
          (g) => g._id || g
        )

        setConfig({
          artistPage: {
            headline: fetchedConfig.artistPage?.headline || 'The Artists',
            subheadline:
              fetchedConfig.artistPage?.subheadline ||
              'Every art form tells a different story. Find yours.',
            artistCards: normalizedCards,
            featuredArtistId: normalizedFeatured,
            ctaTitle:
              fetchedConfig.artistPage?.ctaTitle || 'Ignite the Artist in You',
            ctaText:
              fetchedConfig.artistPage?.ctaText ||
              'Arturee is your sky. Spread your wings, share your art, and earn from what you love.',
          },
          genrePage: {
            headline: fetchedConfig.genrePage?.headline || 'Explore by Genre',
            subheadline:
              fetchedConfig.genrePage?.subheadline ||
              'Passionate, fearless, and unapologetically authentic.',
            featuredGenres: normalizedFeaturedGenres,
          },
          heroSection: {
            title:
              fetchedConfig.heroSection?.title ||
              'Where Art Speaks louder than Words',
            subtitle:
              fetchedConfig.heroSection?.subtitle ||
              'Discover premium spoken word, poetry, and storytelling performances.',
            ctaButtonText:
              fetchedConfig.heroSection?.ctaButtonText || 'Explore Artists',
            ctaButtonLink:
              fetchedConfig.heroSection?.ctaButtonLink || '/artists',
          },
        })
      } catch (err) {
        console.error('Failed to load landing config:', err)
        setMessage({
          type: 'error',
          text: 'Failed to load configuration from backend.',
        })
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchAll()
    return () => {
      isMounted = false
    }
  }, [])

  // Artist Cards Operations (Max 8)
  const addArtistCard = () => {
    if (config.artistPage.artistCards.length >= 8) return
    const firstAvailableArtist = allArtists[0]?._id || ''
    const newCard = {
      artistId: firstAvailableArtist,
      tag: 'Featured',
      tagColor: 'orange',
      order: config.artistPage.artistCards.length,
    }
    setConfig((prev) => ({
      ...prev,
      artistPage: {
        ...prev.artistPage,
        artistCards: [...prev.artistPage.artistCards, newCard],
      },
    }))
  }

  const removeArtistCard = (index) => {
    setConfig((prev) => {
      const updated = prev.artistPage.artistCards.filter((_, i) => i !== index)
      return {
        ...prev,
        artistPage: { ...prev.artistPage, artistCards: updated },
      }
    })
  }

  const updateCardField = (index, field, value) => {
    setConfig((prev) => {
      const updated = prev.artistPage.artistCards.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      )
      return {
        ...prev,
        artistPage: { ...prev.artistPage, artistCards: updated },
      }
    })
  }

  const moveCard = (index, direction) => {
    setConfig((prev) => {
      const updated = [...prev.artistPage.artistCards]
      const targetIdx = index + direction
      if (targetIdx < 0 || targetIdx >= updated.length) return prev
      const temp = updated[index]
      updated[index] = updated[targetIdx]
      updated[targetIdx] = temp
      return {
        ...prev,
        artistPage: { ...prev.artistPage, artistCards: updated },
      }
    })
  }

  // Genre selection toggle
  const toggleFeaturedGenre = (genreId) => {
    setConfig((prev) => {
      const current = prev.genrePage.featuredGenres || []
      const exists = current.includes(genreId)
      const updated = exists
        ? current.filter((id) => id !== genreId)
        : [...current, genreId]
      return {
        ...prev,
        genrePage: { ...prev.genrePage, featuredGenres: updated },
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      // Re-assign order indices
      const orderedCards = config.artistPage.artistCards.map((c, idx) => ({
        ...c,
        order: idx,
      }))

      const payload = {
        artistPage: {
          ...config.artistPage,
          artistCards: orderedCards,
        },
        genrePage: config.genrePage,
        heroSection: config.heroSection,
      }

      await landingConfigApi.update(payload)
      setMessage({
        type: 'success',
        text: 'Landing page configurations saved successfully!',
      })
      setTimeout(() => setMessage(null), 4000)
    } catch (err) {
      console.error('Save failed:', err)
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save configurations.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-[#4DD0E1] text-xs font-mono uppercase tracking-widest mb-1">
              <Layout className="w-4 h-4" />
              <span>Admin Portal / Content Management</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Landing Page Configuration
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Customize public landing pages dynamically without changing codebase.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#4DD0E1] to-[#C0E863] text-[#051d2e] font-black text-sm uppercase tracking-wide hover:opacity-95 disabled:opacity-50 transition shadow-lg shrink-0"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-semibold transition-all ${
              message.type === 'success'
                ? 'bg-[#C0E863]/15 border-[#C0E863]/40 text-[#C0E863]'
                : 'bg-red-500/15 border-red-500/40 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('artists')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'artists'
                ? 'bg-linear-to-r from-[#4DD0E1] to-[#C0E863] text-[#051d2e] shadow-md'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Artists Page Config (Max 8)</span>
          </button>
          <button
            onClick={() => setActiveTab('genres')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'genres'
                ? 'bg-linear-to-r from-[#4DD0E1] to-[#C0E863] text-[#051d2e] shadow-md'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Genres Page Config</span>
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'hero'
                ? 'bg-linear-to-r from-[#4DD0E1] to-[#C0E863] text-[#051d2e] shadow-md'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Hero & General Config</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/60">
            <Loader2 className="w-8 h-8 animate-spin text-[#4DD0E1] mb-3" />
            <p className="text-sm">Loading configurations from server...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── TAB 1: ARTISTS PAGE CONFIG ── */}
            {activeTab === 'artists' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Section 1: Artist Cards Grid (Max 8) */}
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white">
                        1. Artist Cards Grid (Max 8 Cards)
                      </h2>
                      <p className="text-white/60 text-xs mt-1">
                        Select which artists appear in the main grid on the Artists Landing page. Reorder or customize their badges.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs px-3 py-1 rounded-full bg-white/10 text-white">
                        {config.artistPage.artistCards.length} / 8 Cards
                      </span>
                      <button
                        onClick={addArtistCard}
                        disabled={config.artistPage.artistCards.length >= 8}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4DD0E1] text-[#051d2e] font-bold text-xs uppercase tracking-wide hover:bg-white disabled:opacity-40 transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Card</span>
                      </button>
                    </div>
                  </div>

                  {config.artistPage.artistCards.length === 0 ? (
                    <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/5">
                      <p className="text-white/50 text-sm">
                        No artist cards selected. Click "Add Card" above to add artists to the public grid.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {config.artistPage.artistCards.map((card, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-black/30 rounded-2xl border border-white/10"
                        >
                          {/* Order number */}
                          <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-mono font-bold text-sm shrink-0">
                            #{idx + 1}
                          </span>

                          {/* Artist Selector */}
                          <div className="flex-1">
                            <label className="block text-[11px] font-mono uppercase text-white/50 mb-1">
                              Select Artist
                            </label>
                            <select
                              value={card.artistId}
                              onChange={(e) =>
                                updateCardField(idx, 'artistId', e.target.value)
                              }
                              className="w-full bg-[#071523] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                            >
                              <option value="">-- Choose Artist --</option>
                              {allArtists.map((artist) => (
                                <option key={artist._id} value={artist._id}>
                                  {artist.name} ({artist.genre || 'Artist'}) • {artist.emoticonCount || artist.followerCount || 0} Emoticons ❤️
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Tag input */}
                          <div className="w-full sm:w-44">
                            <label className="block text-[11px] font-mono uppercase text-white/50 mb-1">
                              Badge Tag
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Founder, Trending"
                              value={card.tag || ''}
                              onChange={(e) =>
                                updateCardField(idx, 'tag', e.target.value)
                              }
                              className="w-full bg-[#071523] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                            />
                          </div>

                          {/* Tag Color */}
                          <div className="w-full sm:w-36">
                            <label className="block text-[11px] font-mono uppercase text-white/50 mb-1">
                              Tag Color
                            </label>
                            <select
                              value={card.tagColor || 'orange'}
                              onChange={(e) =>
                                updateCardField(idx, 'tagColor', e.target.value)
                              }
                              className="w-full bg-[#071523] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                            >
                              <option value="orange">Orange</option>
                              <option value="red">Red</option>
                              <option value="lime">Lime</option>
                              <option value="teal">Teal</option>
                              <option value="purple">Purple</option>
                              <option value="blue">Blue</option>
                              <option value="default">Default</option>
                            </select>
                          </div>

                          {/* Reorder / Delete buttons */}
                          <div className="flex items-center gap-1 sm:pt-4">
                            <button
                              onClick={() => moveCard(idx, -1)}
                              disabled={idx === 0}
                              title="Move Up"
                              className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/20 disabled:opacity-30 transition"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveCard(idx, 1)}
                              disabled={idx === config.artistPage.artistCards.length - 1}
                              title="Move Down"
                              className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/20 disabled:opacity-30 transition"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeArtistCard(idx)}
                              title="Remove Card"
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Featured Artist Expanded Spotlight */}
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-white">
                      2. Spotlight / Featured Artist (Below Grid)
                    </h2>
                    <p className="text-white/60 text-xs mt-1">
                      Choose which artist is highlighted in the large expanded showcase section below the artist cards grid.
                    </p>
                  </div>
                  <div className="max-w-md">
                    <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                      Select Featured Artist
                    </label>
                    <select
                      value={config.artistPage.featuredArtistId || ''}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          artistPage: {
                            ...prev.artistPage,
                            featuredArtistId: e.target.value || null,
                          },
                        }))
                      }
                      className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                    >
                      <option value="">-- No Featured Artist --</option>
                      {allArtists.map((artist) => (
                        <option key={artist._id} value={artist._id}>
                          {artist.name} ({artist.genre || 'Story Telling'}) • {artist.emoticonCount || artist.followerCount || 0} Emoticons ❤️
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 3: Page Headlines & Bottom CTA */}
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-6">
                  <h2 className="text-xl font-black text-white">
                    3. Page Headlines & Bottom CTA Banner
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        Main Headline
                      </label>
                      <input
                        type="text"
                        value={config.artistPage.headline || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            artistPage: {
                              ...prev.artistPage,
                              headline: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        Subheadline
                      </label>
                      <input
                        type="text"
                        value={config.artistPage.subheadline || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            artistPage: {
                              ...prev.artistPage,
                              subheadline: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        Bottom CTA Title
                      </label>
                      <input
                        type="text"
                        value={config.artistPage.ctaTitle || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            artistPage: {
                              ...prev.artistPage,
                              ctaTitle: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        Bottom CTA Subtext
                      </label>
                      <input
                        type="text"
                        value={config.artistPage.ctaText || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            artistPage: {
                              ...prev.artistPage,
                              ctaText: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: GENRES PAGE CONFIG ── */}
            {activeTab === 'genres' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-white">
                      1. Genres Landing Page Headlines
                    </h2>
                    <p className="text-white/60 text-xs mt-1">
                      Customize the hero headline and subtitle on the public Genres exploration page.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        Genres Headline
                      </label>
                      <input
                        type="text"
                        value={config.genrePage.headline || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            genrePage: {
                              ...prev.genrePage,
                              headline: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        Genres Subheadline
                      </label>
                      <input
                        type="text"
                        value={config.genrePage.subheadline || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            genrePage: {
                              ...prev.genrePage,
                              subheadline: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-white">
                      2. Highlighted Genres
                    </h2>
                    <p className="text-white/60 text-xs mt-1">
                      Select which genres are featured prominently on the landing page.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {allGenres.map((genre) => {
                      const selected = (config.genrePage.featuredGenres || []).includes(
                        genre._id
                      )
                      return (
                        <button
                          key={genre._id}
                          type="button"
                          onClick={() => toggleFeaturedGenre(genre._id)}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition ${
                            selected
                              ? 'bg-[#4DD0E1]/15 border-[#4DD0E1] text-white font-bold'
                              : 'bg-black/20 border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                              selected
                                ? 'bg-[#4DD0E1] border-[#4DD0E1] text-[#051d2e]'
                                : 'border-white/30'
                            }`}
                          >
                            {selected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-sm truncate">{genre.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: HERO & GENERAL CONFIG ── */}
            {activeTab === 'hero' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-white">
                      1. Main Landing Hero Banner
                    </h2>
                    <p className="text-white/60 text-xs mt-1">
                      Customize the primary headline and call to action on your main website landing page.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        Hero Title
                      </label>
                      <input
                        type="text"
                        value={config.heroSection.title || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            heroSection: {
                              ...prev.heroSection,
                              title: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        Hero Subtitle
                      </label>
                      <input
                        type="text"
                        value={config.heroSection.subtitle || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            heroSection: {
                              ...prev.heroSection,
                              subtitle: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={config.heroSection.ctaButtonText || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            heroSection: {
                              ...prev.heroSection,
                              ctaButtonText: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        CTA Button Link
                      </label>
                      <input
                        type="text"
                        value={config.heroSection.ctaButtonLink || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            heroSection: {
                              ...prev.heroSection,
                              ctaButtonLink: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
