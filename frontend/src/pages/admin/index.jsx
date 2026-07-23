import { useState, useEffect } from 'react'
import { Users, Film, DollarSign, Radio, TrendingUp, TrendingDown, Star, ArrowUpRight, Loader2, UserPlus, Video } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { adminApi } from '../../api/index.js'

/* ─── helpers ─────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, change, up, accent }) => (
  <div
    className="rounded-2xl p-5 border flex flex-col gap-3 relative overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
  >
    {/* accent blob */}
    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl" style={{ background: accent }} />

    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change}
      </span>
    </div>

    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-white/40 font-medium mt-0.5">{label}</p>
    </div>
  </div>
)

const typeStyles = {
  user:    { dot: '#4DD0E1',  bg: 'rgba(77,208,225,0.12)'  },
  content: { dot: '#C0E863',  bg: 'rgba(192,232,99,0.12)'  },
}

/* ═══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'

  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
  const fmtRev = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n?.toFixed(0) || 0}`
  return (
    <AdminLayout>
      <div className="p-5 md:p-8 space-y-8">

        {/* ── Page heading ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Overview</h1>
            <p className="text-sm text-white/40 mt-0.5">Welcome back, Admin. Here's what's happening today.</p>
          </div>
          <div className="text-xs font-mono text-white/30">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}      label="Total Users"     value={loading ? '...' : fmt(stats?.totalUsers || 0)}     change="+Users"  up accent="#4DD0E1" />
          <StatCard icon={Film}       label="Total Content"   value={loading ? '...' : fmt(stats?.totalVideos || 0)}    change="+Videos" up accent="#C0E863" />
          <StatCard icon={DollarSign} label="Total Revenue"   value={loading ? '...' : fmtRev(stats?.totalRevenueInr)} change="+Revenue" up accent="#34d399" />
          <StatCard icon={Radio}      label="Published"       value={loading ? '...' : fmt(stats?.publishedVideos || 0)} change="Live"   up accent="#f87171" />
        </div>

        {/* ── Middle row: Activity + Top Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Recent Activity — real data from /api/admin/stats */}
          <div
            className="lg:col-span-2 rounded-2xl p-5 border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Recent Registrations</h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                [1,2,3,4].map(i => (
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                ))
              ) : (stats?.recentUsers?.length ? stats.recentUsers.map((u) => (
                <div key={u._id} className="flex items-start gap-3 p-3 rounded-xl transition hover:bg-white/5" style={{ background: typeStyles.user.bg }}>
                  <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: typeStyles.user.dot }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white/80 truncate">{u.name || 'New User'}</p>
                    <p className="text-[11px] text-white/40 truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] text-white/30 shrink-0 flex items-center gap-1">
                    <UserPlus className="w-3 h-3" /> {fmtDate(u.createdAt)}
                  </span>
                </div>
              )) : (
                <p className="text-white/25 text-xs text-center py-6">No recent users</p>
              ))}
            </div>
          </div>

          {/* Recent Videos — real data from /api/admin/stats */}
          <div
            className="lg:col-span-3 rounded-2xl p-5 border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Recent Content</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/30 uppercase tracking-widest">
                    <th className="text-left pb-3 font-semibold">Title</th>
                    <th className="text-right pb-3 font-semibold hidden sm:table-cell">Views</th>
                    <th className="text-right pb-3 font-semibold hidden md:table-cell">Price</th>
                    <th className="text-right pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    [1,2,3,4,5].map(i => (
                      <tr key={i}>
                        <td colSpan={4} className="py-3">
                          <div className="h-8 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                        </td>
                      </tr>
                    ))
                  ) : (stats?.recentVideos?.length ? stats.recentVideos.map((v) => (
                    <tr key={v._id} className="hover:bg-white/4 transition">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Video className="w-3.5 h-3.5 text-white/30 shrink-0" />
                          <div>
                            <p className="text-white/85 font-semibold truncate max-w-[180px]">{v.title}</p>
                            <p className="text-white/35 text-[10px]">{fmtDate(v.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right text-white/55 hidden sm:table-cell">
                        {v.viewCount > 0 ? fmt(v.viewCount) : '—'}
                      </td>
                      <td className="py-3 text-right text-emerald-400 font-bold hidden md:table-cell">
                        {v.price > 0 ? `₹${v.price}` : <span className="text-[#C0E863]">Free</span>}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                          style={v.isPublished
                            ? { background: 'rgba(77,208,225,0.12)', color: '#4DD0E1' }
                            : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }
                          }
                        >
                          {v.status === 'ready' ? (v.isPublished ? 'Live' : 'Hidden') : v.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-white/25 text-xs">No content yet</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>



      </div>
    </AdminLayout>
  )
}
