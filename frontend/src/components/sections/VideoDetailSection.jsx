import React from 'react'
import { Play, ThumbsUp, Share2, Bookmark } from 'lucide-react'
import VideoCard from '../cards/VideoCard'

const VideoDetailSection = () => {
  const relatedVideos = [
    {
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop",
      title: "Behind the Scenes: Making of Raw",
      creator: "Sarah Chen",
      views: "450K views",
      time: "1 week ago",
      duration: "12:34",
      price: "$2.99"
    },
    {
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=225&fit=crop",
      title: "Podcast: The Creative Process",
      creator: "Sarah Chen",
      views: "320K views",
      time: "2 weeks ago",
      duration: "8:45",
      price: "Free"
    },
    {
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=225&fit=crop",
      title: "Live Q&A with Fans",
      creator: "Sarah Chen",
      views: "580K views",
      time: "3 weeks ago",
      duration: "15:22",
      price: "Free"
    },
    {
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop",
      title: "Previous Special: Unfiltered",
      creator: "Sarah Chen",
      views: "2.1M views",
      time: "6 months ago",
      duration: "45:18",
      price: "$7.99"
    }
  ]

  return (
    <section id="video-detail" className="py-20 px-4 sm:px-6 lg:px-8 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="relative rounded-2xl overflow-hidden mb-6 bg-beige shadow-xl" style={{ aspectRatio: '16/9' }}>
              <img 
                src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=675&fit=crop" 
                alt="Video" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-deepbrown rounded-full flex items-center justify-center hover:scale-110 transition shadow-2xl">
                  <Play className="w-8 h-8 text-cream ml-1" />
                </button>
              </div>
              <div className="absolute top-6 right-6 px-4 py-2 bg-sand rounded-full text-sm font-bold text-white shadow-lg">
                $9.99
              </div>
            </div>
            
            {/* Video Info */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2 text-deepbrown">
                    Sarah Chen: Raw - Full Special
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-warmgray">
                    <span>1.2M views</span>
                    <span>•</span>
                    <span>2 weeks ago</span>
                    <span>•</span>
                    <span>1h 15m</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-3 bg-beige rounded-full hover:bg-nude transition">
                    <ThumbsUp className="w-5 h-5 text-deepbrown" />
                  </button>
                  <button className="p-3 bg-beige rounded-full hover:bg-nude transition">
                    <Share2 className="w-5 h-5 text-deepbrown" />
                  </button>
                  <button className="p-3 bg-beige rounded-full hover:bg-nude transition">
                    <Bookmark className="w-5 h-5 text-deepbrown" />
                  </button>
                </div>
              </div>
              
              {/* Creator Info */}
              <div className="flex items-center space-x-4 p-4 bg-beige rounded-xl border border-sand/30 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                  alt="Creator" 
                  className="w-16 h-16 rounded-full object-cover shadow-md"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-deepbrown">Sarah Chen</h3>
                  <p className="text-sm text-warmgray">245K subscribers</p>
                </div>
                <button className="px-6 py-3 bg-linear-to-r from-sand to-nude rounded-full font-semibold text-white hover:shadow-lg hover:shadow-sand/40 transition">
                  Subscribe
                </button>
              </div>
              
              {/* Description */}
              <div className="mt-6 p-6 bg-beige rounded-xl border border-sand/30 shadow-sm">
                <p className="text-warmgray leading-relaxed">
                  Sarah Chen's highly anticipated comedy special "Raw" brings her signature wit and fearless storytelling to the stage. Filmed live in Brooklyn, this hour-long special tackles everything from modern relationships to the absurdities of creative life in the digital age. Known for her sharp observations and authentic voice, Sarah delivers a performance that's both hilarious and deeply relatable.
                </p>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-deepbrown">More from Sarah Chen</h3>
            <div className="space-y-4">
              {relatedVideos.map((video, index) => (
                <VideoCard key={index} {...video} variant="sidebar" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VideoDetailSection
