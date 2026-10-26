import React, { useState, useEffect } from 'react'
import { Bookmark, Film } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { wishlistApi } from '../../api/index.js'
import { Link } from 'react-router-dom'

export default function SavedListButton() {
  const { savedList, setSavedList } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  // Automatically refresh savedList from backend if items are missing titles (e.g. from previous stale localStorage)
  useEffect(() => {
    if (savedList.length > 0 && savedList.some(item => !item.title)) {
      wishlistApi.get().then(res => {
        const items = res.data?.data || []
        const formatted = items
          .filter(v => v && (v._id || v.id))
          .map(v => ({
            id: v._id || v.id,
            title: v.title || '',
            creator: v.artistId?.name || v.creator || v.artistName || '',
            artistName: v.artistId?.name || v.creator || v.artistName || '',
            image: v.thumbnailUrl || v.image || '',
            price: v.price || 0,
          }))
        if (formatted.length > 0) {
          setSavedList(formatted)
        }
      }).catch(() => {})
    }
  }, [savedList, setSavedList])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#051d2e]/10 rounded-lg transition"
        title="Saved List"
      >
        <Bookmark className="w-5 h-5 text-[#051d2e]" />
        {savedList.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {savedList.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-80 bg-white rounded-xl shadow-2xl border border-[#051d2e]/10 z-50 overflow-hidden">
          <div className="p-4 border-b border-[#051d2e]/10 flex items-center justify-between">
            <h3 className="font-bold text-[#051d2e]">Saved Videos ({savedList.length})</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#051d2e]/60 hover:text-[#051d2e]"
            >
              ✕
            </button>
          </div>
          
          <div className="p-4">
            {savedList.length === 0 ? (
              <div className="text-center py-6">
                <Bookmark className="w-12 h-12 mx-auto text-[#051d2e]/30 mb-2" />
                <p className="text-sm text-[#051d2e]/60">No saved videos yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedList.map((item) => {
                  const title = item.title || 'Untitled Video'
                  const creator = item.creator || item.artistName || item.artistId?.name || ''
                  const image = item.image || item.thumbnailUrl

                  return (
                    <Link
                      key={item.id}
                      to={`/video/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="p-2.5 bg-[#051d2e]/5 rounded-xl hover:bg-[#051d2e]/10 transition flex items-center gap-3 group"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="w-12 h-9 rounded-lg object-cover shrink-0 border border-[#051d2e]/10 group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-12 h-9 rounded-lg bg-[#051d2e]/10 flex items-center justify-center shrink-0">
                          <Film className="w-4 h-4 text-[#051d2e]/40" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#051d2e] line-clamp-1">{title}</p>
                        {creator && (
                          <p className="text-xs text-[#051d2e]/60 line-clamp-1 mt-0.5">{creator}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            
            {savedList.length > 0 && (
              <Link
                to="/dashboard/mylist"
                onClick={() => setIsOpen(false)}
                className="block w-full mt-4 py-2 text-center bg-[#4DD0E1] text-white font-semibold rounded-lg hover:bg-[#4DD0E1]/90 transition"
              >
                View All Saved Videos
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
