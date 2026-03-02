import { useState } from 'react'
import UserSidebar from './user/UserSidebar'
import UserTopbar from './user/UserTopbar'

/**
 * UserLayout — used for the user-facing dashboard / streaming pages.
 * Desktop: fixed overlay sidebar (hover to expand) + scrollable main content.
 * Mobile: slide-in drawer.
 */
const UserLayout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div
      className="flex h-screen overflow-hidden font-display antialiased"
      style={{ background: 'linear-gradient(160deg,#e0f7fa 0%,#b2ebf2 50%,#e8f5e9 100%)', color: '#051d2e' }}
    >
      {/* ── Mobile overlay ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#051d2e]/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Desktop sidebar — fixed overlay, hover-driven ── */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30">
        <UserSidebar />
      </div>

      {/* ── Mobile sidebar (slide-in drawer) ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <UserSidebar mobile onMobileClose={() => setMobileSidebarOpen(false)} />
      </div>

      {/* ── Main area: offset by collapsed sidebar width (4.5rem) ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:pl-[4.5rem]">
        <UserTopbar onMobileMenuToggle={() => setMobileSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  )
}

export default UserLayout
