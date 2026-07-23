import { useState, useEffect } from 'react'
import { Users, Film, DollarSign, Radio, TrendingUp, TrendingDown, Eye, Star, MoreHorizontal, ArrowUpRight, Loader2 } from 'lucide-react'
import AdminLayout from '../components/layout/AdminLayout'
import { adminApi } from '../api/index.js'

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

const recentActivities = []

const typeStyles = {
  user:    { dot: '#4DD0E1',  bg: 'rgba(77,208,225,0.12)'  },
  content: { dot: '#C0E863',  bg: 'rgba(192,232,99,0.12)'  },
  payment: { dot: '#34d399',  bg: 'rgba(52,211,153,0.12)'  },
  live:    { dot: '#f87171',  bg: 'rgba(248,113,113,0.12)' },
  alert:   { dot: '#fb923c',  bg: 'rgba(251,146,60,0.12)'  },
  cancel:  { dot: '#94a3b8',  bg: 'rgba(148,163,184,0.12)' },
}

const topContent = []

const statusStyles = {
  Live:      { color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
  Published: { color: '#4DD0E1', bg: 'rgba(77,208,225,0.12)'  },
  Free:      { color: '#C0E863', bg: 'rgba(192,232,99,0.12)'  },
}

/* ═══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
            March 1, 2026
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

          {/* Recent Activity */}
          <div
            className="lg:col-span-2 rounded-2xl p-5 border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Recent Activity</h2>
              <button className="text-[11px] text-[#4DD0E1] font-bold hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((item, i) => {
                const s = typeStyles[item.type]
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition hover:bg-white/5" style={{ background: s.bg }}>
                    <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: s.dot }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white/80 truncate">{item.action}</p>
                      <p className="text-[11px] text-white/40 truncate">{item.detail}</p>
                    </div>
                    <span className="text-[10px] text-white/30 shrink-0">{item.time}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Content */}
          <div
            className="lg:col-span-3 rounded-2xl p-5 border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Top Content</h2>
              <button className="p-1 hover:bg-white/10 rounded-lg transition"><MoreHorizontal className="w-4 h-4 text-white/40" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/30 uppercase tracking-widest">
                    <th className="text-left pb-3 font-semibold">Title</th>
                    <th className="text-right pb-3 font-semibold hidden sm:table-cell">Views</th>
                    <th className="text-right pb-3 font-semibold hidden md:table-cell">Revenue</th>
                    <th className="text-right pb-3 font-semibold">Rating</th>
                    <th className="text-right pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {topContent.map((row, i) => (
                    <tr key={i} className="hover:bg-white/4 transition">
                      <td className="py-3 pr-4">
                        <p className="text-white/85 font-semibold truncate max-w-[160px]">{row.title}</p>
                        <p className="text-white/35 truncate max-w-[160px]">{row.creator}</p>
                      </td>
                      <td className="py-3 text-right text-white/55 hidden sm:table-cell">{row.views}</td>
                      <td className="py-3 text-right text-emerald-400 font-bold hidden md:table-cell">{row.revenue}</td>
                      <td className="py-3 text-right">
                        <span className="flex items-center justify-end gap-1 text-[#C0E863]">
                          <Star className="w-3 h-3" fill="currentColor" />
                          <span className="text-white/70">{row.rating}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: statusStyles[row.status].bg, color: statusStyles[row.status].color }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Bottom row: Quick stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* New Users Today */}
          <div className="rounded-2xl p-5 border" style={{ background: 'rgba(77,208,225,0.06)', borderColor: 'rgba(77,208,225,0.15)' }}>
            <p className="text-xs font-black uppercase tracking-widest text-[#4DD0E1] mb-3">New Users Today</p>
            <p className="text-3xl font-black text-white mb-1">142</p>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /><span>+23% vs yesterday</span>
            </div>
            {/* Simple bar chart */}
            <div className="mt-4 flex items-end gap-1 h-10">
              {[55, 70, 45, 90, 60, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 6 ? 'linear-gradient(180deg,#4DD0E1,#C0E863)' : 'rgba(77,208,225,0.25)' }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              {['M','T','W','T','F','S','S'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>

          {/* Revenue This Month */}
          <div className="rounded-2xl p-5 border" style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.15)' }}>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">Revenue This Month</p>
            <p className="text-3xl font-black text-white mb-1">$124,582</p>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /><span>+18.7% vs last month</span>
            </div>
            <div className="mt-4 flex items-end gap-1 h-10">
              {[40, 65, 55, 75, 50, 85, 100].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 6 ? '#34d399' : 'rgba(52,211,153,0.25)' }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              {['W1','W2','W3','W4','W5','W6','W7'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>

          {/* Content Breakdown */}
          <div className="rounded-2xl p-5 border" style={{ background: 'rgba(192,232,99,0.05)', borderColor: 'rgba(192,232,99,0.15)' }}>
            <p className="text-xs font-black uppercase tracking-widest text-[#C0E863] mb-3">Content Breakdown</p>
            <div className="space-y-3">
              {[
                { label: 'Shows & Series',  count: 1241, pct: 32, color: '#4DD0E1' },
                { label: 'Stand-Up Comedy',  count: 892,  pct: 23, color: '#C0E863' },
                { label: 'Podcasts',         count: 734,  pct: 19, color: '#34d399' },
                { label: 'Live Events',      count: 521,  pct: 14, color: '#f87171' },
                { label: 'Documentaries',    count: 454,  pct: 12, color: '#a78bfa' },
              ].map(({ label, count, pct, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-white/60">{label}</span>
                    <span className="text-white/40">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
