import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Menu, LogIn, UserPlus, Loader2, Download, CheckCircle } from 'lucide-react'
import CartButton from '../../cards/CartButton'
import SavedListButton from '../../cards/SavedListButton'
import { useAuth } from '../../../context/AuthContext'
import { videoApi, artistApi } from '../../../api'
import { usePWAInstall } from '../../../hooks/usePWAInstall'

const UserTopbar = ({ onMobileMenuToggle }) => {
  const [searchFocused, setSearchFocused] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ videos: [], artists: [] })
  const [isSearching, setIsSearching] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { canInstall, isInstalled, isIOS, triggerInstall } = usePWAInstall()

  useEffect(() => {
    if (!query.trim()) {
      setResults({ videos: [], artists: [] })
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const [videoRes, artistRes] = await Promise.all([
          videoApi.list({ search: query, limit: 5 }),
          artistApi.list({ search: query, limit: 3 })
        ])
        const vData = Array.isArray(videoRes.data?.data) ? videoRes.data.data : videoRes.data?.data?.videos || []
        const aData = Array.isArray(artistRes.data?.data) ? artistRes.data.data : artistRes.data?.data?.artists || []
        setResults({ videos: vData, artists: aData })
      } catch (err) {
        console.error('Search failed', err)
      } finally {
        setIsSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between border-b border-[#4DD0E1]/20 backdrop-blur-sm"
      style={{ 
        background: 'rgba(224,247,250,0.85)',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)',
        paddingBottom: '1rem'
      }}
    >
      {/* Left — mobile hamburger */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-[#4DD0E1]/20 text-[#051d2e] transition"
        onClick={onMobileMenuToggle}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Center — search */}
      <div ref={dropdownRef} className={`relative flex-1 max-w-md mx-4 transition-all ${searchFocused ? 'max-w-xl' : ''}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#051d2e]/40 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search films, artists, shows..."
          onFocus={() => setSearchFocused(true)}
          className="w-full bg-white/70 border border-[#4DD0E1]/30 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50 focus:border-[#4DD0E1] transition placeholder:text-[#051d2e]/40 text-[#051d2e]"
        />
        
        {/* Dropdown Results */}
        {searchFocused && query.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#4DD0E1]/20 overflow-hidden z-50">
            {isSearching ? (
              <div className="flex items-center justify-center py-6 text-[#051d2e]/50">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : results.videos.length > 0 || results.artists.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.videos.length > 0 && (
                  <div className="px-3 py-2 bg-[#4DD0E1]/5 text-[10px] font-black text-[#051d2e]/60 uppercase tracking-widest sticky top-0 backdrop-blur-md z-10 border-b border-[#4DD0E1]/10">
                    Videos
                  </div>
                )}
                {results.videos.map((video) => (
                  <div
                    key={video._id}
                    onClick={() => {
                      setSearchFocused(false)
                      setQuery('')
                      navigate(`/video/${video._id}`)
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-[#4DD0E1]/10 cursor-pointer transition border-b border-[#4DD0E1]/10 last:border-0"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      {video.thumbnailUrl && (
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#051d2e] truncate">{video.title}</p>
                      <p className="text-xs text-[#051d2e]/60 truncate">{video.artistId?.name || 'Unknown Artist'}</p>
                    </div>
                  </div>
                ))}

                {results.artists.length > 0 && (
                  <div className={`px-3 py-2 bg-[#4DD0E1]/5 text-[10px] font-black text-[#051d2e]/60 uppercase tracking-widest sticky top-0 backdrop-blur-md z-10 border-b border-[#4DD0E1]/10 ${results.videos.length > 0 ? 'border-t' : ''}`}>
                    Artists
                  </div>
                )}
                {results.artists.map((artist) => (
                  <div
                    key={artist._id}
                    onClick={() => {
                      setSearchFocused(false)
                      setQuery('')
                      navigate(`/artist/${artist._id}`)
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-[#4DD0E1]/10 cursor-pointer transition border-b border-[#4DD0E1]/10 last:border-0"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden shrink-0">
                      {artist.avatarUrl ? (
                        <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#4DD0E1]/20 text-[#051d2e]/40 font-bold">
                          {artist.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#051d2e] truncate">{artist.name}</p>
                      <p className="text-xs text-[#051d2e]/60 truncate">Artist</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-[#051d2e]/50">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Saved List */}
        <SavedListButton />

        {/* Shopping Cart */}
        <CartButton />

        {/* Removed PWA Install button from here as requested */}

        {/* Notification bell */}
        

        {/* Upgrade badge */}
        {/* <Link
          to="/pricing"
          className="hidden sm:block text-[10px] font-black uppercase px-3 py-1.5 rounded-full border border-[#4DD0E1] text-[#00BCD4] hover:bg-[#4DD0E1] hover:text-[#051d2e] transition"
        >
          Upgrade
        </Link> */}

        {isAuthenticated ? (
          /* Avatar */
          <Link to="/account" className="w-9 h-9 rounded-full ring-2 ring-[#C0E863]/70 ring-offset-1 overflow-hidden cursor-pointer shrink-0">
            <img
              src={user?.avatarUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
              alt={user?.name || "User"}
              className="w-full h-full object-cover"
            />
          </Link>
        ) : (
          <div className="flex items-center gap-2 ml-2">
            <Link to="/login" className="text-xs font-bold text-[#051d2e]/80 hover:text-[#051d2e] px-2 py-1">Log In</Link>
            <Link to="/signup" className="hidden sm:flex text-xs font-bold text-[#051d2e] px-3 py-1.5 rounded-full bg-[#4DD0E1] hover:bg-[#00BCD4] transition">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default UserTopbar
