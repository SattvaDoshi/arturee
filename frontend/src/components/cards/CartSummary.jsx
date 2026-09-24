import React from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function CartSummary({ onClose }) {
  const { getCartSummary, toggleCart } = useCart()
  const summary = getCartSummary()
  const navigate = useNavigate()

  const handleCheckout = () => {
    onClose()
    if (summary.items.length > 0) {
      navigate('/checkout', {
        state: {
          items: summary.items.map(item => ({
            videoId: item.id,
            title: item.title,
            price: item.price,
            thumbnail: item.image || item.thumbnailUrl,
            artistName: item.artistName || item.creator
          })),
          subtotal: summary.subtotal,
          discount: summary.discount,
          total: summary.total
        }
      });
    }
  }

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



      {/* Pricing Summary */}
      <div className="space-y-2 p-3 bg-[#051d2e]/5 rounded-lg border border-[#051d2e]/10">
        <div className="flex justify-between text-sm">
          <span className="text-[#051d2e]/60">Subtotal ({summary.itemCount} items)</span>
          <span className="font-semibold text-[#051d2e]">Rs. {summary.subtotal.toFixed(2)}</span>
        </div>

        {summary.platformFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#051d2e]/60">Platform &amp; Convenience Fee (3%)</span>
            <span className="font-semibold text-[#051d2e]">Rs. {summary.platformFee.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-[#051d2e]/10 pt-2 flex justify-between">
          <span className="font-bold text-[#051d2e]">Total</span>
          <span className="font-bold text-lg text-[#4DD0E1]">Rs. {summary.total.toFixed(2)}</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 mt-4 flex flex-col">
        <button
          onClick={handleCheckout}
          className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-[#4DD0E1] to-[#C0E863] text-[#051d2e] font-bold rounded-lg hover:shadow-lg transition text-center cursor-pointer"
        >
          Proceed to Checkout
        </button>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-full py-2 border border-[#4DD0E1] text-[#4DD0E1] font-semibold rounded-lg hover:bg-gradient-to-r hover:from-[#4DD0E1]/10 hover:to-[#4DD0E1]/10 transition text-center"
        >
          Continue Shopping
        </button>
      </div>

      {/* Suggested Videos */}
      <div className="mt-6 pt-4 border-t border-[#051d2e]/10">
        <h4 className="text-sm font-bold text-[#051d2e] mb-3">You might also like</h4>
        <SuggestedVideos onClose={onClose} />
      </div>
    </div>
  )
}

function SuggestedVideos({ onClose }) {
  const [videos, setVideos] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const { toggleCart, getCartSummary } = useCart()
  const { items } = getCartSummary()

  React.useEffect(() => {
    import('../../api/index.js').then(({ videoApi }) => {
      videoApi.list({ limit: 4, sort: 'popular' })
        .then(res => {
          const vids = res.data?.data?.videos || res.data?.data || []
          setVideos(Array.isArray(vids) ? vids : [])
        })
        .catch(() => setVideos([]))
        .finally(() => setLoading(false))
    })
  }, [])

  if (loading) {
    return <div className="text-xs text-[#051d2e]/50 text-center py-2">Loading suggestions...</div>
  }

  // Filter out videos already in cart
  const cartIds = items.map(i => i.id)
  const suggestions = videos.filter(v => !cartIds.includes(v._id)).slice(0, 3)

  if (suggestions.length === 0) return null

  return (
    <div className="space-y-3">
      {suggestions.map(video => (
        <div key={video._id} className="flex gap-3 items-center group">
          <div className="w-16 h-10 shrink-0 bg-[#051d2e]/10 rounded overflow-hidden">
            <img src={video.thumbnailUrl || '/fallback.png'} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#051d2e] truncate">{video.title}</p>
            <p className="text-[10px] text-[#051d2e]/60 truncate">Rs. {video.price}</p>
          </div>
          <button
            onClick={() => {
              toggleCart({
                id: video._id,
                title: video.title,
                price: video.price,
                image: video.thumbnailUrl,
                creator: video.artistId?.name || 'Artist'
              })
            }}
            className="shrink-0 p-1.5 rounded-full bg-[#4DD0E1]/10 text-[#4DD0E1] hover:bg-[#4DD0E1] hover:text-[#051d2e] transition"
            title="Add to cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
