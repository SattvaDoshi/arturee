import { useState, useEffect } from 'react'
import { Save, GripVertical, CheckSquare, Square, Loader2, MonitorPlay } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { adminApi, videoApi } from '../../api/index.js'
import { toast } from '../../context/ToastContext.jsx'

export default function SliderPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [videos, setVideos] = useState([])
  const [featuredOrder, setFeaturedOrder] = useState([]) // array of video IDs in order

  useEffect(() => {
    // Fetch all ready videos
    adminApi.listAllVideos({ limit: 1000 })
      .then(res => {
        const allVids = res.data.data.videos.filter(v => v.status === 'ready' && v.isPublished)
        setVideos(allVids)
        // Extract initially featured videos sorted by order
        const featured = allVids.filter(v => v.featured).sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0))
        setFeaturedOrder(featured.map(v => v._id))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleFeatured = (videoId) => {
    setFeaturedOrder(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId)
      } else {
        return [...prev, videoId]
      }
    })
  }

  // HTML5 Drag and Drop handlers
  const [draggedIdx, setDraggedIdx] = useState(null)

  const handleDragStart = (e, index) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    // Hack to make it look nicer while dragging
    setTimeout(() => {
      e.target.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedIdx(null)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault() // necessary to allow dropping
    if (draggedIdx === null || draggedIdx === index) return

    setFeaturedOrder(prev => {
      const newOrder = [...prev]
      const draggedItem = newOrder[draggedIdx]
      newOrder.splice(draggedIdx, 1)
      newOrder.splice(index, 0, draggedItem)
      setDraggedIdx(index)
      return newOrder
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        featuredVideos: featuredOrder.map((id, idx) => ({ videoId: id, featuredOrder: idx + 1 }))
      }
      await adminApi.updateFeaturedVideos(payload)
      toast.success('Slider configuration saved successfully!')
    } catch (err) {
      toast.error('Failed to save configuration.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const featuredVideoObjects = featuredOrder.map(id => videos.find(v => v._id === id)).filter(Boolean)
  const availableVideos = videos.filter(v => !featuredOrder.includes(v._id))

  return (
    <AdminLayout>
      <div className="p-5 md:p-8 space-y-8 max-w-6xl mx-auto">

        {/* ── Page heading ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <MonitorPlay className="w-6 h-6 text-[#4DD0E1]" />
              Hero Slider Configuration
            </h1>
            <p className="text-sm text-white/40 mt-0.5">Select and order videos for the main dashboard slider.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-[#051d2e] shadow-lg transition hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
            style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#4DD0E1] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── Left Column: Selected (Drag & Drop) ── */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#4DD0E1]">Selected for Slider ({featuredVideoObjects.length})</h2>
              
              {featuredVideoObjects.length === 0 ? (
                <div className="p-8 border border-dashed border-white/20 rounded-2xl text-center">
                  <p className="text-sm text-white/40">No videos selected. Select from the right panel.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {featuredVideoObjects.map((vid, idx) => (
                    <div
                      key={vid._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 cursor-grab active:cursor-grabbing hover:bg-white/10 transition"
                    >
                      <div className="flex-shrink-0 text-white/30 cursor-grab px-2">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="w-24 h-14 rounded-lg bg-black/40 overflow-hidden flex-shrink-0 relative">
                        <img src={vid.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">#{idx + 1}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{vid.title}</p>
                        <p className="text-xs text-white/40 truncate">{vid.creatorId?.name || 'Unknown'}</p>
                      </div>
                      <button 
                        onClick={() => toggleFeatured(vid._id)}
                        className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition"
                        title="Remove"
                      >
                        <CheckSquare className="w-5 h-5 text-[#C0E863]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right Column: Available ── */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/60">Available Videos</h2>
              <div className="p-4 border border-white/10 rounded-2xl bg-black/20 max-h-[600px] overflow-y-auto space-y-2">
                {availableVideos.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-4">No available videos found.</p>
                ) : (
                  availableVideos.map(vid => (
                    <div key={vid._id} className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/5">
                      <div className="w-20 h-12 rounded-md bg-black/40 overflow-hidden flex-shrink-0">
                        <img src={vid.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/90 truncate">{vid.title}</p>
                        <p className="text-[11px] text-white/40 truncate">{vid.creatorId?.name}</p>
                      </div>
                      <button 
                        onClick={() => toggleFeatured(vid._id)}
                        className="p-2 text-white/40 hover:text-white transition"
                      >
                        <Square className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  )
}
