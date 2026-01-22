import React from 'react'
import { Twitter, Instagram, Youtube, Linkedin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-beige border-t border-sand/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="text-3xl font-display font-bold bg-linear-to-r from-sand via-nude to-warmgray bg-clip-text text-transparent mb-4">
              ArtStream
            </div>
            <p className="text-warmgray mb-6 max-w-sm">
              Empowering artists and creators to share their stories with the world. Stream, create, inspire.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-nude rounded-full flex items-center justify-center hover:bg-sand transition">
                <Twitter className="w-5 h-5 text-deepbrown" />
              </a>
              <a href="#" className="w-10 h-10 bg-nude rounded-full flex items-center justify-center hover:bg-sand transition">
                <Instagram className="w-5 h-5 text-deepbrown" />
              </a>
              <a href="#" className="w-10 h-10 bg-nude rounded-full flex items-center justify-center hover:bg-sand transition">
                <Youtube className="w-5 h-5 text-deepbrown" />
              </a>
              <a href="#" className="w-10 h-10 bg-nude rounded-full flex items-center justify-center hover:bg-sand transition">
                <Linkedin className="w-5 h-5 text-deepbrown" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-deepbrown">Platform</h4>
            <ul className="space-y-2 text-sm text-warmgray">
              <li><a href="#" className="hover:text-deepbrown transition">Discover</a></li>
              <li><a href="#" className="hover:text-deepbrown transition">Live Shows</a></li>
              <li><a href="#" className="hover:text-deepbrown transition">Podcasts</a></li>
              <li><a href="#" className="hover:text-deepbrown transition">Comedy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-deepbrown">Creators</h4>
            <ul className="space-y-2 text-sm text-warmgray">
              <li><a href="#" className="hover:text-deepbrown transition">Join as Creator</a></li>
              <li><a href="#" className="hover:text-deepbrown transition">Upload Content</a></li>
              <li><a href="#" className="hover:text-deepbrown transition">Creator Resources</a></li>
              <li><a href="#" className="hover:text-deepbrown transition">Analytics</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-deepbrown">Company</h4>
            <ul className="space-y-2 text-sm text-warmgray">
              <li><a href="#" className="hover:text-deepbrown transition">About Us</a></li>
              <li><a href="#" className="hover:text-deepbrown transition">Careers</a></li>
              <li><a href="#" className="hover:text-deepbrown transition">Press</a></li>
              <li><a href="#" className="hover:text-deepbrown transition">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-sand/30 flex flex-col md:flex-row items-center justify-between text-sm text-warmgray">
          <p>&copy; 2024 ArtStream. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-deepbrown transition">Privacy Policy</a>
            <a href="#" className="hover:text-deepbrown transition">Terms of Service</a>
            <a href="#" className="hover:text-deepbrown transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
