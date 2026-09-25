import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit3, Loader2, CheckCircle, Bookmark } from 'lucide-react'
import { toast } from '../../context/ToastContext'
import AdminLayout from '../../components/layout/AdminLayout'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { specialtyApi } from '../../api/index.js'

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [actionId, setActionId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', description: '', icon: '🎨' })
  
  const fetchSpecialties = useCallback(() => {
    setLoading(true)
    specialtyApi.list()
      .then(res => setSpecialties(res.data?.data || []))
      .catch(() => setSpecialties([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchSpecialties() }, [fetchSpecialties])

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, specialty: null })
  
  const confirmDelete = (specialty) => {
    setDeleteModal({ isOpen: true, specialty })
  }

  const handleConfirmDelete = async () => {
    const specialty = deleteModal.specialty
    if (!specialty) return
    setDeleteModal({ isOpen: false, specialty: null })
    setActionId(specialty._id)
    try {
      await specialtyApi.delete(specialty._id)
      setSpecialties(prev => prev.filter(g => g._id !== specialty._id))
      toast.success('Specialty deleted permanently')
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to delete specialty')
    } finally { 
      setActionId(null) 
    }
  }

  const handleAdd = async () => {
    if (!addForm.name.trim()) return toast.error('Name is required')
    setActionId('add')
    try {
      const res = await specialtyApi.create(addForm)
      setSpecialties(prev => [...prev, res.data.data])
      setIsAdding(false)
      setAddForm({ name: '', description: '', icon: '🎨' })
      toast.success('Specialty added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add specialty')
    } finally {
      setActionId(null)
    }
  }

  const handleEditSave = async (id, updatedForm) => {
    setActionId(id)
    try {
      const res = await specialtyApi.update(id, updatedForm)
      setSpecialties(prev => prev.map(g => g._id === id ? res.data.data : g))
      setEditingId(null)
      toast.success('Specialty updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update specialty')
    } finally {
      setActionId(null)
    }
  }

  const EditRow = ({ specialty, onSave, onCancel }) => {
    const [form, setForm] = useState({ name: specialty.name, description: specialty.description || '', icon: specialty.icon || '🎨' })
    return (
      <tr style={{ background: 'rgba(77,208,225,0.04)' }}>
        <td colSpan={3} className="px-5 py-4">
          <div className="flex gap-4 items-start">
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  placeholder="Icon (Emoji)"
                  className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center text-sm text-white outline-none focus:border-[#4DD0E1]/50 transition"
                />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Specialty Name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#4DD0E1]/50 transition"
                />
              </div>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#4DD0E1]/50 transition resize-none"
              />
            </div>
            <div className="flex flex-col gap-2 shrink-0 pt-1">
              <button
                onClick={() => onSave(specialty._id, form)}
                disabled={actionId === specialty._id}
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 w-24"
                style={{ background: '#4DD0E1', color: '#051d2e' }}
              >
                {actionId === specialty._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                Save
              </button>
              <button
                onClick={onCancel}
                disabled={actionId === specialty._id}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition w-24"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <AdminLayout>
      <div className="p-5 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Specialties</h1>
            <p className="text-sm text-white/40 mt-0.5">Manage video specialties for the platform.</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e' }}
          >
            <Plus className="w-4 h-4" />
            Add Specialty
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-[11px] uppercase tracking-widest border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <th className="text-left px-5 py-3 font-semibold w-1/3">Name</th>
                  <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell w-1/2">Description</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {/* Add Row */}
                {isAdding && (
                  <tr style={{ background: 'rgba(77,208,225,0.04)' }}>
                    <td colSpan={3} className="px-5 py-4 border-b border-[#4DD0E1]/20">
                      <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={addForm.icon}
                              onChange={e => setAddForm({ ...addForm, icon: e.target.value })}
                              placeholder="Icon (Emoji)"
                              className="w-16 bg-white/5 border border-[#4DD0E1]/30 rounded-lg px-2 py-1.5 text-center text-sm text-white outline-none focus:border-[#4DD0E1] transition"
                            />
                            <input
                              type="text"
                              value={addForm.name}
                              onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                              placeholder="New Specialty Name"
                              autoFocus
                              className="w-full bg-white/5 border border-[#4DD0E1]/30 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#4DD0E1] transition"
                            />
                          </div>
                          <textarea
                            value={addForm.description}
                            onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                            placeholder="Description"
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#4DD0E1]/50 transition resize-none"
                          />
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 pt-1">
                          <button
                            onClick={handleAdd}
                            disabled={actionId === 'add' || !addForm.name.trim()}
                            className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 w-24"
                            style={{ background: '#4DD0E1', color: '#051d2e' }}
                          >
                            {actionId === 'add' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            Create
                          </button>
                          <button
                            onClick={() => { setIsAdding(false); setAddForm({ name: '', description: '', icon: '🎨' }); }}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold transition w-24"
                            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#4DD0E1] mx-auto" />
                    </td>
                  </tr>
                ) : specialties.length === 0 && !isAdding ? (
                  <tr>
                    <td colSpan={3} className="py-20 text-center">
                      <Bookmark className="w-10 h-10 text-white/15 mx-auto mb-3" />
                      <p className="text-white/30 text-sm">No specialties found.</p>
                    </td>
                  </tr>
                ) : (
                  specialties.map(specialty => {
                    if (editingId === specialty._id) {
                      return <EditRow key={specialty._id} specialty={specialty} onSave={handleEditSave} onCancel={() => setEditingId(null)} />
                    }
                    return (
                      <tr key={specialty._id} className="transition hover:bg-white/[0.025]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{specialty.icon || '🎨'}</span>
                            <p className="text-white/85 font-bold">{specialty.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <p className="text-white/40 text-xs truncate max-w-sm">{specialty.description || '—'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingId(specialty._id)}
                              title="Edit specialty"
                              className="p-1.5 rounded-lg transition hover:bg-white/10 text-white/40 hover:text-[#4DD0E1]"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => confirmDelete(specialty)}
                              title="Delete specialty"
                              className="p-1.5 rounded-lg transition hover:bg-red-500/15 text-red-400/65"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Specialty"
        message={`Are you sure you want to permanently delete "${deleteModal.specialty?.name}"?`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, specialty: null })}
      />
    </AdminLayout>
  )
}
