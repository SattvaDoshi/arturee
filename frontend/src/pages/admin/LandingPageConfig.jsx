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
  Compass,
  Upload,
  Tag,
} from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { landingConfigApi, artistApi, genreApi, adminApi } from '../../api/index.js'

const DEFAULT_PRICING_PLANS = [
  {
    label: 'Single Video',
    price: 49,
    save: '',
    desc: 'Watch any single video on the platform with 2 streams included.',
    highlight: false,
    points: ['2 streams per video', 'HD quality streaming', 'Standard Rate', 'Instant access'],
  },
  {
    label: 'Bundle of 2',
    price: 89,
    save: 'Save Rs. 9',
    desc: 'Hand-pick 2 videos of your choice at a discounted bundle price.',
    highlight: false,
    points: ['Everything in Single', '2 videos of your choice', 'Discounted bundle price', 'HD quality streaming'],
  },
  {
    label: 'Bundle of 3',
    price: 129,
    save: 'Save Rs. 18',
    desc: 'Best value! Choose 3 videos and enjoy immersive storytelling.',
    highlight: true,
    points: ['Best Value bundle', '3 videos of your choice', 'Maximum savings', '4K + Dolby quality'],
  },
]

const DEFAULT_DISCOVER_CARDS = [
  {
    title: 'Visual Symphony',
    subtitle: '',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBnsgMc-9vWB2jVZnNY9OxoK8_BaZASds2u3vuoZZc4O7X0MDZWge7YPEJtPFWKGKcOK9n8fdj7q_tvvKjH2PIbS8sG1Rh3vDSk1TVEbhDVGK7u0LzC1JQLs6sPuTfmhUgDFENXG_haHS5GFKfnpXrpGLQOsFhHBaMxfIYhahDCScBhiD6VnLxXG9vvOAKh0kEvytrJhTXy5GHTF1QV8jVz5F5UQrBHINz-gtU7ujs1LMASn9d9VGc0bA9oKxl_LQt3M84YGgbN--4',
    tag: 'Featured Premiere',
    link: '/pricing',
  },
  {
    title: 'Digital Renaissance',
    subtitle: 'Original Series • 8 Episodes',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCt-jEXc91uTeJMaVK6zjnOMFJKCGus_B1r6AYlGDj7_wlxzJJBj_lRGPAWkyiE4Qr7cD4sfnnIdlZ3bSfgEuHe89crQEMsg3-ReTjP-VsU7nFrMufroLvl2bb7Hz5wWv1HzpQ_PZVZ_NebgzWxa_pBZpZLxR2Gpg8fOVsTWb9266HoYO5I924k2u04SvPfegjaO3GWO6B8EPlCUe2h44GXeTJD8Xeer3p1eV5E31cIXxxzHmgt5I0Sx4Ny_RKL1i8NICHTI6242mQ',
    tag: 'Trending',
    link: '/pricing',
  },
  {
    title: 'The Beat Lab',
    subtitle: 'Documentary • Feature Film',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDORGisarDYAqiHhwqXhYY4WJNNlgj2-xTq1FnVgjAhSlFDLWIHSnN0BTssUzt-B3SegXY1P0OTnOLyOPsxsBP3HcUPad0uxdr7a3D5jEV2kEvyNbdgDyE4z8D4lnNshop8mrxEwEmvktNDOZq_7VYRiuDS-LNg9xnqAABIzCrNeTEPaFezdoe_QKqILe1LWPMYt8AXrdeSvSsbottdWIGtzjVO4KmsTHdxx8rB-u3hnWjRXN0FnFfTts5w-JYkpsSh_Q1C6LSR3Yg',
    tag: '',
    link: '/pricing',
  },
  {
    title: 'Vivid Sessions',
    subtitle: 'Live Sessions • Weekly',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSlu6MXincC_nuFxgb0-Qvvi98L2ihaUkswQOo-vb-lFvwESZwA-LdRVspW60Iny8RYTUaL4Ja1TMJ5JeFLL8V3SoUsgPHbo_goFB2AYNXyH1LExdnnkRSudA47pH8kPDDUHrFsLZDQ4AzPU98TYnGaWvPk4vRPLXdiyLiz15XJoDcjwmTc0hdzANZI83gpdb0XODPeJxofCLh9C_EenN5SJJsfR56_URLhCtCsiEWzYSKMLbTr3vs_cU9hGtU8mPKrldjwSdeMRo',
    tag: '',
    link: '/pricing',
  },
  {
    title: 'Neon Pulse',
    subtitle: '',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCsy8ybTozKR1HiRFdBhwUpfnIGozYNMfABlXdQSgfAjiMjlUC3_inSVNVMv0vf3VQy0tt5e39uzqccD28xR9aQjOTVCj1NBgt-KYcyYBysCMcUCR7RGxqHpPugUXfq18gRtF8JPVi6-lR_Fd7jsZlWfWVtAeB2YDeWTObwihEy4BFEbO5hckAKWe7z4Eo36D2eg2oIiitpulF8UxpA6mzZg9djheSNosdv_VdsKLChme6M28deuo6FmJKD7T5k3fPmH9h7PHjz_e8',
    tag: '',
    link: '/pricing',
  },
]

export default function LandingPageConfig() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const [activeTab, setActiveTab] = useState('artists') // 'artists' | 'genres' | 'discover' | 'hero'
  const [uploadingDiscoverIndex, setUploadingDiscoverIndex] = useState(null)

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
    discoverSection: {
      headline: 'Exclusive Art',
      subheadline: 'Art : Anywhere and Everywhere',
      ctaText: 'View All',
      ctaLink: '/pricing',
      cards: DEFAULT_DISCOVER_CARDS,
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

        const normalizedDiscoverCards =
          fetchedConfig.discoverSection?.cards?.length > 0
            ? fetchedConfig.discoverSection.cards
            : DEFAULT_DISCOVER_CARDS

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
          discoverSection: {
            headline: fetchedConfig.discoverSection?.headline || 'Exclusive Art',
            subheadline:
              fetchedConfig.discoverSection?.subheadline ||
              'Art : Anywhere and Everywhere',
            ctaText: fetchedConfig.discoverSection?.ctaText || 'View All',
            ctaLink: fetchedConfig.discoverSection?.ctaLink || '/pricing',
            cards: normalizedDiscoverCards,
          },
          pricingSection: {
            headline: fetchedConfig.pricingSection?.headline || 'Plans & Pricing',
            subheadline:
              fetchedConfig.pricingSection?.subheadline ||
              'Choose how you want to experience art — pay per video or bundle the pieces that move you.',
            plans:
              fetchedConfig.pricingSection?.plans && fetchedConfig.pricingSection.plans.length > 0
                ? fetchedConfig.pricingSection.plans
                : DEFAULT_PRICING_PLANS,
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

  // Discover Section operations
  const handleDiscoverImageUpload = async (index, file) => {
    if (!file) return
    setUploadingDiscoverIndex(index)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await adminApi.uploadImage(formData)
      if (res.data?.data?.url) {
        updateDiscoverCard(index, 'imageUrl', res.data.data.url)
      }
    } catch (err) {
      alert('Failed to upload image')
      console.error(err)
    } finally {
      setUploadingDiscoverIndex(null)
    }
  }

  const updateDiscoverCard = (index, field, value) => {
    setConfig((prev) => {
      const updated = (prev.discoverSection?.cards || DEFAULT_DISCOVER_CARDS).map((c, idx) =>
        idx === index ? { ...c, [field]: value } : c
      )
      return {
        ...prev,
        discoverSection: {
          ...prev.discoverSection,
          cards: updated,
        },
      }
    })
  }

  const updatePricingSection = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      pricingSection: {
        ...prev.pricingSection,
        [field]: value,
      },
    }))
  }

  const updatePricingCard = (index, field, value) => {
    setConfig((prev) => {
      const updatedPlans = [...(prev.pricingSection?.plans || DEFAULT_PRICING_PLANS)]
      updatedPlans[index] = {
        ...updatedPlans[index],
        [field]: value,
      }
      return {
        ...prev,
        pricingSection: {
          ...prev.pricingSection,
          plans: updatedPlans,
        },
      }
    })
  }

  const addPricingPoint = (planIndex) => {
    setConfig((prev) => {
      const updatedPlans = [...(prev.pricingSection?.plans || DEFAULT_PRICING_PLANS)]
      const currentPoints = [...(updatedPlans[planIndex].points || [])]
      currentPoints.push('New Feature Point')
      updatedPlans[planIndex] = {
        ...updatedPlans[planIndex],
        points: currentPoints,
      }
      return {
        ...prev,
        pricingSection: {
          ...prev.pricingSection,
          plans: updatedPlans,
        },
      }
    })
  }

  const updatePricingPoint = (planIndex, pointIndex, value) => {
    setConfig((prev) => {
      const updatedPlans = [...(prev.pricingSection?.plans || DEFAULT_PRICING_PLANS)]
      const currentPoints = [...(updatedPlans[planIndex].points || [])]
      currentPoints[pointIndex] = value
      updatedPlans[planIndex] = {
        ...updatedPlans[planIndex],
        points: currentPoints,
      }
      return {
        ...prev,
        pricingSection: {
          ...prev.pricingSection,
          plans: updatedPlans,
        },
      }
    })
  }

  const removePricingPoint = (planIndex, pointIndex) => {
    setConfig((prev) => {
      const updatedPlans = [...(prev.pricingSection?.plans || DEFAULT_PRICING_PLANS)]
      const currentPoints = [...(updatedPlans[planIndex].points || [])]
      currentPoints.splice(pointIndex, 1)
      updatedPlans[planIndex] = {
        ...updatedPlans[planIndex],
        points: currentPoints,
      }
      return {
        ...prev,
        pricingSection: {
          ...prev.pricingSection,
          plans: updatedPlans,
        },
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
        discoverSection: config.discoverSection,
        pricingSection: config.pricingSection,
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
            onClick={() => setActiveTab('discover')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'discover'
                ? 'bg-linear-to-r from-[#4DD0E1] to-[#C0E863] text-[#051d2e] shadow-md'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Exclusive Art (Discover Section)</span>
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'pricing'
                ? 'bg-linear-to-r from-[#4DD0E1] to-[#C0E863] text-[#051d2e] shadow-md'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Pricing & Bundles Config</span>
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

            {/* ── TAB: EXCLUSIVE ART (DISCOVER SECTION) ── */}
            {activeTab === 'discover' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Headline / Subheadline / CTA Button Text / CTA Link */}
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-white">
                      1. Exclusive Art Section Header & CTA Link
                    </h2>
                    <p className="text-white/60 text-xs mt-1">
                      Customize the section title, subtitle, and the top-right "View All" button link on the homepage.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        Section Headline
                      </label>
                      <input
                        type="text"
                        value={config.discoverSection?.headline || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            discoverSection: {
                              ...prev.discoverSection,
                              headline: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        Section Subtitle
                      </label>
                      <input
                        type="text"
                        value={config.discoverSection?.subheadline || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            discoverSection: {
                              ...prev.discoverSection,
                              subheadline: e.target.value,
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
                        value={config.discoverSection?.ctaText || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            discoverSection: {
                              ...prev.discoverSection,
                              ctaText: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                        CTA Button Link (Redirect URL)
                      </label>
                      <input
                        type="text"
                        value={config.discoverSection?.ctaLink || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            discoverSection: {
                              ...prev.discoverSection,
                              ctaLink: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-[#071523] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                  </div>
                </div>

                {/* 5 Exclusive Art Cards Editor */}
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-white">
                      2. Exclusive Art Grid Cards (5 Cards)
                    </h2>
                    <p className="text-white/60 text-xs mt-1">
                      Customize the image, title, badge tag, optional subtitle, and redirection link for each of the 5 cards.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {(config.discoverSection?.cards || DEFAULT_DISCOVER_CARDS).map((card, idx) => {
                      const labels = [
                        'Card #1 — Large Featured Hero Card (2x2 Grid Size - Left)',
                        'Card #2 — Tall Center Card (1x3 Grid Size - Center)',
                        'Card #3 — Top-Right Card (1x2 Grid Size)',
                        'Card #4 — Middle-Right Card (1x2 Grid Size)',
                        'Card #5 — Bottom-Right Small Card (1x1 Grid Size)',
                      ]
                      const label = labels[idx] || `Card #${idx + 1}`

                      return (
                        <div
                          key={idx}
                          className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4"
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="font-bold text-sm text-[#4DD0E1]">
                              {label}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Inputs */}
                            <div className="md:col-span-2 space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                                    Card Title
                                  </label>
                                  <input
                                    type="text"
                                    value={card.title || ''}
                                    onChange={(e) =>
                                      updateDiscoverCard(idx, 'title', e.target.value)
                                    }
                                    placeholder="e.g. Visual Symphony"
                                    className="w-full bg-[#071523] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                                    Badge / Tag Text
                                  </label>
                                  <input
                                    type="text"
                                    value={card.tag || ''}
                                    onChange={(e) =>
                                      updateDiscoverCard(idx, 'tag', e.target.value)
                                    }
                                    placeholder="e.g. FEATURED PREMIERE"
                                    className="w-full bg-[#071523] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                                    Subtitle (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={card.subtitle || ''}
                                    onChange={(e) =>
                                      updateDiscoverCard(idx, 'subtitle', e.target.value)
                                    }
                                    placeholder="e.g. Original Series • 8 Episodes"
                                    className="w-full bg-[#071523] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                                    Redirect Link URL
                                  </label>
                                  <input
                                    type="text"
                                    value={card.link || ''}
                                    onChange={(e) =>
                                      updateDiscoverCard(idx, 'link', e.target.value)
                                    }
                                    placeholder="e.g. /pricing or /artists"
                                    className="w-full bg-[#071523] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                                  Image URL (Or Upload Image)
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={card.imageUrl || ''}
                                    onChange={(e) =>
                                      updateDiscoverCard(idx, 'imageUrl', e.target.value)
                                    }
                                    placeholder="https://..."
                                    className="w-full bg-[#071523] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4DD0E1]"
                                  />
                                  <label
                                    className={`shrink-0 cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                      uploadingDiscoverIndex === idx
                                        ? 'opacity-50 pointer-events-none bg-white/10'
                                        : 'bg-[#4DD0E1]/20 text-[#4DD0E1] hover:bg-[#4DD0E1] hover:text-[#051d2e]'
                                    }`}
                                  >
                                    {uploadingDiscoverIndex === idx ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Upload className="w-4 h-4" />
                                    )}
                                    <span>
                                      {uploadingDiscoverIndex === idx
                                        ? 'Uploading...'
                                        : 'Upload'}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleDiscoverImageUpload(
                                          idx,
                                          e.target.files[0]
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Preview Thumbnail */}
                            <div className="flex flex-col items-center justify-center bg-black/30 rounded-xl p-3 border border-white/10">
                              <span className="text-[10px] text-white/40 uppercase font-mono mb-2">
                                Preview
                              </span>
                              {card.imageUrl ? (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/20 shadow-md">
                                  <img
                                    src={card.imageUrl}
                                    alt={card.title}
                                    className="w-full h-full object-cover"
                                  />
                                  {card.tag && (
                                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary text-white shadow">
                                      {card.tag}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full h-32 rounded-lg bg-white/5 flex items-center justify-center text-white/30 text-xs">
                                  No image set
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: PRICING & BUNDLES CONFIG ── */}
            {activeTab === 'pricing' && (
              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">Pricing & Bundles Section</h2>
                      <p className="text-sm text-white/60">
                        Edit price, text, badge, and feature points for Pay-Per-Video and Bundle plans.
                      </p>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-linear-to-r from-[#4DD0E1] to-[#C0E863] text-[#051d2e] shadow-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </div>

                  {/* Headline & Subheadline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                        Section Headline
                      </label>
                      <input
                        type="text"
                        value={config.pricingSection?.headline || 'Plans & Pricing'}
                        onChange={(e) => updatePricingSection('headline', e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                        Section Subheadline
                      </label>
                      <input
                        type="text"
                        value={config.pricingSection?.subheadline || ''}
                        onChange={(e) => updatePricingSection('subheadline', e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4DD0E1]"
                      />
                    </div>
                  </div>

                  {/* Pricing Cards */}
                  <div className="space-y-6 mt-8">
                    <h3 className="text-lg font-bold text-white border-t border-white/10 pt-6">
                      Bundle & Pricing Plans (3 Cards)
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {(config.pricingSection?.plans || DEFAULT_PRICING_PLANS).map((plan, index) => (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#C0E863]">
                                Plan #{index + 1}
                              </span>
                              <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!plan.highlight}
                                  onChange={(e) => updatePricingCard(index, 'highlight', e.target.checked)}
                                  className="rounded border-white/20 bg-white/5 text-[#4DD0E1] focus:ring-0 cursor-pointer"
                                />
                                Highlight as Best Value
                              </label>
                            </div>

                            <div>
                              <label className="block text-xs text-white/60 mb-1 font-mono">
                                Label / Title
                              </label>
                              <input
                                type="text"
                                value={plan.label || ''}
                                onChange={(e) => updatePricingCard(index, 'label', e.target.value)}
                                placeholder="e.g. Single Video"
                                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4DD0E1]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-white/60 mb-1 font-mono">
                                  Price (Rs.)
                                </label>
                                <input
                                  type="number"
                                  value={plan.price ?? 0}
                                  onChange={(e) => updatePricingCard(index, 'price', Number(e.target.value))}
                                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-[#4DD0E1]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-white/60 mb-1 font-mono">
                                  Savings Badge text
                                </label>
                                <input
                                  type="text"
                                  value={plan.save || ''}
                                  onChange={(e) => updatePricingCard(index, 'save', e.target.value)}
                                  placeholder="e.g. Save Rs. 9"
                                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4DD0E1]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs text-white/60 mb-1 font-mono">
                                Description Text
                              </label>
                              <textarea
                                rows={2}
                                value={plan.desc || ''}
                                onChange={(e) => updatePricingCard(index, 'desc', e.target.value)}
                                placeholder="Describe what this plan includes..."
                                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4DD0E1] resize-none"
                              />
                            </div>

                            {/* Editable Feature Points */}
                            <div className="space-y-2 pt-2 border-t border-white/10">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-mono uppercase text-white/70">
                                  Feature Points
                                </label>
                                <button
                                  type="button"
                                  onClick={() => addPricingPoint(index)}
                                  className="flex items-center gap-1 text-xs text-[#C0E863] hover:underline cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Point</span>
                                </button>
                              </div>

                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {(plan.points || []).map((point, pointIdx) => (
                                  <div key={pointIdx} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={point}
                                      onChange={(e) =>
                                        updatePricingPoint(index, pointIdx, e.target.value)
                                      }
                                      placeholder="Feature point text..."
                                      className="flex-1 bg-white/5 border border-white/15 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-[#4DD0E1]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removePricingPoint(index, pointIdx)}
                                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                                {(plan.points || []).length === 0 && (
                                  <p className="text-xs text-white/40 italic">No feature points added.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
