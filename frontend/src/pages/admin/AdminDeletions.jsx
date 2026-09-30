import { useState, useEffect } from 'react'
import { Trash2, AlertCircle, Calendar, MessageSquare, Loader2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { adminApi } from '../../api/index.js'

export default function AdminDeletions() {
  const [deletions, setDeletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchDeletions(page)
  }, [page])

  const fetchDeletions = async (pageNum) => {
    setLoading(true)
    setError('')
    try {
      const res = await adminApi.getAccountDeletions({ page: pageNum, limit: 20 })
      if (res.data.success) {
        setDeletions(res.data.data.deletions)
        setTotalPages(Math.ceil(res.data.data.total / res.data.data.limit))
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load deletions')
    } finally {
      setLoading(false)
    }
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <AdminLayout>
      <div className="p-5 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Account Deletions Feedback</h1>
            <p className="text-sm text-white/40 mt-1">Review reasons why users left the platform.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                  <th className="px-5 py-4 font-bold text-white/40 uppercase tracking-wider text-xs">Date</th>
                  <th className="px-5 py-4 font-bold text-white/40 uppercase tracking-wider text-xs">Reason</th>
                  <th className="px-5 py-4 font-bold text-white/40 uppercase tracking-wider text-xs w-full">Message / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: 'rgba(255,255,255,0.05)' }}>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-5 py-12 text-center text-white/40">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: '#4DD0E1' }} />
                      Loading feedback...
                    </td>
                  </tr>
                ) : deletions.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-5 py-12 text-center text-white/40">
                      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Trash2 className="w-5 h-5 text-white/20" />
                      </div>
                      No account deletions recorded yet.
                    </td>
                  </tr>
                ) : (
                  deletions.map((del) => (
                    <tr key={del._id} className="transition-colors hover:bg-white/5">
                      <td className="px-5 py-4 text-white/60">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-white/30" />
                          {fmtDate(del.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(77,208,225,0.1)', color: '#4DD0E1' }}>
                          {del.reason}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/80 whitespace-normal min-w-[300px]">
                        {del.message ? (
                          <div className="flex gap-2">
                            <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-white/30" />
                            <p className="text-sm italic leading-relaxed">{del.message}</p>
                          </div>
                        ) : (
                          <span className="text-white/20 italic text-xs">No additional details provided</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition disabled:opacity-30 border"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
              >
                Prev
              </button>
              <span className="text-sm text-white/50 px-4">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition disabled:opacity-30 border"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
