import React, { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { Link } from 'react-router-dom'

export default function SavedListButton() {
  const { savedList } = useCart()
  const [isOpen, setIsOpen] = useState(false)

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
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-[#051d2e]/10 z-50 overflow-hidden">
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
                {savedList.map((item) => (
                  <Link
                    key={item.id}
                    to={`/video/${item.id}`}
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-[#051d2e]/5 rounded-lg hover:bg-[#051d2e]/10 transition block"
                  >
                    <p className="text-sm font-semibold text-[#051d2e] line-clamp-1">{item.title}</p>
                    <p className="text-xs text-[#051d2e]/60">{item.creator || 'Creator'}</p>
                  </Link>
                ))}
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
