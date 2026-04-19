import React from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { Link } from 'react-router-dom'

export default function CartSummary({ onClose }) {
  const { getCartSummary, toggleCart } = useCart()
  const summary = getCartSummary()

  if (summary.itemCount === 0) {
    return (
      <div className="p-4 text-center">
        <ShoppingCart className="w-12 h-12 mx-auto text-[#051d2e]/30 mb-2" />
        <p className="text-sm text-[#051d2e]/60">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {summary.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-2 bg-[#051d2e]/5 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#051d2e] line-clamp-1">{item.title}</p>
              <p className="text-xs text-[#051d2e]/60">{item.price}</p>
            </div>
            <button
              onClick={() => toggleCart(item)}
              className="p-1 hover:bg-red-500/20 rounded transition"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {/* Discount Info */}
      {summary.itemCount >= 3 && (
        <div className="p-3 bg-lime/15 border border-lime/30 rounded-lg">
          <p className="text-xs font-bold text-[#051d2e]">
            🎉 {summary.discountPercentage}% DISCOUNT APPLIED
          </p>
          <p className="text-xs text-[#051d2e]/70">
            You saved ${summary.discount.toFixed(2)}
          </p>
        </div>
      )}

      {/* Pricing Summary */}
      <div className="space-y-2 p-3 bg-[#051d2e]/5 rounded-lg border border-[#051d2e]/10">
        <div className="flex justify-between text-sm">
          <span className="text-[#051d2e]/60">Subtotal ({summary.itemCount} items)</span>
          <span className="font-semibold text-[#051d2e]">${summary.subtotal.toFixed(2)}</span>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between text-sm text-lime-600 font-bold">
            <span>Discount ({summary.discountPercentage}%)</span>
            <span>-${summary.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-[#051d2e]/10 pt-2 flex justify-between">
          <span className="font-bold text-[#051d2e]">Total</span>
          <span className="font-bold text-lg text-[#4DD0E1]">${summary.total.toFixed(2)}</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 mt-4 flex flex-col">
        <Link
          to="/checkout"
          onClick={onClose}
          className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-[#4DD0E1] to-[#C0E863] text-[#051d2e] font-bold rounded-lg hover:shadow-lg transition text-center"
        >
          Proceed to Checkout
        </Link>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-full py-2 border border-[#4DD0E1] text-[#4DD0E1] font-semibold rounded-lg hover:bg-gradient-to-r hover:from-[#4DD0E1]/10 hover:to-[#4DD0E1]/10 transition text-center"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}
