import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Eye, EyeOff, Edit3, Loader2, CheckCircle, ChevronLeft, ChevronRight, Film } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { adminApi, videoApi } from '../../api/index.js'

/* ─── Status badge ───────────────────────────────────── */
const STATUS_STYLES = {
  ready:      { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.25)'  },
  processing: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)'  },
  uploading:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.25)'  },
  failed:     { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.processing
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {status || 'unknown'}
    </span>
  )
}

/* ─── Inline edit form ───────────────────────────────── */
const EditForm = ({ video, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title:       video.title || '',
    description: video.description || '',
    price:       video.price ?? 0,
    category:    video.category || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await videoApi.update(video._id, form)
      onSave({ ...video, ...form })
    } catch { /* silent */ } finally { setSaving(false) }
  }

  const field = (key, label, type = 'text') => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-white/35 font-semibold uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#4DD0E1]/50 transition"
      />
    </div>
  )

  return (
    <tr style={{ background: 'rgba(77,208,225,0.04)' }}>
      <td colSpan={7} className="px-5 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {field('title', 'Title')}
          {field('price', 'Price (₹)', 'number')}
          {field('category', 'Category')}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-white/35 font-semibold uppercase tracking-widest">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#4DD0E1]/50 transition resize-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50"
            style={{ background: '#4DD0E1', color: '#051d2e' }}
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ─── Pagination ─────────────────────────────────────── */
const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null
  return (
    <div
      className="flex items-center justify-between px-5 py-3 border-t"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <span className="text-white/30 text-xs">Page {page} of {totalPages}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition">
          <ChevronLeft className="w-4 h-4 text-white/60" />
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => onChange(n)}
            className="w-7 h-7 rounded-lg text-xs font-bold transition"
            style={n === page ? { background: '#4DD0E1', color: '#051d2e' } : { color: 'rgba(255,255,255,0.4)' }}>
            {n}
          </button>
        ))}
        <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition">
          <ChevronRight className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
export default function VideosPage() {
  const navigate = useNavigate()
  const [videos, setVideos]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingId, setEditingId]   = useState(null)
  const [actionId, setActionId]     = useState(null)

  const LIMIT = 10

  /* ── fetch ── */
  const fetchVideos = useCallback(() => {
    setLoading(true)
    adminApi.listAllVideos({ page, limit: LIMIT })
      .then(res => {
        const d = res.data
        setVideos(d.data?.videos || d.data || [])
        setTotalPages(d.data?.totalPages || d.totalPages || 1)
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { fetchVideos() }, [fetchVideos])

  /* ── toggle published ── */
  const togglePublish = async (video) => {
    setActionId(video._id)
    try {
      await videoApi.update(video._id, { isPublished: !video.isPublished })
      setVideos(prev => prev.map(v => v._id === video._id ? { ...v, isPublished: !v.isPublished } : v))
    } catch { /* silent */ } finally { setActionId(null) }
  }

  /* ── delete ── */
  const deleteVideo = async (video) => {
    if (!window.confirm(`Archive/delete "${video.title}"? This cannot be undone.`)) return
    setActionId(video._id)
    try {
      await videoApi.delete(video._id)
      setVideos(prev => prev.filter(v => v._id !== video._id))
    } catch { /* silent */ } finally { setActionId(null) }
  }

  /* ── inline edit save ── */
  const handleEditSave = (updated) => {
    setVideos(prev => prev.map(v => v._id === updated._id ? updated : v))
    setEditingId(null)
  }

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <AdminLayout>
      <div className="p-5 md:p-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Videos</h1>
            <p className="text-sm text-white/40 mt-0.5">Manage all video content on the platform.</p>
          </div>
          <button
            onClick={() => navigate('/admin/upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e' }}
          >
            <Plus className="w-4 h-4" />
            Upload New Video
          </button>
        </div>

        {/* ── Table card ── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-white/30 text-[11px] uppercase tracking-widest border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <th className="text-left px-5 py-3 font-semibold">Thumbnail</th>
                  <th className="text-left px-5 py-3 font-semibold">Title</th>
                  <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Status</th>
                  <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Published</th>
                  <th className="text-left px-5 py-3 font-semibold hidden lg:table-cell">Price</th>
                  <th className="text-left px-5 py-3 font-semibold hidden lg:table-cell">Created</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#4DD0E1] mx-auto" />
                    </td>
                  </tr>
                ) : videos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <Film className="w-10 h-10 text-white/15 mx-auto mb-3" />
                      <p className="text-white/30 text-sm">No videos found.</p>
                    </td>
                  </tr>
                ) : videos.flatMap(video => {
                  const rows = [(
                    <tr key={video._id} className="transition hover:bg-white/[0.025]">
                      {/* Thumbnail */}
                      <td className="px-5 py-3">
                        {video.thumbnailUrl
                          ? <img src={video.thumbnailUrl} alt="" className="w-[60px] h-[40px] object-cover rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                          : <div className="w-[60px] h-[40px] rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <Film className="w-4 h-4 text-white/20" />
                            </div>
                        }
                      </td>

                      {/* Title */}
                      <td className="px-5 py-3">
                        <p className="text-white/85 font-semibold truncate max-w-[160px]">{video.title}</p>
                        <p className="text-white/30 text-xs truncate max-w-[160px]">{video.category || '—'}</p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <StatusBadge status={video.status} />
                      </td>

                      {/* Published toggle */}
                      <td className="px-5 py-3 hidden md:table-cell">
                        <button
                          onClick={() => togglePublish(video)}
                          disabled={actionId === video._id}
                          className="flex items-center gap-1.5 text-xs font-bold transition disabled:opacity-40"
                          style={{ color: video.isPublished ? '#4DD0E1' : 'rgba(255,255,255,0.3)' }}
                        >
                          {actionId === video._id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : video.isPublished
                              ? <Eye className="w-3.5 h-3.5" />
                              : <EyeOff className="w-3.5 h-3.5" />
                          }
                          {video.isPublished ? 'Live' : 'Hidden'}
                        </button>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3 hidden lg:table-cell text-white/55 text-xs">
                        {video.price > 0 ? `₹${video.price}` : <span className="text-[#C0E863]">Free</span>}
                      </td>

                      {/* Created */}
                      <td className="px-5 py-3 hidden lg:table-cell text-white/35 text-xs">
                        {fmtDate(video.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingId(editingId === video._id ? null : video._id)}
                            title="Edit metadata"
                            className="p-1.5 rounded-lg transition hover:bg-white/10"
                            style={{ color: editingId === video._id ? '#4DD0E1' : 'rgba(255,255,255,0.4)' }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteVideo(video)}
                            disabled={actionId === video._id}
                            title="Delete video"
                            className="p-1.5 rounded-lg transition disabled:opacity-40 hover:bg-red-500/15"
                            style={{ color: 'rgba(248,113,113,0.65)' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )]

                  if (editingId === video._id) {
                    rows.push(
                      <EditForm
                        key={`edit-${video._id}`}
                        video={video}
                        onSave={handleEditSave}
                        onCancel={() => setEditingId(null)}
                      />
                    )
                  }

                  return rows
                })}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>

      </div>
    </AdminLayout>
  )
}
