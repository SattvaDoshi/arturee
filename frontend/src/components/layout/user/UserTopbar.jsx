import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, Menu } from 'lucide-react'

const UserTopbar = ({ onMobileMenuToggle }) => {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 z-20 h-16 px-4 md:px-6 flex items-center justify-between border-b border-[#4DD0E1]/20 backdrop-blur-sm"
      style={{ background: 'rgba(224,247,250,0.85)' }}
    >
      {/* Left — mobile hamburger */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-[#4DD0E1]/20 text-[#051d2e] transition"
        onClick={onMobileMenuToggle}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Center — search */}
      <div className={`relative flex-1 max-w-md mx-4 transition-all ${searchFocused ? 'max-w-xl' : ''}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#051d2e]/40 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Search films, artists, shows..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full bg-white/70 border border-[#4DD0E1]/30 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50 focus:border-[#4DD0E1] transition placeholder:text-[#051d2e]/40 text-[#051d2e]"
        />
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification bell */}
        <button className="relative p-2 hover:bg-[#4DD0E1]/15 rounded-full transition">
          <Bell className="w-5 h-5 text-[#051d2e]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C0E863] border-2 border-[#e0f7fa]" />
        </button>

        {/* Upgrade badge */}
        <Link
          to="/pricing"
          className="hidden sm:block text-[10px] font-black uppercase px-3 py-1.5 rounded-full border border-[#4DD0E1] text-[#00BCD4] hover:bg-[#4DD0E1] hover:text-[#051d2e] transition"
        >
          Upgrade
        </Link>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full ring-2 ring-[#C0E863]/70 ring-offset-1 overflow-hidden cursor-pointer shrink-0">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}

export default UserTopbar
