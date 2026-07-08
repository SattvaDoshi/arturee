import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, Shield, User, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { adminApi } from '../../api/index.js'

/* ─── Role Badge ─────────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const isAdmin = role === 'admin'
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={
        isAdmin
          ? { background: 'rgba(77,208,225,0.15)', color: '#4DD0E1', border: '1px solid rgba(77,208,225,0.3)' }
          : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
      }
    >
      {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
      {isAdmin ? 'Admin' : 'User'}
    </span>
  )
}

/* ─── Pagination ─────────────────────────────────────── */
const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .reduce((acc, n, idx, arr) => {
      if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…')
      acc.push(n)
      return acc
    }, [])

  return (
    <div
      className="flex items-center justify-between px-5 py-3 border-t text-sm"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <span className="text-white/30 text-xs">Page {page} of {totalPages}</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg transition hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4 text-white/60" />
        </button>
        {pages.map((n, i) =>
          n === '…'
            ? <span key={`e${i}`} className="px-1 text-white/25 text-xs">…</span>
            : (
              <button
                key={n}
                onClick={() => onChange(n)}
                className="w-7 h-7 rounded-lg text-xs font-bold transition"
                style={n === page ? { background: '#4DD0E1', color: '#051d2e' } : { color: 'rgba(255,255,255,0.4)' }}
              >
                {n}
              </button>
            )
        )}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg transition hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
export default function UsersPage() {
  const [users, setUsers]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage]               = useState(1)
  const [totalPages, setTotalPages]   = useState(1)
  const [actionId, setActionId]       = useState(null)

  /* ── fetch ── */
  const fetchUsers = useCallback(() => {
    setLoading(true)
    adminApi.listUsers({ page, search: search || undefined })
      .then(res => {
        const d = res.data
        setUsers(d.data?.users || d.data || [])
        setTotalPages(d.data?.totalPages || d.totalPages || 1)
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  /* ── role toggle ── */
  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    setActionId(user._id)
    try {
      await adminApi.updateUserRole(user._id, newRole)
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u))
    } catch { /* silent */ } finally { setActionId(null) }
  }

  /* ── delete ── */
  const deleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.name || user.email}"? This cannot be undone.`)) return
    setActionId(user._id)
    try {
      await adminApi.deleteUser(user._id)
      setUsers(prev => prev.filter(u => u._id !== user._id))
    } catch { /* silent */ } finally { setActionId(null) }
  }

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <AdminLayout>
      <div className="p-5 md:p-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Users</h1>
            <p className="text-sm text-white/40 mt-0.5">Manage registered users and their roles.</p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <Search className="w-4 h-4 text-white/30 shrink-0" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search name or email…"
                className="bg-transparent outline-none text-white placeholder-white/25 w-48"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-bold transition hover:opacity-90"
              style={{ background: '#4DD0E1', color: '#051d2e' }}
            >
              Search
            </button>
          </form>
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
                  <th className="text-left px-5 py-3 font-semibold">Name</th>
                  <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Email</th>
                  <th className="text-left px-5 py-3 font-semibold">Role</th>
                  <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Joined</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#4DD0E1] mx-auto" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <User className="w-10 h-10 text-white/15 mx-auto mb-3" />
                      <p className="text-white/30 text-sm">No users found.</p>
                    </td>
                  </tr>
                ) : users.map(user => (
                  <tr key={user._id} className="transition hover:bg-white/[0.025]">
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                          style={{ background: 'rgba(77,208,225,0.12)', color: '#4DD0E1' }}
                        >
                          {(user.name || user.email || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-white/85 font-medium truncate max-w-[130px]">
                          {user.name || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-white/45 hidden sm:table-cell text-xs">
                      {user.email}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-3.5 text-white/35 text-xs hidden md:table-cell">
                      {fmtDate(user.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleRole(user)}
                          disabled={actionId === user._id}
                          title={user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition disabled:opacity-40"
                          style={
                            user.role === 'admin'
                              ? { background: 'rgba(77,208,225,0.12)', color: '#4DD0E1', border: '1px solid rgba(77,208,225,0.25)' }
                              : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }
                          }
                        >
                          {actionId === user._id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Shield className="w-3 h-3" />
                          }
                          {user.role === 'admin' ? 'Revoke' : 'Make Admin'}
                        </button>

                        <button
                          onClick={() => deleteUser(user)}
                          disabled={actionId === user._id}
                          title="Delete user"
                          className="p-1.5 rounded-lg transition disabled:opacity-40 hover:bg-red-500/15"
                          style={{ color: 'rgba(248,113,113,0.65)' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>

      </div>
    </AdminLayout>
  )
}
