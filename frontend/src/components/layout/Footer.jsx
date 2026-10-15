import { Instagram, Mail, Youtube, MessageCircle } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-linear-to-br from-[#B2EBF2]/50 via-[#E0F7FA]/60 to-[#F1F8E9]/40 border-t border-primary/40 pt-16 pb-10 px-6 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3 bg-[#212e53] p-2 pr-4 rounded-xl w-fit">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md bg-white/10">
                <img src="/Logomark.png" alt="arturee" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              </div>
              <span className="text-2xl font-black tracking-tighter lowercase bg-linear-to-r from-primary to-lime bg-clip-text text-transparent">arturee</span>
            </div>
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-navy/70 font-semibold mt-4 ml-1">
              Art Comes Home
            </p>
          </div>

          <div>
            <h4 className="font-bold text-navy mb-5">Platform</h4>
            <ul className="space-y-3.5 text-sm text-navy">
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
            <h4 className="font-bold text-navy mb-5">Connect With Us</h4>
            <ul className="space-y-3 text-sm text-navy">
              <li>
                <a
                  href="mailto:support@arturee.com"
                  className="flex items-center gap-2.5 text-navy hover:text-primary transition-colors font-medium group"
                >
                  <Mail className="w-4 h-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <span>support@arturee.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/arturee_art/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-navy hover:text-primary transition-colors font-medium group"
                >
                  <Instagram className="w-4 h-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <span>@arturee_art</span>
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com/@arturee_art?si=iKkQXMrpacLWZpjR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-navy hover:text-primary transition-colors font-medium group"
                >
                  <Youtube className="w-4 h-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <span>@arturee_art</span>
                </a>
              </li>
              <li>
                <a
                  href="https://chat.whatsapp.com/DMZ724Vxg44DQgpOAqwHRq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-navy hover:text-primary transition-colors font-medium group"
                >
                  <MessageCircle className="w-4 h-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Join Community</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-primary/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-navy/60 text-xs">© 2026 arturee Cinematic Platform. Crafted for the curious.</p>
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
