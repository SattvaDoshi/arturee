import { useState, useEffect, useCallback } from 'react'
import {
  Tag, Plus, Trash2, Pencil, X, Loader2, CheckCircle2, AlertCircle,
  Clock, Users, Percent, IndianRupee, ToggleLeft, ToggleRight, Search,
} from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { couponApi } from '../../api/index.js'

/* ── helpers ────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const fmtDateInput = (d) =>
  d ? new Date(d).toISOString().slice(0, 16) : ''

const statusColor = (c) => {
  if (!c.isActive) return { dot: '#f87171', label: 'Inactive' }
  if (c.expiresAt && new Date() > new Date(c.expiresAt)) return { dot: '#f87171', label: 'Expired' }
  if (c.maxUsesTotal !== null && c.usedCount >= c.maxUsesTotal) return { dot: '#fb923c', label: 'Exhausted' }
  return { dot: '#4ade80', label: 'Active' }
}

const EMPTY_FORM = {
  code: '', description: '',
  discountType: 'flat', discountValue: '',
  maxDiscount: '', minCartValue: '',
  expiresAt: '', maxUsesTotal: '', maxUsesPerUser: '',
  isActive: true,
}

/* ══════════════════════════════════════════════════ */
export default function CouponsPage() {
  const [coupons,  setCoupons]  = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(1)
  const [search,   setSearch]   = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]   = useState(null)   // null = create, else coupon object
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  const limit = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await couponApi.list({ page, limit, search: search || undefined })
      const data = res.data.data
      setCoupons(data.coupons)
      setTotal(data.total)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  /* ── open create/edit modal ── */
  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({
      code:         c.code,
      description:  c.description || '',
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      maxDiscount:  c.maxDiscount != null ? String(c.maxDiscount) : '',
      minCartValue: c.minCartValue ? String(c.minCartValue) : '',
      expiresAt:    fmtDateInput(c.expiresAt),
      maxUsesTotal: c.maxUsesTotal != null ? String(c.maxUsesTotal) : '',
      maxUsesPerUser: c.maxUsesPerUser != null ? String(c.maxUsesPerUser) : '',
      isActive:     c.isActive,
    })
    setFormError('')
    setShowModal(true)
  }

  /* ── save ── */
  const handleSave = async () => {
    if (!form.code.trim())         return setFormError('Code is required.')
    if (!form.discountValue)       return setFormError('Discount value is required.')
    if (isNaN(Number(form.discountValue))) return setFormError('Discount value must be a number.')

    setSaving(true)
    setFormError('')
    const payload = {
      code:           form.code.trim().toUpperCase(),
      description:    form.description.trim(),
      discountType:   form.discountType,
      discountValue:  Number(form.discountValue),
      maxDiscount:    form.maxDiscount    ? Number(form.maxDiscount)    : null,
      minCartValue:   form.minCartValue   ? Number(form.minCartValue)   : 0,
      expiresAt:      form.expiresAt      ? form.expiresAt              : null,
      maxUsesTotal:   form.maxUsesTotal   ? Number(form.maxUsesTotal)   : null,
      maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : null,
      isActive:       form.isActive,
    }

    try {
      if (editing) {
        await couponApi.update(editing._id, payload)
      } else {
        await couponApi.create(payload)
      }
      setShowModal(false)
      load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save coupon.')
    } finally {
      setSaving(false)
    }
  }

  /* ── delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await couponApi.delete(deleteTarget._id)
      setDeleteTarget(null)
      load()
    } catch { /* ignore */ }
    finally { setDeleting(false) }
  }

  /* ── quick toggle active ── */
  const toggleActive = async (c) => {
    try {
      await couponApi.update(c._id, { isActive: !c.isActive })
      load()
    } catch { /* ignore */ }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <AdminLayout>
      <div className="p-5 md:p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Tag className="w-6 h-6 text-[#4DD0E1]" /> Coupons
            </h1>
            <p className="text-sm text-white/40 mt-0.5">Create and manage discount coupons for users.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e' }}
          >
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by code…"
            value={search}
            onChange={e => { setSearch(e.target.value.toUpperCase()); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#4DD0E1]/50"
          />
        </div>

        {/* Table */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/30 uppercase tracking-widest border-b border-white/5">
                  {['Code', 'Type', 'Value', 'Uses', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`py-3 px-4 font-semibold ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="py-3 px-4">
                        <div className="h-8 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      </td>
                    </tr>
                  ))
                ) : !coupons.length ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-white/25 text-sm">
                      No coupons yet. Create your first one!
                    </td>
                  </tr>
                ) : coupons.map(c => {
                  const st = statusColor(c)
                  return (
                    <tr key={c._id} className="hover:bg-white/3 transition">
                      {/* Code */}
                      <td className="py-3 px-4">
                        <span className="font-black tracking-widest text-[#4DD0E1]">{c.code}</span>
                        {c.description && <p className="text-white/30 mt-0.5 truncate max-w-[160px]">{c.description}</p>}
                      </td>
                      {/* Type */}
                      <td className="py-3 px-4 text-white/60">
                        <span className="flex items-center gap-1">
                          {c.discountType === 'flat' ? <IndianRupee className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                          {c.discountType}
                        </span>
                      </td>
                      {/* Value */}
                      <td className="py-3 px-4 text-white/80 font-bold">
                        {c.discountType === 'flat'
                          ? `₹${c.discountValue}`
                          : `${c.discountValue}%${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}`}
                        {c.minCartValue > 0 && (
                          <p className="text-white/30 font-normal">min ₹{c.minCartValue}</p>
                        )}
                      </td>
                      {/* Uses */}
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-white/60">
                          <Users className="w-3 h-3" />
                          {c.usedCount} / {c.maxUsesTotal ?? '∞'}
                        </span>
                        {c.maxUsesPerUser && (
                          <p className="text-white/30">{c.maxUsesPerUser}/user</p>
                        )}
                      </td>
                      {/* Expires */}
                      <td className="py-3 px-4 text-white/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {c.expiresAt ? fmtDate(c.expiresAt) : 'Never'}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 font-bold" style={{ color: st.dot }}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: st.dot }} />
                          {st.label}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleActive(c)}
                            className="p-1.5 rounded-lg transition hover:bg-white/10"
                            title={c.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {c.isActive
                              ? <ToggleRight className="w-4 h-4 text-[#4ade80]" />
                              : <ToggleLeft  className="w-4 h-4 text-white/30" />}
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg transition hover:bg-white/10 text-white/50 hover:text-white"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="p-1.5 rounded-lg transition hover:bg-red-500/10 text-white/30 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <p className="text-xs text-white/30">{total} coupons total</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-white/10 text-white/60 transition"
                >Prev</button>
                <span className="px-3 py-1 text-xs text-white/40">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-white/10 text-white/60 transition"
                >Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full max-w-lg rounded-3xl p-6 space-y-5 overflow-y-auto max-h-[90vh]"
            style={{ background: '#0c1929', border: '1px solid rgba(77,208,225,0.2)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">
                {editing ? 'Edit Coupon' : 'New Coupon'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  disabled={!!editing}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold tracking-widest focus:outline-none focus:border-[#4DD0E1]/50 disabled:opacity-50"
                  placeholder="SAVE20"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#4DD0E1]/50"
                  placeholder="20% off on all videos"
                />
              </div>

              {/* Discount type */}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Type *</label>
                <select
                  value={form.discountType}
                  onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#4DD0E1]/50"
                >
                  <option value="flat">Flat (₹)</option>
                  <option value="percent">Percent (%)</option>
                </select>
              </div>

              {/* Discount value */}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">
                  Value * {form.discountType === 'flat' ? '(₹)' : '(%)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max={form.discountType === 'percent' ? 100 : undefined}
                  value={form.discountValue}
                  onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#4DD0E1]/50"
                  placeholder={form.discountType === 'flat' ? '50' : '20'}
                />
              </div>

              {/* Max discount (percent only) */}
              {form.discountType === 'percent' && (
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Max Discount (₹)</label>
                  <input
                    type="number" min="0"
                    value={form.maxDiscount}
                    onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#4DD0E1]/50"
                    placeholder="100"
                  />
                </div>
              )}

              {/* Min cart value */}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Min Cart Value (₹)</label>
                <input
                  type="number" min="0"
                  value={form.minCartValue}
                  onChange={e => setForm(f => ({ ...f, minCartValue: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#4DD0E1]/50"
                  placeholder="0"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Expires At</label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#4DD0E1]/50"
                />
              </div>

              {/* Max uses total */}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Total Use Limit</label>
                <input
                  type="number" min="1"
                  value={form.maxUsesTotal}
                  onChange={e => setForm(f => ({ ...f, maxUsesTotal: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#4DD0E1]/50"
                  placeholder="∞ unlimited"
                />
              </div>

              {/* Max uses per user */}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Limit Per User</label>
                <input
                  type="number" min="1"
                  value={form.maxUsesPerUser}
                  onChange={e => setForm(f => ({ ...f, maxUsesPerUser: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#4DD0E1]/50"
                  placeholder="∞ unlimited"
                />
              </div>

              {/* Active toggle */}
              <div className="col-span-2 flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="text-sm font-bold text-white/70">Active</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className="transition"
                >
                  {form.isActive
                    ? <ToggleRight className="w-8 h-8 text-[#4ade80]" />
                    : <ToggleLeft  className="w-8 h-8 text-white/30" />}
                </button>
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-400">{formError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white/50 hover:bg-white/5 transition"
              >Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e' }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Create Coupon')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full max-w-sm rounded-3xl p-6 space-y-4"
            style={{ background: '#0c1929', border: '1px solid rgba(248,113,113,0.2)' }}
          >
            <h2 className="text-lg font-black text-white">Delete Coupon?</h2>
            <p className="text-sm text-white/50">
              Delete <strong className="text-[#4DD0E1]">{deleteTarget.code}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white/50 hover:bg-white/5 transition"
              >Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500/80 hover:bg-red-500 text-white transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
