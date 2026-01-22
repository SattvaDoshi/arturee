import React from 'react'
import FeaturedCard from '../cards/FeaturedCard'

const HeroSection = () => {
  const featuredContent = [
    {
      image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop",
      badge: "LIVE",
      badgeColor: "red",
      subtitle: "2.4K watching",
      title: "Jazz Night Sessions",
      description: "Marcus Cole Live from Brooklyn"
    },
    {
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop",
      badge: "PODCAST",
      badgeColor: "sand",
      subtitle: "Episode 42",
      title: "Creative Minds",
      description: "The Art of Storytelling"
    },
    {
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop",
      badge: "COMEDY",
      badgeColor: "orange",
      subtitle: "New Special",
      title: "Sarah Chen: Raw",
      description: "Stand-up Comedy Special"
    }
  ]

  const stats = [
    { value: "500+", label: "Artists" },
    { value: "10K+", label: "Hours of Content" },
    { value: "50K+", label: "Active Viewers" },
    { value: "24/7", label: "Live Streams" }
  ]

  return (
    <section id="landing" className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-br from-beige/30 via-cream to-nude/20" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-sand/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-nude/15 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight text-deepbrown">
            Where Artists<br/>
            <span className="bg-linear-to-r from-sand via-nude to-warmgray bg-clip-text text-transparent">
              Come Alive
            </span>
          </h1>
          <p className="text-xl text-warmgray max-w-2xl mx-auto mb-8">
            Stream exclusive shows, podcasts, and behind-the-scenes content from the world's most creative minds. Join a community built for artists, by artists.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-linear-to-r from-sand to-nude rounded-full text-lg font-semibold text-white hover:shadow-2xl hover:shadow-sand/40 transition transform hover:scale-105">
              Start Watching Free
            </button>
            <button className="px-8 py-4 bg-beige rounded-full text-lg font-semibold text-deepbrown hover:bg-nude transition border border-sand/30">
              For Creators
            </button>
          </div>
        </div>

        {/* Featured Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {featuredContent.map((content, index) => (
            <FeaturedCard key={index} {...content} />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl font-bold bg-linear-to-r from-sand to-nude bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-warmgray">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
