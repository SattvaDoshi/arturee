import { useState } from 'react'
import AdminSidebar from './admin/AdminSidebar'
import AdminTopbar from './admin/AdminTopbar'

/**
 * AdminLayout — used for all admin panel pages.
 * Layout: collapsible dark sidebar + sticky admin top bar + scrollable main content.
 */
const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div
      className="flex h-screen overflow-hidden font-display antialiased"
      style={{ background: '#071523', color: '#e2e8f0' }}
    >
      {/* ── Mobile overlay ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Desktop sidebar ── */}
      <div className="hidden md:block">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
        />
      </div>

      {/* ── Mobile sidebar (slide-in drawer) ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <AdminSidebar
          collapsed={false}
          onToggle={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar onMobileMenuToggle={() => setMobileSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
