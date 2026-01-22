import React from 'react'

const FeaturedCard = ({ image, badge, badgeColor, subtitle, title, description }) => {
  const badgeColors = {
    red: 'bg-red-500',
    sand: 'bg-sand',
    orange: 'bg-orange-400'
  }

  return (
    <div className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer shadow-lg">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
      />
      <div className="absolute inset-0 bg-linear-to-t from-deepbrown via-deepbrown/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center space-x-2 mb-2">
          <span className={`px-3 py-1 ${badgeColors[badgeColor] || 'bg-sand'} rounded-full text-xs font-semibold text-white`}>
            {badge}
          </span>
          <span className="text-sm text-beige">{subtitle}</span>
        </div>
        <h3 className="text-2xl font-bold mb-1 text-white">{title}</h3>
        <p className="text-sm text-beige">{description}</p>
      </div>
    </div>
  )
}

export default FeaturedCard
