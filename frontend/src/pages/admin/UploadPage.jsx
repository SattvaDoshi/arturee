import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, CheckCircle, ArrowRight, ArrowLeft, Film, Loader2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { videoApi } from '../../api/index.js'
import api from '../../api/index.js'

/* ─── Step indicator ─────────────────────────────────── */
const StepIndicator = ({ current }) => {
  const steps = ['Metadata', 'Upload File', 'Complete']
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1
        const done    = idx < current
        const active  = idx === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all"
                style={
                  done
                    ? { background: '#4DD0E1', color: '#051d2e' }
                    : active
                      ? { background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e', boxShadow: '0 0 20px rgba(77,208,225,0.4)' }
                      : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {done ? <CheckCircle className="w-4 h-4" /> : idx}
              </div>
              <span
                className="text-[10px] font-semibold mt-1.5 uppercase tracking-wider"
                style={{ color: active ? '#4DD0E1' : done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px mx-3 mt-[-14px]"
                style={{ background: done ? '#4DD0E1' : 'rgba(255,255,255,0.1)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Panel wrapper ──────────────────────────────────── */
const Panel = ({ children }) => (
  <div
    className="rounded-2xl border p-6 space-y-5"
    style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
  >
    {children}
  </div>
)

/* ─── Input helpers ──────────────────────────────────── */
const Label = ({ children, required }) => (
  <label className="block text-[10px] text-white/35 font-semibold uppercase tracking-widest mb-1">
    {children}{required && <span className="text-red-400 ml-0.5">*</span>}
  </label>
)

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#4DD0E1]/50 placeholder-white/25 transition"

/* ═══════════════════════════════════════════════════════ */
export default function UploadPage() {
  const navigate = useNavigate()

  /* ── Step state ── */
  const [step, setStep] = useState(1)

  /* ── Step 1: Metadata form ── */
  const [meta, setMeta] = useState({
    title:        '',
    description:  '',
    price:        0,
    category:     'Music',
    tags:         '',
    thumbnailUrl: '',
    artistId:     '',
  })
  const [metaError, setMetaError] = useState('')

  const setM = (key) => (e) =>
    setMeta(m => ({ ...m, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const handleNextStep1 = () => {
    if (!meta.title.trim()) { setMetaError('Title is required.'); return }
    setMetaError('')
    setStep(2)
  }

  /* ── Step 2: File upload ── */
  const fileRef      = useRef(null)
  const [file, setFile]           = useState(null)
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [videoId, setVideoId]     = useState(null)

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type.startsWith('video/')) setFile(dropped)
    else setUploadError('Please drop a valid video file.')
  }

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    if (selected) setFile(selected)
  }

  const handleUpload = async () => {
    if (!file) { setUploadError('Please select a video file.'); return }
    setUploading(true)
    setUploadError('')
    setProgress(0)

    try {
      /* Build FormData — file + all metadata */
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', meta.title)
      formData.append('description', meta.description)
      formData.append('price', String(meta.price))
      formData.append('currency', 'INR')
      formData.append('category', meta.category)
      formData.append('tags', JSON.stringify(
        meta.tags.split(',').map(t => t.trim()).filter(Boolean)
      ))
      if (meta.thumbnailUrl) formData.append('thumbnailUrl', meta.thumbnailUrl)
      if (meta.artistId)     formData.append('artistId', meta.artistId)

      /* POST to backend proxy — no CORS issues */
      const res = await videoApi.proxyUpload(formData, (e) => {
        if (e.total) {
          setProgress(Math.round((e.loaded / e.total) * 95))
        }
      })

      const { videoId: vid } = res.data.data
      setProgress(100)
      setVideoId(vid)
      setTimeout(() => setStep(3), 500)
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  /* ── Step 3: Status ── */
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished]   = useState(false)

  const handlePublish = async () => {
    if (!videoId) return
    setPublishing(true)
    try {
      await api.patch(`/videos/${videoId}/publish`)
      setPublished(true)
    } catch { /* silent */ } finally { setPublishing(false) }
  }

  /* ══════════════════════════════════════════════════ */
  return (
    <AdminLayout>
      <div className="p-5 md:p-8">
        <div className="max-w-2xl mx-auto">

          {/* ── Page heading ── */}
          <div className="mb-8">
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Upload Video</h1>
            <p className="text-sm text-white/40 mt-0.5">Add new video content to the platform.</p>
          </div>

          {/* ── Step indicator ── */}
          <StepIndicator current={step} />

          {/* ══════════════ STEP 1: METADATA ══════════════ */}
          {step === 1 && (
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest text-white/70">Step 1 — Video Details</h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <Label required>Title</Label>
                  <input value={meta.title} onChange={setM('title')} placeholder="Enter video title…" className={inputCls} />
                </div>

                {/* Description */}
                <div>
                  <Label>Description</Label>
                  <textarea
                    value={meta.description}
                    onChange={setM('description')}
                    rows={4}
                    placeholder="Describe the video…"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* Price + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (₹)</Label>
                    <input type="number" min="0" value={meta.price} onChange={setM('price')} className={inputCls} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select value={meta.category} onChange={setM('category')} className={inputCls}>
                      {['Music', 'Comedy', 'Documentary', 'Podcast', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags (comma-separated)</Label>
                  <input value={meta.tags} onChange={setM('tags')} placeholder="jazz, live, acoustic…" className={inputCls} />
                </div>

                {/* Thumbnail + Artist row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Thumbnail URL</Label>
                    <input value={meta.thumbnailUrl} onChange={setM('thumbnailUrl')} placeholder="https://…" className={inputCls} />
                  </div>
                  <div>
                    <Label>Artist ID</Label>
                    <input value={meta.artistId} onChange={setM('artistId')} placeholder="Artist ID…" className={inputCls} />
                  </div>
                </div>

                {metaError && <p className="text-xs text-red-400">{metaError}</p>}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextStep1}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e' }}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Panel>
          )}

          {/* ══════════════ STEP 2: UPLOAD ══════════════ */}
          {step === 2 && (
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest text-white/70">Step 2 — Upload File</h2>

              {/* Info banner */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#4DD0E1]/80"
                style={{ background: 'rgba(77,208,225,0.06)', border: '1px solid rgba(77,208,225,0.15)' }}
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                File uploads securely through the server — no browser CORS issues.
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => !file && fileRef.current?.click()}
                className="relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed py-16 px-8 text-center cursor-pointer transition-all"
                style={{
                  borderColor: dragging ? '#4DD0E1' : file ? 'rgba(192,232,99,0.4)' : 'rgba(255,255,255,0.12)',
                  background: dragging ? 'rgba(77,208,225,0.06)' : file ? 'rgba(192,232,99,0.04)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />

                {file ? (
                  <>
                    <Film className="w-10 h-10" style={{ color: '#C0E863' }} />
                    <div>
                      <p className="text-white font-bold text-sm">{file.name}</p>
                      <p className="text-white/40 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null) }}
                      className="text-xs text-white/30 hover:text-white/60 transition underline"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(77,208,225,0.08)', border: '1px solid rgba(77,208,225,0.15)' }}
                    >
                      <Upload className="w-7 h-7 text-[#4DD0E1]" />
                    </div>
                    <div>
                      <p className="text-white/70 font-semibold text-sm">Drag & drop your video here</p>
                      <p className="text-white/30 text-xs mt-1">or click to browse files</p>
                    </div>
                    <p className="text-white/20 text-xs">MP4, MOV, AVI, MKV supported · up to 2 GB</p>
                  </>
                )}
              </div>

              {/* Progress bar */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Uploading to server…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#4DD0E1,#C0E863)' }}
                    />
                  </div>
                  <p className="text-[10px] text-white/25 text-center">
                    Large files may take a moment — please keep this tab open
                  </p>
                </div>
              )}

              {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}

              {/* Buttons */}
              <div className="flex justify-between pt-1">
                <button
                  onClick={() => setStep(1)}
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition hover:bg-white/10 disabled:opacity-40"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e' }}
                >
                  {uploading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                    : <><Upload className="w-4 h-4" /> Start Upload</>
                  }
                </button>
              </div>
            </Panel>
          )}

          {/* ══════════════ STEP 3: COMPLETE ══════════════ */}
          {step === 3 && (
            <Panel>
              <div className="flex flex-col items-center text-center py-8 gap-5">
                {/* Success icon */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(77,208,225,0.12)', border: '2px solid rgba(77,208,225,0.3)' }}
                >
                  <CheckCircle className="w-10 h-10 text-[#4DD0E1]" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-white mb-1">Upload Complete!</h2>
                  <p className="text-white/40 text-sm">Your video has been uploaded and is being processed.</p>
                </div>

                {videoId && (
                  <div
                    className="px-4 py-2 rounded-xl border text-xs font-mono"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    Video ID: <span className="text-white/70">{videoId}</span>
                  </div>
                )}

                {published ? (
                  <div className="flex items-center gap-2 text-[#C0E863] text-sm font-bold">
                    <CheckCircle className="w-4 h-4" />
                    Published Successfully!
                  </div>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#C0E863', color: '#051d2e' }}
                  >
                    {publishing
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
                      : 'Publish Now'
                    }
                  </button>
                )}

                <button
                  onClick={() => navigate('/admin/videos')}
                  className="flex items-center gap-2 text-sm text-[#4DD0E1] font-semibold hover:underline transition"
                >
                  Go to Videos
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </Panel>
          )}

        </div>
      </div>
    </AdminLayout>
  )
}
