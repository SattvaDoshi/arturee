import { useState, useEffect, useMemo } from 'react'
import {
  IndianRupee, ShoppingBag, TrendingUp, Film, ChevronUp,
  ChevronDown, Loader2, ArrowUpRight, Star, Eye,
} from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { adminApi } from '../../api/index.js'

/* ─── Palette ─────────────────────────────────────── */
const CYAN  = '#4DD0E1'
const LIME  = '#C0E863'
const GREEN = '#34d399'
const RED   = '#f87171'
const PURPLE= '#a78bfa'

/* ─── Helpers ─────────────────────────────────────── */
const inr = (paise, dp = 0) => `₹${(paise / 100).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
const fmt = (n) => n >= 1_00_00_000 ? `₹${(n/1_00_00_000).toFixed(2)}Cr` : n >= 1_00_000 ? `₹${(n/1_00_000).toFixed(2)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${n}`
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/* ─── Stat Card ────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, accent, trend }) => (
  <div className="rounded-2xl p-5 border flex flex-col gap-3 relative overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10 blur-2xl" style={{ background: accent }} />
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {trend >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-white/40 font-medium mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-white/25 mt-1">{sub}</p>}
    </div>
  </div>
)

/* ─── SVG Line Chart ────────────────────────────────── */
const LineChart = ({ data, color = CYAN, height = 140 }) => {
  const W = 100; const H = height
  if (!data?.length) return (
    <div className="flex items-center justify-center text-white/20 text-xs" style={{ height }}>No data yet</div>
  )
  const vals = data.map(d => d.revenue)
  const max  = Math.max(...vals, 1)
  const pts  = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100
    const y = H - (d.revenue / max) * (H - 20) - 8
    return `${x},${y}`
  })
  const pathD = `M ${pts.join(' L ')}`
  const areaD = `M 0,${H} L ${pts.join(' L ')} L 100,${H} Z`
  return (
    <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#lg1)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * 100
        const y = H - (d.revenue / max) * (H - 20) - 8
        return <circle key={i} cx={x} cy={y} r="1.2" fill={color} />
      })}
    </svg>
  )
}

/* ─── SVG Bar Chart (Daily) ─────────────────────────── */
const BarChart = ({ data, color = LIME, height = 120 }) => {
  if (!data?.length) return (
    <div className="flex items-center justify-center text-white/20 text-xs" style={{ height }}>No data yet</div>
  )
  const max = Math.max(...data.map(d => d.revenue), 1)
  const barW = 100 / (data.length * 1.5)
  const gap   = (100 - barW * data.length) / (data.length + 1)
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const barH = Math.max((d.revenue / max) * (height - 12), 2)
        const x = gap + i * (barW + gap)
        const y = height - barH - 4
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="1" fill={color} opacity="0.75" />
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Donut Chart (top 5 videos by revenue share) ────── */
const DonutChart = ({ slices, size = 120 }) => {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1
  const r = 42; const cx = 60; const cy = 60
  let angle = -90
  const paths = slices.slice(0, 5).map((s, i) => {
    const pct   = s.value / total
    const sweep = pct * 360
    const startA = (angle * Math.PI) / 180
    const endA   = ((angle + sweep) * Math.PI) / 180
    const x1 = cx + r * Math.cos(startA)
    const y1 = cy + r * Math.sin(startA)
    const x2 = cx + r * Math.cos(endA)
    const y2 = cy + r * Math.sin(endA)
    const largeArc = sweep > 180 ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
    angle += sweep
    return { d, color: s.color, label: s.label, pct: Math.round(pct * 100) }
  })
  return (
    <svg viewBox="0 0 120 120" style={{ width: size, height: size }}>
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} opacity="0.85" />)}
      <circle cx={cx} cy={cy} r="24" fill="#071523" />
      <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
        {slices.length} Videos
      </text>
    </svg>
  )
}

/* ─── Mini bar for table ─────────────────────────────── */
const MiniBar = ({ pct, color }) => (
  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
  </div>
)

/* ─── Tab button ─────────────────────────────────────── */
const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition"
    style={active
      ? { background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e' }
      : { color: 'rgba(255,255,255,0.45)', background: 'transparent' }}
  >
    {label}
  </button>
)

/* ══════════════════════════════════════════════════════════ */
export default function RevenuePage() {
  const [loading, setLoading] = useState(true)
  const [data, setData]       = useState(null)
  const [tableSort, setTableSort] = useState('revenue') // 'revenue' | 'purchases' | 'views'
  const [chartView, setChartView] = useState('monthly') // 'monthly' | 'daily'

  useEffect(() => {
    adminApi.getRevenue()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  /* ── Derived ── */
  const monthlyData = useMemo(() => {
    if (!data?.monthlyTrend) return []
    return data.monthlyTrend.map(m => ({
      label: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
      revenue: m.revenue,
      purchases: m.purchases,
    }))
  }, [data])

  const dailyData = useMemo(() => {
    if (!data?.dailyTrend) return []
    return data.dailyTrend.map(d => ({
      label: `${d._id.day}/${d._id.month}`,
      revenue: d.revenue,
      purchases: d.purchases,
    }))
  }, [data])

  const chartData = chartView === 'monthly' ? monthlyData : dailyData

  const sortedVideos = useMemo(() => {
    if (!data?.topVideosByRevenue) return []
    return [...data.topVideosByRevenue].sort((a, b) => {
      if (tableSort === 'revenue') return b.revenue - a.revenue
      if (tableSort === 'purchases') return b.purchases - a.purchases
      return (b.viewCount || 0) - (a.viewCount || 0)
    })
  }, [data, tableSort])

  const maxRevenue = sortedVideos[0]?.revenue || 1

  const donutSlices = useMemo(() => {
    const PALETTE = [CYAN, LIME, GREEN, PURPLE, RED]
    return (data?.topVideosByRevenue || []).slice(0, 5).map((v, i) => ({
      value: v.revenue,
      label: v.title,
      color: PALETTE[i],
    }))
  }, [data])

  /* ── avg order value ── */
  const avgOrder = data && data.totalPurchases > 0
    ? (data.lifetimeRevenueInr * 100 / data.totalPurchases)
    : 0

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[#4DD0E1]" />
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="p-5 md:p-8 space-y-8">

        {/* ── Heading ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <IndianRupee className="w-6 h-6 text-[#C0E863]" />
              Revenue Analytics
            </h1>
            <p className="text-sm text-white/40 mt-0.5">Lifetime earnings, trends and video-wise breakdown.</p>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={IndianRupee}
            label="Lifetime Revenue"
            value={fmt(Math.round(data.lifetimeRevenueInr))}
            sub={`from ${data.totalPurchases} purchases`}
            accent={LIME}
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Purchases"
            value={data.totalPurchases.toLocaleString()}
            accent={CYAN}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Order Value"
            value={inr(avgOrder, 2)}
            accent={GREEN}
          />
          <StatCard
            icon={Film}
            label="Revenue Videos"
            value={(data.topVideosByRevenue?.length || 0).toString()}
            sub="videos with purchases"
            accent={PURPLE}
          />
        </div>

        {/* ── Revenue Trend Chart ── */}
        <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Revenue Trend</h2>
              <p className="text-xs text-white/30 mt-0.5">
                {chartView === 'monthly' ? 'Last 12 months' : 'Last 30 days'}
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Tab label="Monthly" active={chartView === 'monthly'} onClick={() => setChartView('monthly')} />
              <Tab label="Daily" active={chartView === 'daily'} onClick={() => setChartView('daily')} />
            </div>
          </div>

          {chartData.length > 0 ? (
            <>
              <div className="relative">
                {chartView === 'monthly'
                  ? <LineChart data={chartData} color={CYAN} height={160} />
                  : <BarChart  data={chartData} color={LIME} height={160} />
                }
              </div>
              {/* X-axis labels — show a subset */}
              <div className="flex justify-between mt-2 px-1">
                {chartData
                  .filter((_, i) => {
                    const step = Math.max(1, Math.floor(chartData.length / 6))
                    return i % step === 0 || i === chartData.length - 1
                  })
                  .map((d, i) => (
                    <span key={i} className="text-[10px] text-white/25">{d.label}</span>
                  ))}
              </div>
              {/* Revenue sum label */}
              <div className="mt-3 flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: chartView === 'monthly' ? CYAN : LIME }} />
                  <span className="text-xs text-white/50">
                    Total: <span className="text-white font-bold">{inr(chartData.reduce((s, d) => s + d.revenue, 0), 2)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 rounded-full bg-white/20" />
                  <span className="text-xs text-white/50">
                    Purchases: <span className="text-white font-bold">{chartData.reduce((s, d) => s + d.purchases, 0)}</span>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <TrendingUp className="w-10 h-10 text-white/15" />
              <p className="text-white/30 text-sm">No revenue data yet.</p>
            </div>
          )}
        </div>

        {/* ── Middle Row: Donut + Top by purchases ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Donut — Revenue share */}
          <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/80 mb-4">Revenue Share — Top 5</h2>
            {donutSlices.length > 0 ? (
              <div className="flex items-center gap-6 flex-wrap">
                <DonutChart slices={donutSlices} size={130} />
                <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                  {donutSlices.map((s, i) => {
                    const pct = Math.round((s.value / donutSlices.reduce((a, b) => a + b.value, 0)) * 100)
                    return (
                      <div key={i} className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-xs text-white/70 truncate flex-1">{s.label}</span>
                        <span className="text-xs font-bold text-white/60 shrink-0">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-white/25 text-sm text-center py-10">No data</p>
            )}
          </div>

          {/* Most purchased */}
          <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/80 mb-4">Most Purchased</h2>
            {data.topVideosByPurchases?.length > 0 ? (
              <div className="space-y-3">
                {data.topVideosByPurchases.slice(0, 6).map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-white/20 w-4 text-right shrink-0">#{i + 1}</span>
                    <div className="w-12 h-8 rounded-md overflow-hidden bg-white/5 shrink-0">
                      {v.thumbnailUrl
                        ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        : <Film className="w-4 h-4 text-white/15 m-auto mt-1.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/85 truncate">{v.title}</p>
                      <p className="text-[10px] text-white/35">{v.category || '—'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-[#4DD0E1]">{v.purchases} sales</p>
                      <p className="text-[10px] text-white/35">{inr(v.revenue, 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/25 text-sm text-center py-10">No data</p>
            )}
          </div>
        </div>

        {/* ── Video-wise Revenue Table ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Video-wise Breakdown</h2>
            {/* Sort tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {[['revenue', 'Revenue'], ['purchases', 'Sales'], ['views', 'Views']].map(([k, l]) => (
                <Tab key={k} label={l} active={tableSort === k} onClick={() => setTableSort(k)} />
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/25 text-[10px] uppercase tracking-widest border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <th className="text-left px-5 py-3 font-semibold">#</th>
                  <th className="text-left px-5 py-3 font-semibold">Video</th>
                  <th className="text-right px-5 py-3 font-semibold hidden sm:table-cell">Price</th>
                  <th className="text-right px-5 py-3 font-semibold">Sales</th>
                  <th className="text-right px-5 py-3 font-semibold">Revenue</th>
                  <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Share</th>
                  <th className="text-right px-5 py-3 font-semibold hidden lg:table-cell">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sortedVideos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Film className="w-8 h-8 text-white/10 mx-auto mb-3" />
                      <p className="text-white/25 text-sm">No purchase data yet.</p>
                    </td>
                  </tr>
                ) : sortedVideos.map((v, i) => {
                  const pct = Math.round((v.revenue / maxRevenue) * 100)
                  return (
                    <tr key={v.videoId} className="hover:bg-white/[0.025] transition">
                      <td className="px-5 py-3">
                        <span className="text-xs font-black text-white/20">{i + 1}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-9 rounded-lg overflow-hidden bg-white/5 shrink-0">
                            {v.thumbnailUrl
                              ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                              : <Film className="w-4 h-4 text-white/15 m-auto mt-2" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white/85 truncate max-w-[140px]">{v.title}</p>
                            <p className="text-[10px] text-white/30 truncate">{v.category || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right hidden sm:table-cell">
                        <span className="text-xs text-white/50">
                          {v.price > 0 ? `₹${v.price}` : <span className="text-[#C0E863]">Free</span>}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs font-bold text-[#4DD0E1]">{v.purchases}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm font-black text-[#C0E863]">{inr(v.revenue, 0)}</span>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <MiniBar pct={pct} color={LIME} />
                          <span className="text-[10px] text-white/25">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right hidden lg:table-cell">
                        <div className="flex items-center justify-end gap-1 text-white/35 text-xs">
                          <Eye className="w-3 h-3" />
                          {v.viewCount?.toLocaleString() || 0}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <h2 className="text-sm font-black uppercase tracking-widest text-white/80 mb-4">Recent Transactions</h2>
          {data.recentPurchases?.length > 0 ? (
            <div className="space-y-2.5">
              {data.recentPurchases.map((p) => {
                const vid = p.videoId || {}
                const user = p.userId || {}
                return (
                  <div key={p._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/5">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0">
                      {vid.thumbnailUrl
                        ? <img src={vid.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        : <Film className="w-4 h-4 text-white/15 m-auto mt-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white/85 truncate">{vid.title || 'Unknown video'}</p>
                      <p className="text-[11px] text-white/35 truncate">{user.name || user.email || 'Unknown user'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black" style={{ color: GREEN }}>{inr(p.amountPaise, 2)}</p>
                      <p className="text-[10px] text-white/30">{fmtDateShort(p.completedAt)}</p>
                    </div>
                    <div className="shrink-0">
                      <ArrowUpRight className="w-4 h-4 text-white/15" />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 gap-3">
              <ShoppingBag className="w-10 h-10 text-white/10" />
              <p className="text-white/25 text-sm">No transactions yet.</p>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}
