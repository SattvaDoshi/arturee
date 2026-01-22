import React from 'react'

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md border-b border-beige shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <a href="#landing" className="text-2xl font-display font-bold bg-linear-to-r from-sand via-nude to-warmgray bg-clip-text text-transparent">
              Arturee
            </a>
            <div className="hidden md:flex space-x-6">
              <a href="#landing" className="text-sm font-medium text-deepbrown hover:text-sand transition">
                Home
              </a>
              <a href="#discover" className="text-sm font-medium text-warmgray hover:text-sand transition">
                Discover
              </a>
              <a href="#shows" className="text-sm font-medium text-warmgray hover:text-sand transition">
                Shows
              </a>
              <a href="#podcasts" className="text-sm font-medium text-warmgray hover:text-sand transition">
                Podcasts
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hidden sm:block text-sm font-medium text-warmgray hover:text-deepbrown transition">
              Sign In
            </button>
            <button className="px-4 py-2 bg-linear-to-r from-sand to-nude rounded-full text-sm font-semibold text-white hover:shadow-lg hover:shadow-sand/30 transition">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
