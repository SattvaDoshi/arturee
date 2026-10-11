import { useState, useEffect, useMemo } from 'react'
import * as XLSX from 'xlsx'
import {
  IndianRupee, ShoppingBag, TrendingUp, Film, ChevronUp,
  ChevronDown, Loader2, ArrowUpRight, Star, Eye,
  Download, FileSpreadsheet, Search, CheckCircle2, Clock,
  User, Mic2, Tag, Calendar, Filter, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { adminApi } from '../../api/index.js'

/* ─── Palette ─────────────────────────────────────── */
const CYAN   = '#4DD0E1'
const LIME   = '#C0E863'
const GREEN  = '#34d399'
const RED    = '#f87171'
const PURPLE = '#a78bfa'
const AMBER  = '#fbbf24'

/* ─── Helpers ─────────────────────────────────────── */
const inr = (paise, dp = 0) => `₹${(paise / 100).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
const fmt = (n) => n >= 1_00_00_000 ? `₹${(n / 1_00_00_000).toFixed(2)}Cr` : n >= 1_00_000 ? `₹${(n / 1_00_00_000).toFixed(2)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—'

const fmtDuration = (sec) => {
  if (!sec && sec !== 0) return '—'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return m > 0 ? (s > 0 ? `${m}m ${s}s` : `${m}m`) : `${s}s`
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
  const H = height
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
  const paths = slices.slice(0, 5).map((s) => {
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
    className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition cursor-pointer"
    style={active
      ? { background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: '#051d2e' }
      : { color: 'rgba(255,255,255,0.45)', background: 'transparent' }}
  >
    {label}
  </button>
)

/* ══════════════════════════════════════════════════════════ */
export default function RevenuePage() {
  const [loading, setLoading]                 = useState(true)
  const [data, setData]                       = useState(null)
  const [purchases, setPurchases]             = useState([])
  const [purchasesLoading, setPurchasesLoading] = useState(false)
  const [tableSort, setTableSort]             = useState('revenue') // 'revenue' | 'purchases' | 'views'
  const [chartView, setChartView]             = useState('monthly') // 'monthly' | 'daily'
  
  // Transaction list search and filter states
  const [searchQuery, setSearchQuery]         = useState('')
  const [statusFilter, setStatusFilter]       = useState('all') // 'all' | 'completed' | 'expired'
  const [currentPage, setCurrentPage]         = useState(1)
  const pageSize                              = 10
  const [exporting, setExporting]             = useState(false)

  useEffect(() => {
    // Fetch aggregated revenue stats
    adminApi.getRevenue()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))

    // Fetch complete purchase transactions
    setPurchasesLoading(true)
    adminApi.getRevenuePurchases()
      .then(res => setPurchases(res.data.data || []))
      .catch(console.error)
      .finally(() => setPurchasesLoading(false))
  }, [])

  /* ── Derived Charts Data ── */
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

  /* ── Avg order value ── */
  const avgOrder = data && data.totalPurchases > 0
    ? (data.lifetimeRevenueInr * 100 / data.totalPurchases)
    : 0

  /* ── Filtered & Paginated Purchases ── */
  const filteredPurchases = useMemo(() => {
    if (!purchases) return []
    return purchases.filter(p => {
      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false

      // Search query
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase().trim()
      const u = p.userId || {}
      const v = p.videoId || {}
      const artist = v.artistId?.name || ''
      const genre  = v.genre?.name || ''

      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (v.title && v.title.toLowerCase().includes(q)) ||
        (artist && artist.toLowerCase().includes(q)) ||
        (genre && genre.toLowerCase().includes(q)) ||
        (p.razorpayOrderId && p.razorpayOrderId.toLowerCase().includes(q)) ||
        (p.razorpayPaymentId && p.razorpayPaymentId.toLowerCase().includes(q)) ||
        (p.couponCode && p.couponCode.toLowerCase().includes(q))
      )
    })
  }, [purchases, statusFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / pageSize))
  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPurchases.slice(start, start + pageSize)
  }, [filteredPurchases, currentPage, pageSize])

  /* ── Reset page on filter changes ── */
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  /* ── Export to Excel (.xlsx) or CSV (.csv) ── */
  const handleExport = async (format = 'xlsx') => {
    try {
      setExporting(true)

      let records = purchases
      if (!records || records.length === 0) {
        const res = await adminApi.getRevenuePurchases()
        records = res.data.data || []
        setPurchases(records)
      }

      if (!records || records.length === 0) {
        alert('No transaction records found to export.')
        return
      }

      const timestamp = new Date().toISOString().slice(0, 10)

      if (format === 'csv') {
        const headers = [
          'Order ID',
          'Payment ID',
          'Purchase Date & Time',
          'User Name',
          'User Email',
          'Video Purchased',
          'Artist Name',
          'Genre',
          'Categories',
          'Video Duration',
          'MRP Price (INR)',
          'Discounted Price (INR)',
          'Amount Paid (INR)',
          'Currency',
          'Coupon Code',
          'Views Used',
          'Payment Status',
        ]

        const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`

        const rows = records.map((p) => {
          const u = p.userId || {}
          const v = p.videoId || {}
          const artist = v.artistId ? v.artistId.name : 'Arturee'
          const genre = v.genre ? v.genre.name : '—'
          const cats = Array.isArray(v.categories) ? v.categories.map((c) => c.name).filter(Boolean).join(', ') : '—'
          const dateObj = p.completedAt || p.createdAt
          const dateStr = dateObj ? new Date(dateObj).toLocaleString('en-IN') : '—'

          return [
            escapeCsv(p.razorpayOrderId || p._id),
            escapeCsv(p.razorpayPaymentId || '—'),
            escapeCsv(dateStr),
            escapeCsv(u.name || '—'),
            escapeCsv(u.email || '—'),
            escapeCsv(v.title || '—'),
            escapeCsv(artist),
            escapeCsv(genre),
            escapeCsv(cats || '—'),
            escapeCsv(fmtDuration(v.durationSeconds)),
            escapeCsv(v.costPrice || v.price || 0),
            escapeCsv(v.discountedPrice || v.price || 0),
            escapeCsv((p.amountPaise / 100).toFixed(2)),
            escapeCsv(p.currency || 'INR'),
            escapeCsv(p.couponCode || 'None'),
            escapeCsv(p.viewsUsed ?? 0),
            escapeCsv(p.status || 'completed'),
          ].join(',')
        })

        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `arturee_revenue_report_${timestamp}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // Native XLSX Workbook generation with SheetJS
        const excelRows = records.map((p, idx) => {
          const u = p.userId || {}
          const v = p.videoId || {}
          const artist = v.artistId ? v.artistId.name : 'Arturee'
          const genre = v.genre ? v.genre.name : '—'
          const cats = Array.isArray(v.categories) ? v.categories.map((c) => c.name).filter(Boolean).join(', ') : '—'
          const dateObj = p.completedAt || p.createdAt
          const dateStr = dateObj ? new Date(dateObj).toLocaleString('en-IN') : '—'

          return {
            'S.No': idx + 1,
            'Order ID': p.razorpayOrderId || String(p._id),
            'Payment ID': p.razorpayPaymentId || '—',
            'Purchase Date': dateStr,
            'User Name': u.name || '—',
            'User Email': u.email || '—',
            'Video Purchased': v.title || '—',
            'Artist Name': artist,
            'Genre': genre,
            'Categories': cats || '—',
            'Duration': fmtDuration(v.durationSeconds),
            'MRP (₹)': v.costPrice || v.price || 0,
            'Discounted Price (₹)': v.discountedPrice || v.price || 0,
            'Amount Paid (₹)': Number((p.amountPaise / 100).toFixed(2)),
            'Currency': p.currency || 'INR',
            'Coupon Code': p.couponCode || 'None',
            'Views Used': p.viewsUsed ?? 0,
            'Status': (p.status || 'completed').toUpperCase(),
          }
        })

        const ws = XLSX.utils.json_to_sheet(excelRows)

        // Custom column widths for clean Excel view
        ws['!cols'] = [
          { wch: 6 },  // S.No
          { wch: 24 }, // Order ID
          { wch: 24 }, // Payment ID
          { wch: 22 }, // Purchase Date
          { wch: 22 }, // User Name
          { wch: 28 }, // User Email
          { wch: 32 }, // Video Purchased
          { wch: 22 }, // Artist Name
          { wch: 16 }, // Genre
          { wch: 20 }, // Categories
          { wch: 14 }, // Duration
          { wch: 12 }, // MRP
          { wch: 20 }, // Discounted
          { wch: 16 }, // Amount Paid
          { wch: 10 }, // Currency
          { wch: 14 }, // Coupon Code
          { wch: 12 }, // Views Used
          { wch: 14 }, // Status
        ]

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Revenue Transactions')

        // Add summary sheet
        const totalPaid = records.reduce((sum, r) => sum + (r.amountPaise || 0), 0) / 100
        const summaryRows = [
          { Metric: 'Report Generated At', Value: new Date().toLocaleString('en-IN') },
          { Metric: 'Total Purchases Count', Value: records.length },
          { Metric: 'Total Revenue Collected (₹)', Value: Number(totalPaid.toFixed(2)) },
          { Metric: 'Completed Purchases', Value: records.filter((r) => r.status === 'completed').length },
          { Metric: 'Expired (Watched) Purchases', Value: records.filter((r) => r.status === 'expired').length },
        ]
        const wsSummary = XLSX.utils.json_to_sheet(summaryRows)
        wsSummary['!cols'] = [{ wch: 28 }, { wch: 28 }]
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary Overview')

        XLSX.writeFile(wb, `arturee_revenue_report_${timestamp}.xlsx`)
      }
    } catch (err) {
      console.error('Failed to export revenue excel:', err)
      alert('Error generating Excel file. Please try again.')
    } finally {
      setExporting(false)
    }
  }

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

        {/* ── Top Header with Download Actions ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <IndianRupee className="w-6 h-6 text-[#C0E863]" />
              Revenue Analytics
            </h1>
            <p className="text-sm text-white/40 mt-0.5">
              Lifetime earnings, performance trends, and full purchase audit logs.
            </p>
          </div>

          {/* Download Excel & CSV Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleExport('xlsx')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #4DD0E1 0%, #C0E863 100%)',
                color: '#051d2e',
                boxShadow: '0 4px 20px rgba(77,208,225,0.25)',
              }}
              title="Download complete transaction report as Excel (.xlsx)"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#051d2e]" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-[#051d2e]" />
              )}
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white/80 hover:text-white transition border cursor-pointer hover:bg-white/5 active:scale-95"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
              title="Download transaction report as CSV (.csv)"
            >
              <Download className="w-4 h-4 text-[#4DD0E1]" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={IndianRupee}
            label="Lifetime Revenue"
            value={fmt(Math.round(data?.lifetimeRevenueInr || 0))}
            sub={`from ${data?.totalPurchases || 0} purchases`}
            accent={LIME}
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Purchases"
            value={(data?.totalPurchases || 0).toLocaleString()}
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
            value={(data?.topVideosByRevenue?.length || 0).toString()}
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
              {/* X-axis labels */}
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
            {data?.topVideosByPurchases?.length > 0 ? (
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
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Video-wise Breakdown</h2>
              <p className="text-xs text-white/30 mt-0.5">Performance summary across all catalog titles.</p>
            </div>
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
                            <p className="text-xs font-bold text-white/85 truncate max-w-[180px]">{v.title}</p>
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

        {/* ── Complete Transactions & Excel Export Section ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
          {/* Section Header */}
          <div className="p-5 border-b space-y-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-sm font-black uppercase tracking-widest text-white/90">
                    All Transactions & Purchase Records
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#4DD0E1]/15 text-[#4DD0E1]">
                    {filteredPurchases.length} Total
                  </span>
                </div>
                <p className="text-xs text-white/35 mt-0.5">
                  Complete details including buyer, video details, artist name, and transaction status.
                </p>
              </div>

              {/* Action buttons inside table header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport('xlsx')}
                  disabled={exporting}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #4DD0E1 0%, #C0E863 100%)',
                    color: '#051d2e',
                  }}
                  title="Download all purchases as Excel"
                >
                  {exporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  )}
                  <span>Export Excel</span>
                </button>

                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white transition border cursor-pointer hover:bg-white/5"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  title="Download CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#4DD0E1]" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search user, email, video title, or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:border-[#4DD0E1]/60 transition"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {[
                  { key: 'all', label: `All (${purchases.length})` },
                  { key: 'completed', label: `Completed (${purchases.filter(p => p.status === 'completed').length})` },
                  { key: 'expired', label: `Expired (${purchases.filter(p => p.status === 'expired').length})` },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                    style={statusFilter === key
                      ? { background: 'rgba(255,255,255,0.15)', color: '#ffffff' }
                      : { color: 'rgba(255,255,255,0.45)' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-[10px] uppercase tracking-widest border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <th className="text-left px-5 py-3 font-semibold">User</th>
                  <th className="text-left px-5 py-3 font-semibold">Video Purchased</th>
                  <th className="text-left px-5 py-3 font-semibold">Artist</th>
                  <th className="text-left px-5 py-3 font-semibold">Date & Time</th>
                  <th className="text-right px-5 py-3 font-semibold">Amount Paid</th>
                  <th className="text-center px-5 py-3 font-semibold">Status / Views</th>
                  <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Order ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {purchasesLoading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#4DD0E1] mx-auto mb-3" />
                      <p className="text-white/40 text-xs">Loading transaction records...</p>
                    </td>
                  </tr>
                ) : paginatedPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <ShoppingBag className="w-8 h-8 text-white/10 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">
                        {searchQuery || statusFilter !== 'all' ? 'No transactions match your search.' : 'No purchase records found.'}
                      </p>
                      {(searchQuery || statusFilter !== 'all') && (
                        <button
                          onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                          className="mt-2 text-xs text-[#4DD0E1] hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : paginatedPurchases.map((p) => {
                  const u = p.userId || {}
                  const v = p.videoId || {}
                  const artist = v.artistId ? v.artistId.name : 'Arturee'
                  const dateObj = p.completedAt || p.createdAt

                  return (
                    <tr key={p._id} className="hover:bg-white/[0.025] transition">
                      {/* User Column */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 text-white font-bold text-xs">
                            {u.name ? u.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-white/40" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white/90 truncate">{u.name || 'Anonymous User'}</p>
                            <p className="text-[11px] text-white/40 truncate">{u.email || '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Video Purchased Column */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded-lg overflow-hidden bg-white/5 shrink-0 border border-white/5">
                            {v.thumbnailUrl ? (
                              <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Film className="w-4 h-4 text-white/20 m-auto mt-2" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <p className="text-xs font-semibold text-white/90 truncate">{v.title || 'Untitled Video'}</p>
                            <div className="flex items-center gap-2 text-[10px] text-white/35">
                              {v.genre?.name && <span>{v.genre.name}</span>}
                              {v.durationSeconds && <span>• {fmtDuration(v.durationSeconds)}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Artist Column */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C0E863]" />
                          <span className="text-xs font-medium text-white/80">{artist}</span>
                        </div>
                      </td>

                      {/* Date & Time Column */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs text-white/80">{fmtDate(dateObj)}</span>
                          <span className="text-[10px] text-white/35">
                            {dateObj ? new Date(dateObj).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                          </span>
                        </div>
                      </td>

                      {/* Amount Paid Column */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-black text-[#C0E863]">
                            {inr(p.amountPaise, 2)}
                          </span>
                          {p.couponCode && (
                            <span className="text-[10px] text-emerald-400/80 font-medium">
                              🏷️ {p.couponCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status / Views Used Column */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              p.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {p.status}
                          </span>
                          <span className="text-[10px] text-white/30">
                            {p.viewsUsed ?? 0}/2 views
                          </span>
                        </div>
                      </td>

                      {/* Order ID Column */}
                      <td className="px-5 py-3.5 hidden md:table-cell whitespace-nowrap">
                        <span className="text-[11px] font-mono text-white/30 truncate max-w-[140px] block" title={p.razorpayOrderId}>
                          {p.razorpayOrderId ? p.razorpayOrderId.slice(-14) : p._id.slice(-8)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t text-xs text-white/40" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPurchases.length)} of {filteredPurchases.length} transactions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <span className="text-white/70 font-semibold px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}
