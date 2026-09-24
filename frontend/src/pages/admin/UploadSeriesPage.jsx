import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, CheckCircle, ArrowRight, ArrowLeft, Film, Loader2, Plus, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { videoApi, adminApi, artistApi, genreApi } from '../../api/index.js'

export default function UploadSeriesPage() {
  const navigate = useNavigate()

  const [artists, setArtists] = useState([])
  const [genres, setGenres] = useState([])

  useEffect(() => {
    artistApi.list().then(res => setArtists(res.data?.data?.artists || res.data?.data || []))
    genreApi.list().then(res => setGenres(res.data?.data || []))
  }, [])

  const [meta, setMeta] = useState({
    title: '', description: '', price: 0, costPrice: '', discountedPrice: '',
    genre: '', certification: 'U', tags: '', thumbnailUrl: '', artistId: '',
  })
  const [episodes, setEpisodes] = useState([
    { id: 1, title: 'Episode 1', file: null, progress: 0, uploading: false, done: false, error: '' }
  ])
  const [globalError, setGlobalError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [seriesId, setSeriesId] = useState(null)

  const handleAddEpisode = () => {
    setEpisodes(prev => [
      ...prev,
      { id: Date.now(), title: `Episode ${prev.length + 1}`, file: null, progress: 0, uploading: false, done: false, error: '' }
    ])
  }

  const handleRemoveEpisode = (id) => {
    setEpisodes(prev => prev.filter(ep => ep.id !== id))
  }

  const handleEpisodeChange = (id, field, value) => {
    setEpisodes(prev => prev.map(ep => ep.id === id ? { ...ep, [field]: value } : ep))
  }

  const handleSubmit = async () => {
    if (!meta.title.trim()) return setGlobalError('Series title is required')
    if (episodes.length === 0) return setGlobalError('Add at least one episode')
    if (episodes.some(ep => !ep.file || !ep.title.trim())) return setGlobalError('All episodes must have a title and a file selected')
    
    setGlobalError('')
    setIsSubmitting(true)

    try {
      // 1. Create Series Container
      const seriesRes = await videoApi.createSeries({
        ...meta,
        price: Number(meta.price) || 0,
        costPrice: meta.costPrice ? Number(meta.costPrice) : undefined,
        discountedPrice: meta.discountedPrice ? Number(meta.discountedPrice) : undefined,
      })
      const newSeriesId = seriesRes.data.data.videoId
      setSeriesId(newSeriesId)

      // 2. Upload Episodes Sequentially
      let episodeIds = []
      for (let i = 0; i < episodes.length; i++) {
        const ep = episodes[i]
        handleEpisodeChange(ep.id, 'uploading', true)
        handleEpisodeChange(ep.id, 'error', '')
        
        try {
          const formData = new FormData()
          formData.append('file', ep.file)
          formData.append('title', ep.title)
          formData.append('seriesParentId', newSeriesId)
          formData.append('episodeNumber', i + 1)
          formData.append('price', '0') // episodes themselves are free
          
          if (meta.genre) formData.append('genre', meta.genre)
          if (meta.certification) formData.append('certification', meta.certification)
          if (meta.artistId) formData.append('artistId', meta.artistId)
          if (meta.tags) {
            formData.append('tags', JSON.stringify(meta.tags.split(',').map(t => t.trim()).filter(Boolean)))
          }

          if (ep.thumbnailUrl) {
            formData.append('thumbnailUrl', ep.thumbnailUrl)
          }

          const res = await videoApi.proxyUpload(formData, (e) => {
            if (e.total) {
              handleEpisodeChange(ep.id, 'progress', Math.round((e.loaded / e.total) * 95))
            }
          })

          episodeIds.push(res.data.data.videoId)
          handleEpisodeChange(ep.id, 'progress', 100)
          handleEpisodeChange(ep.id, 'done', true)
        } catch (err) {
          handleEpisodeChange(ep.id, 'error', 'Upload failed')
          throw new Error(`Failed to upload ${ep.title}`)
        } finally {
          handleEpisodeChange(ep.id, 'uploading', false)
        }
      }

      // 3. Update Series with Episode IDs
      await videoApi.update(newSeriesId, { seriesEpisodes: episodeIds })
      setUploadComplete(true)
    } catch (err) {
      setGlobalError(err.message || 'An error occurred during upload')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (uploadComplete) {
    return (
      <AdminLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-5 text-center">
          <div className="w-24 h-24 bg-lime/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-lime" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Series Uploaded!</h1>
          <p className="text-white/60 mb-8 max-w-sm">All episodes have been successfully uploaded and are now processing.</p>
          <button onClick={() => navigate('/admin/videos')} className="px-8 py-3 rounded-xl font-bold bg-[#4DD0E1] text-[#051d2e]">
            Go to Videos
          </button>
        </div>
      </AdminLayout>
    )
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#4DD0E1]/50 placeholder-white/25 transition"

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-5 md:p-8 space-y-8">
        <div>
          <button onClick={() => navigate('/admin/videos')} className="text-white/40 hover:text-white mb-4 flex items-center gap-2 text-sm font-semibold transition">
            <ArrowLeft className="w-4 h-4" /> Back to Videos
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Create New Series</h1>
        </div>

        {globalError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold">
            {globalError}
          </div>
        )}

        <div className="rounded-2xl border p-6 space-y-5 bg-white/5 border-white/10">
          <h2 className="text-lg font-bold text-white mb-2">Series Metadata</h2>
          <div>
            <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Series Title <span className="text-red-400">*</span></label>
            <input className={inputCls} value={meta.title} onChange={e => setMeta(p => ({...p, title: e.target.value}))} placeholder="e.g. The Dreamers (Season 1)" />
          </div>
          <div>
            <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Description</label>
            <textarea className={inputCls} rows={3} value={meta.description} onChange={e => setMeta(p => ({...p, description: e.target.value}))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Base Price (₹) <span className="text-red-400">*</span></label>
              <input type="number" className={inputCls} value={meta.price} onChange={e => setMeta(p => ({...p, price: e.target.value}))} />
            </div>
            <div>
              <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">MRP (₹)</label>
              <input type="number" className={inputCls} value={meta.costPrice} onChange={e => setMeta(p => ({...p, costPrice: e.target.value}))} placeholder="Optional" />
            </div>
            <div>
              <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Discount (₹)</label>
              <input type="number" className={inputCls} value={meta.discountedPrice} onChange={e => setMeta(p => ({...p, discountedPrice: e.target.value}))} placeholder="Optional" />
            </div>
            <div>
              <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Genre</label>
              <select value={meta.genre} onChange={e => setMeta(p => ({...p, genre: e.target.value}))} className={inputCls}>
                <option value="" className="bg-[#051d2e] text-white">Select a genre...</option>
                {genres.map(g => (
                  <option key={g._id} value={g._id} className="bg-[#051d2e] text-white">{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Rating</label>
              <select value={meta.certification} onChange={e => setMeta(p => ({...p, certification: e.target.value}))} className={inputCls}>
                <option value="U" className="bg-[#051d2e] text-white">U</option>
                <option value="U/A 7+" className="bg-[#051d2e] text-white">U/A 7+</option>
                <option value="U/A 13+" className="bg-[#051d2e] text-white">U/A 13+</option>
                <option value="U/A 16+" className="bg-[#051d2e] text-white">U/A 16+</option>
                <option value="A" className="bg-[#051d2e] text-white">A</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Tags (comma-separated)</label>
            <input value={meta.tags} onChange={e => setMeta(p => ({...p, tags: e.target.value}))} placeholder="jazz, live, acoustic…" className={inputCls} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Series Thumbnail</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={async e => {
                    const file = e.target.files[0]
                    if (!file) return
                    try {
                      setGlobalError('')
                      const fd = new FormData()
                      fd.append('image', file)
                      const res = await adminApi.uploadImage(fd)
                      setMeta(p => ({...p, thumbnailUrl: res.data.data.url}))
                    } catch (err) {
                      setGlobalError('Failed to upload series thumbnail')
                    }
                  }} 
                  className="text-xs text-white/50 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition" 
                />
                <input className={inputCls} value={meta.thumbnailUrl} onChange={e => setMeta(p => ({...p, thumbnailUrl: e.target.value}))} placeholder="Or enter URL directly..." />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Artist</label>
              <select value={meta.artistId} onChange={e => setMeta(p => ({...p, artistId: e.target.value}))} className={inputCls}>
                <option value="" className="bg-[#051d2e] text-white">Select an artist...</option>
                {artists.map(a => (
                  <option key={a._id} value={a._id} className="bg-[#051d2e] text-white">{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-6 space-y-5 bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Episodes</h2>
            <button onClick={handleAddEpisode} disabled={isSubmitting} className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition">
              <Plus className="w-3 h-3" /> Add Episode
            </button>
          </div>
          
          <div className="space-y-4">
            {episodes.map((ep, idx) => (
              <div key={ep.id} className="p-4 rounded-xl border border-white/10 bg-black/20 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <input className={inputCls} value={ep.title} onChange={e => handleEpisodeChange(ep.id, 'title', e.target.value)} disabled={isSubmitting} placeholder="Episode Title" />
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Video File</label>
                      <input type="file" accept="video/*" onChange={e => handleEpisodeChange(ep.id, 'file', e.target.files[0])} disabled={isSubmitting} className="text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#4DD0E1] file:text-[#051d2e] hover:file:bg-lime transition w-full" />
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Thumbnail (Optional)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={async e => {
                          const file = e.target.files[0]
                          if (!file) return
                          try {
                            const fd = new FormData()
                            fd.append('image', file)
                            const res = await adminApi.uploadImage(fd)
                            handleEpisodeChange(ep.id, 'thumbnailUrl', res.data.data.url)
                          } catch (err) {
                            handleEpisodeChange(ep.id, 'error', 'Thumbnail upload failed')
                          }
                        }} 
                        disabled={isSubmitting}
                        className="text-xs text-white/50 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition w-full" 
                      />
                      {ep.thumbnailUrl && <p className="text-[10px] text-lime mt-1 font-semibold truncate">Thumbnail selected</p>}
                    </div>
                  </div>
                  
                  {ep.uploading && (
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#4DD0E1] h-1.5 transition-all duration-300" style={{ width: `${ep.progress}%` }} />
                    </div>
                  )}
                  {ep.error && <p className="text-xs text-red-400 font-bold">{ep.error}</p>}
                  {ep.done && <p className="text-xs text-lime font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Uploaded</p>}
                </div>
                <button onClick={() => handleRemoveEpisode(ep.id)} disabled={isSubmitting || episodes.length === 1} className="p-2 text-white/30 hover:text-red-400 disabled:opacity-30 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 rounded-xl font-black text-[#051d2e] flex items-center justify-center gap-2 transition hover:opacity-90" style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}>
          {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : 'Save & Upload All'}
        </button>
      </div>
    </AdminLayout>
  )
}
