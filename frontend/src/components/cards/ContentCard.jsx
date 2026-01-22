import React from 'react'
import { PlayCircle } from 'lucide-react'

const ContentCard = ({ image, title, creator, price }) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative rounded-xl overflow-hidden mb-3 shadow-md" style={{ aspectRatio: '2/3' }}>
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-deepbrown/80 to-transparent opacity-0 group-hover:opacity-100 transition">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center space-x-2 mb-2">
              <PlayCircle className="w-8 h-8 text-cream" />
            </div>
          </div>
        </div>
        <div className="absolute top-3 right-3 px-3 py-1 bg-sand rounded-full text-xs font-semibold text-white">
          {price}
        </div>
      </div>
      <h4 className="font-semibold mb-1 text-sm text-deepbrown">{title}</h4>
      <p className="text-xs text-warmgray">{creator}</p>
    </div>
  )
}

export default ContentCard
