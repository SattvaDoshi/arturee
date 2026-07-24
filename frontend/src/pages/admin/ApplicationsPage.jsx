import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Loader2, Link2, Trash2 } from 'lucide-react'
import { toast } from '../../context/ToastContext'
import AdminLayout from '../../components/layout/AdminLayout'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { adminApi } from '../../api/index.js'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [actionId, setActionId] = useState(null)
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, app: null })

  const fetchApplications = () => {
    setLoading(true)
    adminApi.getApplications({ page, limit: 10, status: statusFilter })
      .then(res => {
        setApplications(res.data.data.applications)
        setTotalPages(res.data.data.pagination.totalPages)
      })
      .catch(() => setApplications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchApplications()
  }, [page, statusFilter])

  const handleStatusChange = async (appId, status) => {
    setActionId(appId)
    try {
      await adminApi.updateApplicationStatus(appId, { status })
      setApplications(prev => prev.map(app => app._id === appId ? { ...app, status } : app))
      toast.success(`Application marked as ${status}`)
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setActionId(null)
    }
  }

  const handleConfirmDelete = async () => {
    const app = deleteModal.app
    if (!app) return
    setDeleteModal({ isOpen: false, app: null })
    
    try {
      await adminApi.deleteApplication(app._id)
      setApplications(prev => prev.filter(a => a._id !== app._id))
      toast.success('Application deleted')
    } catch {
      toast.error('Failed to delete application')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      approved: 'bg-[#C0E863]/10 text-[#C0E863] border-[#C0E863]/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    }
    const colorClass = styles[status] || styles.pending
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colorClass}`}>
        {status}
      </span>
    )
  }

  return (
    <AdminLayout>
      <div className="p-5 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Artist Applications</h1>
            <p className="text-sm text-white/40 mt-0.5">Review and manage join requests from artists.</p>
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#4DD0E1]/50 transition"
          >
            <option value="">All Applications</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-[11px] uppercase tracking-widest border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <th className="text-left px-5 py-3 font-semibold">Artist Info</th>
                  <th className="text-left px-5 py-3 font-semibold">Contact</th>
                  <th className="text-left px-5 py-3 font-semibold">Video Link</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-center px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#4DD0E1] mx-auto" />
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-white/40">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  applications.map(app => (
                    <tr key={app._id} className="transition hover:bg-white/[0.025]">
                      <td className="px-5 py-3">
                        <p className="text-white font-semibold">{app.name}</p>
                        <p className="text-white/40 text-xs">{app.email}</p>
                      </td>
                      <td className="px-5 py-3 text-white/70 text-xs space-y-1">
                        <p>Tel: {app.phone}</p>
                        <p>WA: {app.whatsapp}</p>
                      </td>
                      <td className="px-5 py-3">
                        <a 
                          href={app.videoLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#4DD0E1] hover:underline"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          View Drive
                        </a>
                      </td>
                      <td className="px-5 py-3 text-white/50 text-xs">
                        {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            disabled={actionId === app._id}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-[#4DD0E1]/50 transition disabled:opacity-50 cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, app })}
                            className="p-1.5 rounded-lg transition hover:bg-red-500/15 text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <span className="text-white/30 text-xs">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 text-white/50 hover:text-white disabled:opacity-30">
                  &lt; Prev
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 text-white/50 hover:text-white disabled:opacity-30">
                  Next &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Application"
        message={`Are you sure you want to delete the application from "${deleteModal.app?.name}"?`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, app: null })}
      />
    </AdminLayout>
  )
}
