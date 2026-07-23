import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home, Play, BookmarkCheck, ShoppingBag, User,
  LogIn, UserPlus, X, Shield,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

const navItems = [
  { label: 'Home',              icon: Home,          to: '/dashboard' },
  { label: 'Continue Watching', icon: Play,          to: '/dashboard/continue' },
  { label: 'My List',           icon: BookmarkCheck, to: '/dashboard/mylist' },
  { label: 'Purchased',         icon: ShoppingBag,   to: '/dashboard/purchased' },
  { label: 'Account',           icon: User,          to: '/account' },
]

/* Tooltip — shown only when sidebar is collapsed */
const Tip = ({ label, show, children }) => (
  <div className="group/tip relative flex w-full">
    {children}
    {show && (
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
        opacity-0 group-hover/tip:opacity-100 translate-x-1 group-hover/tip:translate-x-0
        transition-all duration-150 whitespace-nowrap">
        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold text-lightgray shadow-2xl"
          style={{ background: '#051d2e' }}>
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2
            border-4 border-transparent border-r-[#051d2e]" />
        </div>
      </div>
    )}
  </div>
)

const UserSidebar = ({ mobile = false, onMobileClose }) => {
  const location = useLocation()
  const [hovered, setHovered] = useState(false)
  const { isAuthenticated: isLoggedIn, user, isAdmin } = useAuth()

  // On desktop: collapsed unless hovered. On mobile drawer: always expanded.
  const expanded = mobile || hovered
  const collapsed = !expanded

  const NavLink = ({ label, icon: Icon, to }) => {
    const active =
      location.pathname === to ||
      (to !== '/dashboard' && location.pathname.startsWith(to))

    const link = (
      <Link
        to={to}
        onClick={mobile ? onMobileClose : undefined}
        className={[
          'flex items-center rounded-xl transition-all duration-200 w-full overflow-hidden',
          collapsed ? 'justify-center p-3' : 'gap-3.5 px-4 py-3',
          active
            ? 'text-[#051d2e] font-bold'
            : 'text-[#051d2e]/55 hover:text-[#051d2e] hover:bg-white/50 font-medium',
        ].join(' ')}
        style={active ? { background: 'linear-gradient(135deg,#4DD0E1 0%,#C0E863 100%)' } : {}}
      >
        <Icon className="shrink-0 w-[18px] h-[18px]" />
        <span
          className="text-sm leading-none tracking-normal whitespace-nowrap overflow-hidden transition-all duration-300"
          style={{ width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1 }}
        >
          {label}
        </span>
      </Link>
    )

    return <Tip label={label} show={collapsed}>{link}</Tip>
  }

  return (
    <aside
      onMouseEnter={() => !mobile && setHovered(true)}
      onMouseLeave={() => !mobile && setHovered(false)}
      className="h-screen flex flex-col z-30 overflow-hidden"
      style={{
        width: expanded ? '15rem' : '4.5rem',
        transition: 'width 280ms cubic-bezier(.4,0,.2,1)',
        background: 'linear-gradient(180deg,#d0f4f8 0%,#c2eef5 45%,#d6f5e3 100%)',
        borderRight: '1px solid rgba(77,208,225,0.18)',
        boxShadow: expanded ? '4px 0 24px rgba(5,29,46,0.08)' : 'none',
      }}
    >
      {/* ── Brand header ── */}
      <div
        className="flex items-center shrink-0 border-b border-[#4DD0E1]/15 overflow-hidden"
        style={{ minHeight: '4rem', padding: collapsed ? '0 0.875rem' : '0 1rem' }}
      >
        {/* Monogram — always visible */}
        <Link
          to="/"
          className="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg hover:scale-105 transition-transform"
          style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
        >
          <span className="text-[#051d2e] font-black text-sm leading-none select-none">A</span>
        </Link>

        {/* Wordmark — fades in when expanded */}
        <span
          className="ml-2.5 text-[#051d2e] font-black text-lg tracking-tight leading-none whitespace-nowrap overflow-hidden transition-all duration-300 flex-1"
          style={{ width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1 }}
        >
          arturee
        </span>

        {/* Mobile close button */}
        {mobile && (
          <button
            onClick={onMobileClose}
            className="shrink-0 p-1.5 rounded-lg text-[#051d2e]/40 hover:text-[#051d2e] hover:bg-white/50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
      </nav>

      {/* ── Auth section ── */}
      <div className="shrink-0 px-2 pb-5 pt-3 border-t border-[#4DD0E1]/15 overflow-hidden">
        {isAdmin && (
          <Tip label="Admin Panel" show={collapsed}>
            <Link
              to="/admin"
              className={[
                'flex items-center rounded-xl transition-all duration-200 w-full overflow-hidden mb-2',
                collapsed ? 'justify-center p-3' : 'gap-3.5 px-4 py-2.5',
                'text-red-500 hover:text-red-600 hover:bg-white/50 font-bold',
              ].join(' ')}
            >
              <Shield className="shrink-0 w-[18px] h-[18px]" />
              <span
                className="text-sm leading-none tracking-normal whitespace-nowrap overflow-hidden transition-all duration-300"
                style={{ width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1 }}
              >
                Admin Panel
              </span>
            </Link>
          </Tip>
        )}
        {isLoggedIn ? (
          <Tip label="My Account" show={collapsed}>
            <Link
              to="/account"
              className={[
                'flex items-center rounded-xl hover:bg-white/50 transition overflow-hidden',
                collapsed ? 'justify-center p-1' : 'gap-3 px-3 py-2.5',
              ].join(' ')}
            >
              <div className="w-8 h-8 rounded-full ring-2 ring-[#4DD0E1]/50 overflow-hidden shrink-0">
                <img
                  src={user?.avatarUrl || undefined}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1 }}
              >
                <p className="text-xs font-bold text-[#051d2e] truncate whitespace-nowrap">{user?.name || 'My Account'}</p>
                <p className="text-[10px] text-[#051d2e]/50 truncate whitespace-nowrap">View profile</p>
              </div>
            </Link>
          </Tip>
        ) : (
          <div className="space-y-2">
            {/* Log In */}
            <Tip label="Log In" show={collapsed}>
              <Link
                to="/login"
                className={[
                  'flex items-center justify-center rounded-xl border border-[#4DD0E1]/40 text-[#051d2e]/65',
                  'hover:border-[#4DD0E1] hover:text-[#051d2e] hover:bg-white/40 transition w-full overflow-hidden',
                  collapsed ? 'p-2.5' : 'gap-2 py-2.5 text-sm font-semibold',
                ].join(' ')}
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span
                  className="whitespace-nowrap overflow-hidden transition-all duration-300"
                  style={{ width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 120 }}
                >
                  Log In
                </span>
              </Link>
            </Tip>

            {/* Sign Up */}
            <Tip label="Sign Up Free" show={collapsed}>
              <Link
                to="/signup"
                className={[
                  'flex items-center justify-center rounded-xl text-[#051d2e] font-bold',
                  'transition hover:opacity-90 active:scale-95 w-full overflow-hidden',
                  collapsed ? 'p-2.5' : 'gap-2 py-2.5 text-sm',
                ].join(' ')}
                style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span
                  className="whitespace-nowrap overflow-hidden transition-all duration-300"
                  style={{ width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 120 }}
                >
                  Sign Up Free
                </span>
              </Link>
            </Tip>
          </div>
        )}
      </div>
    </aside>
  )
}

export default UserSidebar
