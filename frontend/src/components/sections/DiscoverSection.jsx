import React from 'react'
import ContentCard from '../cards/ContentCard'

const DiscoverSection = () => {
  const categories = ['All', 'Shows', 'Podcasts', 'Comedy', 'Music']
  
  const trendingContent = [
    {
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop",
      title: "Midnight Sessions",
      creator: "Alex Rivera",
      price: "$4.99"
    },
    {
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop",
      title: "Urban Stories",
      creator: "Maya Chen",
      price: "$3.99"
    },
    {
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=600&fit=crop",
      title: "Sound & Vision",
      creator: "Jordan Blake",
      price: "$5.99"
    },
    {
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop",
      title: "Behind the Lens",
      creator: "Sam Torres",
      price: "$4.99"
    },
    {
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=600&fit=crop",
      title: "Creative Flow",
      creator: "Riley Park",
      price: "$3.99"
    }
  ]

  return (
    <section id="discover" className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-cream to-beige/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-display font-bold mb-2 text-deepbrown">Discover Content</h2>
            <p className="text-warmgray">Explore curated collections from top creators</p>
          </div>
          <div className="hidden md:flex space-x-4">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
                  index === 0
                    ? 'bg-deepbrown text-cream'
                    : 'bg-beige text-deepbrown hover:bg-nude'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Trending Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-6 text-deepbrown">Trending Now</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trendingContent.map((content, index) => (
              <ContentCard key={index} {...content} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DiscoverSection
