import React from 'react'

const VideoCard = ({ image, title, creator, views, time, duration, price, variant = 'default' }) => {
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
        </div>
      </div>
    )
  }

  return (
    <div className="group cursor-pointer">
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
      </div>
      <h4 className="font-semibold text-sm mb-1 line-clamp-2 text-deepbrown">{title}</h4>
      <p className="text-xs text-warmgray">{views} • {time}</p>
    </div>
  )
}

export default VideoCard
