import React from 'react'
import { Heart, ShoppingCart, BookmarkPlus, Bookmark } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const VideoCard = ({ 
  id, 
  image, 
  title, 
  creator, 
  views, 
  time, 
  duration, 
  price, 
  variant = 'default',
  onPlay = () => {} 
}) => {
  const { toggleCart, toggleSavedList, isInCart, isInSavedList } = useCart()

  const video = { id, image, title, creator, price }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleCart(video)
  }

  const handleSaveToList = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSavedList(video)
  }

  if (variant === 'sidebar') {
    return (
      <div className="flex space-x-3 cursor-pointer group">
        <div className="relative w-40 rounded-lg overflow-hidden flex-shrink-0 shadow-md" style={{ aspectRatio: '16/9' }}>
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
          <div className="absolute bottom-1 right-1 px-2 py-1 bg-deepbrown/90 rounded text-xs font-semibold text-cream">
            {duration}
          </div>
          <div className="absolute top-1 right-1 px-2 py-1 bg-sand rounded text-xs font-semibold text-white">
            {price}
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1 line-clamp-2 text-deepbrown">{title}</h4>
          <p className="text-xs text-warmgray mb-1">{creator}</p>
          <p className="text-xs text-warmgray">{views} • {time}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSaveToList}
              className="p-1 rounded hover:bg-sand/20 transition"
              title="Save to list"
            >
              {isInSavedList(id) ? (
                <Bookmark className="w-4 h-4 text-sand fill-sand" />
              ) : (
                <BookmarkPlus className="w-4 h-4 text-warmgray hover:text-sand" />
              )}
            </button>
            <button
              onClick={handleAddToCart}
              className="p-1 rounded hover:bg-sand/20 transition"
              title="Add to cart"
            >
              <ShoppingCart className={`w-4 h-4 ${isInCart(id) ? 'text-sand fill-sand' : 'text-warmgray hover:text-sand'}`} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group cursor-pointer relative">
      <div className="relative rounded-xl overflow-hidden mb-3 shadow-md" style={{ aspectRatio: '16/9' }}>
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-deepbrown/90 rounded text-xs font-semibold text-cream">
          {duration}
        </div>
        <div className="absolute top-2 right-2 px-2 py-1 bg-sand rounded text-xs font-semibold text-white">
          {price}
        </div>
        
        {/* Action buttons on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-3">
          <button
            onClick={handleSaveToList}
            className="p-2 rounded-full bg-white hover:bg-sand/80 transition transform hover:scale-110"
            title="Save to list"
          >
            {isInSavedList(id) ? (
              <Bookmark className="w-5 h-5 text-deepbrown fill-deepbrown" />
            ) : (
              <BookmarkPlus className="w-5 h-5 text-deepbrown" />
            )}
          </button>
          <button
            onClick={handleAddToCart}
            className="p-2 rounded-full bg-sand hover:bg-sand/80 transition transform hover:scale-110"
            title="Add to cart"
          >
            <ShoppingCart className="w-5 h-5 text-white" fill="white" />
          </button>
        </div>
      </div>
      <h4 className="font-semibold text-sm mb-1 line-clamp-2 text-deepbrown">{title}</h4>
      <p className="text-xs text-warmgray">{creator || `${views} • ${time}`}</p>
    </div>
  )
}

export default VideoCard
