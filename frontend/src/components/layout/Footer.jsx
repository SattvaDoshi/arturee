import { Instagram } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-linear-to-br from-[#B2EBF2]/50 via-[#E0F7FA]/60 to-[#F1F8E9]/40 border-t border-primary/40 pt-20 pb-10 px-6 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-linear-to-br from-primary to-lime rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tighter lowercase bg-linear-to-r from-primary to-lime bg-clip-text text-transparent">arturee</span>
            </div>
            <p className="text-navy max-w-sm leading-relaxed">
              The world's premier cinematic gallery for independent voices and artistic visionaries. Stream, support, and discover.
            </p>

          </div>
          <div>
            <h4 className="font-bold text-navy mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-navy">
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-primary transition-colors font-medium"
                >
                  Library
                </Link>
              </li>

              <li>
                <Link
                  to="/artists"
                  className="hover:text-primary transition-colors font-medium"
                >
                  Artist Portal
                </Link>
              </li>

              <li>
                <Link
                  to="/pricing"
                  className="hover:text-primary transition-colors font-medium"
                >
                  Pricing Plans
                </Link>
              </li>

              <li>
                <Link
                  to="/genres"
                  className="hover:text-primary transition-colors font-medium"
                >
                  Explore Genres
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-navy mb-6">Follow the Journey</h4>
            <div className="flex gap-4">
              <div className='flex justify-between items-center gap-1'>
                <Instagram className="w-5 h-5 text-primary" />
                <a href="#" className="ml-2 text-sm text-navy hover:text-primary transition-colors font-medium">Instagram</a>
              </div>
              <div>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-primary/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-navy/60 text-xs">© 2026 Arturee Cinematic Platform. Crafted for the curious.</p>
          <div className="flex gap-8 text-xs text-navy/60">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
