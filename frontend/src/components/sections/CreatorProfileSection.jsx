import React from 'react'
import VideoCard from '../cards/VideoCard'

const CreatorProfileSection = () => {
  const tabs = ['Videos', 'Podcasts', 'Live', 'About']
  
  const videos = [
    {
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=225&fit=crop",
      title: "Sarah Chen: Raw - Full Special",
      views: "1.2M views",
      time: "2 weeks ago",
      duration: "1:15:34",
      price: "$9.99"
    },
    {
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop",
      title: "Behind the Scenes: Making of Raw",
      views: "450K views",
      time: "1 week ago",
      duration: "12:34",
      price: "$2.99"
    },
    {
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=225&fit=crop",
      title: "Podcast: The Creative Process",
      views: "320K views",
      time: "2 weeks ago",
      duration: "8:45",
      price: "Free"
    },
    {
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=225&fit=crop",
      title: "Live Q&A with Fans",
      views: "580K views",
      time: "3 weeks ago",
      duration: "15:22",
      price: "Free"
    }
  ]

  return (
    <section id="creator-profile" className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-cream to-beige/50">
      <div className="max-w-7xl mx-auto">
        {/* Cover Image */}
        <div className="relative h-80 rounded-3xl overflow-hidden mb-8 shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1400&h=400&fit=crop" 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-deepbrown via-deepbrown/50 to-transparent" />
        </div>
        
        {/* Profile Info */}
        <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8 -mt-32 relative z-10 mb-12">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" 
            alt="Creator" 
            className="w-32 h-32 rounded-2xl object-cover border-4 border-cream shadow-2xl"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-4xl font-display font-bold text-deepbrown">Sarah Chen</h1>
              <span className="px-3 py-1 bg-linear-to-r from-sand to-nude rounded-full text-xs font-semibold text-white">
                Verified Creator
              </span>
            </div>
            <p className="text-warmgray mb-4">Stand-up Comedian • Podcast Host • Creative Storyteller</p>
            <div className="flex items-center space-x-6 text-sm mb-4">
              <div>
                <span className="font-bold text-deepbrown">245K</span>{' '}
                <span className="text-warmgray">Subscribers</span>
              </div>
              <div>
                <span className="font-bold text-deepbrown">42</span>{' '}
                <span className="text-warmgray">Videos</span>
              </div>
              <div>
                <span className="font-bold text-deepbrown">5.2M</span>{' '}
                <span className="text-warmgray">Total Views</span>
              </div>
            </div>
            <button className="px-8 py-3 bg-linear-to-r from-sand to-nude rounded-full font-semibold text-white hover:shadow-lg hover:shadow-sand/40 transition">
              Subscribe
            </button>
          </div>
        </div>
        
        {/* Tabs & Content */}
        <div className="mb-12">
          <div className="flex items-center space-x-6 mb-8 border-b border-sand/30">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                className={`pb-4 font-semibold transition ${
                  index === 0
                    ? 'border-b-2 border-sand text-deepbrown'
                    : 'text-warmgray hover:text-deepbrown'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Videos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video, index) => (
              <VideoCard key={index} {...video} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CreatorProfileSection
