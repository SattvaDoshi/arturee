import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, X, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from '../../context/ToastContext'
import AdminLayout from '../../components/layout/AdminLayout'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { adminApi, artistApi } from '../../api/index.js'

/* ─── Default empty form ─────────────────────────────── */
const EMPTY_FORM = {
  name:       '',
  bio:        '',
  genre:      '',
  avatarUrl:  '',
  emoticonCount: 0,
  instagram:  '',
  twitter:    '',
  website:    '',
}

/* ─── Artist form modal ──────────────────────────────── */
const ArtistFormModal = ({ initial, onClose, onSaved }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const isEdit = Boolean(initial?._id)

  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageUpload = async (e, key) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await adminApi.uploadImage(formData)
      if (res.data?.data?.url) {
        setForm(f => ({ ...f, [key]: res.data.data.url }))
      }
    } catch (err) {
      alert('Failed to upload image')
      console.error(err)
    } finally {
      setUploadingImage(false)
    }
  }

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    setError('')
    try {
      const res = isEdit
        ? await artistApi.update(initial._id, form)
        : await artistApi.create(form)
      onSaved(res.data?.data || res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally { setSaving(false) }
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#4DD0E1]/50 placeholder-white/25 transition"

  const imageUploadField = (key, label) => (
    <div>
      <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={form[key]}
          onChange={set(key)}
          placeholder="https://…"
          className={inputCls}
        />
        <label className={`shrink-0 cursor-pointer px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center ${uploadingImage ? 'opacity-50 pointer-events-none' : 'hover:bg-white/10'}`} style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)' }}>
          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, key)} />
        </label>
      </div>
    </div>
  )

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,29,46,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-6 space-y-4 relative"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black uppercase tracking-widest text-white">
            {isEdit ? 'Edit Artist' : 'Add Artist'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input value={form.name} onChange={set('name')} placeholder="Artist name" className={inputCls} />
          </div>

          {/* Genre + AvatarUrl row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Genre</label>
              <input value={form.genre} onChange={set('genre')} placeholder="e.g. Jazz" className={inputCls} />
            </div>
            {imageUploadField('avatarUrl', 'Avatar URL')}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Emoticons ❤️ Count</label>
              <input type="number" value={form.emoticonCount || 0} onChange={set('emoticonCount')} placeholder="0" className={inputCls} />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              placeholder="Short artist biography…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Social links */}
          <div className="grid grid-cols-3 gap-3">
            {[['instagram', 'Instagram'], ['twitter', 'Twitter/X'], ['website', 'Website']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">{label}</label>
                <input value={form[key]} onChange={set(key)} placeholder="https://…" className={inputCls} />
              </div>
            ))}
          </div>

          {/* Error */}
          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50 hover:opacity-90"
              style={{ background: '#4DD0E1', color: '#051d2e' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {isEdit ? 'Save Changes' : 'Create Artist'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-bold transition hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Artist card ────────────────────────────────────── */
const ArtistCard = ({ artist, onEdit, onDelete }) => (
  <div
    className="rounded-2xl border p-5 flex flex-col gap-4 relative overflow-hidden transition hover:border-white/15"
    style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
  >
    {/* Accent blob */}
    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10 blur-3xl" style={{ background: '#4DD0E1' }} />

    {/* Avatar + name */}
    <div className="flex items-center gap-3">
      {artist.avatarUrl
        ? <img src={artist.avatarUrl} alt={artist.name} className="w-12 h-12 rounded-xl object-cover shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
        : (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0"
            style={{ background: 'rgba(77,208,225,0.12)', color: '#4DD0E1' }}
          >
            {(artist.name || '?')[0].toUpperCase()}
          </div>
        )
      }
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-white font-bold text-sm truncate">{artist.name}</p>
          {artist.isVerified && (
            <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#4DD0E1' }} />
          )}
        </div>
        {artist.genre && <p className="text-[#C0E863] text-xs font-semibold">{artist.genre}</p>}
      </div>
    </div>

    {/* Bio */}
    {artist.bio && (
      <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{artist.bio}</p>
    )}

    {/* Video count */}
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-white/30">
        {artist.videoCount ?? 0} video{(artist.videoCount ?? 0) !== 1 ? 's' : ''}
      </span>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onEdit(artist)}
          className="p-1.5 rounded-lg transition hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          title="Edit"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(artist)}
          className="p-1.5 rounded-lg transition hover:bg-red-500/15"
          style={{ color: 'rgba(248,113,113,0.6)' }}
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════ */
export default function ArtistsPage() {
  const [artists, setArtists]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [modalData, setModalData] = useState(null) // null = closed, {} = new, artist = edit
  const [isOpen, setIsOpen]     = useState(false)

  /* ── fetch ── */
  useEffect(() => {
    setLoading(true)
    artistApi.list()
      .then(res => {
        const d = res.data
        setArtists(d.data?.artists || d.data || [])
      })
      .catch(() => setArtists([]))
      .finally(() => setLoading(false))
  }, [])

  /* ── open modal ── */
  const openAdd  = () => { setModalData(null); setIsOpen(true) }
  const openEdit = (artist) => { setModalData(artist); setIsOpen(true) }
  const closeModal = () => setIsOpen(false)

  /* ── after save ── */
  const handleSaved = (saved) => {
    if (saved?._id) {
      setArtists(prev => {
        const exists = prev.find(a => a._id === saved._id)
        return exists
          ? prev.map(a => a._id === saved._id ? saved : a)
          : [saved, ...prev]
      })
    }
  }

  /* ── delete ── */
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, artist: null })

  const confirmDelete = (artist) => {
    setDeleteModal({ isOpen: true, artist })
  }

  const handleConfirmDelete = async () => {
    const artist = deleteModal.artist
    if (!artist) return

    setDeleteModal({ isOpen: false, artist: null })
    try {
      await artistApi.delete(artist._id)
      setArtists(prev => prev.filter(a => a._id !== artist._id))
      toast.success('Artist deleted permanently')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete artist')
    }
  }

  return (
    <AdminLayout>
      <div className="p-5 md:p-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Artists</h1>
            <p className="text-sm text-white/40 mt-0.5">Manage artist profiles on the platform.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e' }}
          >
            <Plus className="w-4 h-4" />
            Add Artist
          </button>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#4DD0E1]" />
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-24">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(77,208,225,0.08)', border: '1px solid rgba(77,208,225,0.15)' }}
            >
              <Plus className="w-7 h-7 text-[#4DD0E1]" />
            </div>
            <p className="text-white/30 text-sm mb-4">No artists yet. Add the first one!</p>
            <button
              onClick={openAdd}
              className="px-5 py-2 rounded-xl text-sm font-bold transition hover:opacity-90"
              style={{ background: '#4DD0E1', color: '#051d2e' }}
            >
              Add Artist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artists.map(artist => (
              <ArtistCard
                key={artist._id}
                artist={artist}
                onEdit={openEdit}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Modal ── */}
      {isOpen && (
        <ArtistFormModal
          initial={modalData}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Artist"
        message={`Are you sure you want to permanently delete "${deleteModal.artist?.name}"?`}
        confirmText="Delete Artist"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, artist: null })}
      />
    </AdminLayout>
  )
}
