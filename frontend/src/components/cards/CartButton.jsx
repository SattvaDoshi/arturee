import React, { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import CartSummary from './CartSummary'

export default function CartButton() {
  const { getCartSummary } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const summary = getCartSummary()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#051d2e]/10 rounded-lg transition"
        title="Shopping Cart"
      >
        <ShoppingCart className="w-5 h-5 text-[#051d2e]" />
        {summary.itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {summary.itemCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-[#051d2e]/10 z-50 overflow-hidden">
          <div className="p-4 border-b border-[#051d2e]/10 flex items-center justify-between">
            <h3 className="font-bold text-[#051d2e]">Shopping Cart</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#051d2e]/60 hover:text-[#051d2e]"
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            <CartSummary onClose={() => setIsOpen(false)} />
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
