import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useArtistModal } from '../../context/ArtistModalContext'
import CartButton from '../cards/CartButton'
import SavedListButton from '../cards/SavedListButton'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { openModal } = useArtistModal()

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/genres', label: 'Genre' },
    { to: '/artists', label: 'Artists' },
    { to: '/aboutus', label: 'Who are we' },
    { to: '/pricing', label: 'Pricing' },
  ]

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-4 z-[100] mx-3 my-3 md:mx-10 md:my-4">
      <div className="bg-white/90 backdrop-blur-sm rough-border px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2 shadow-[6px_6px_0px_#4DD0E1] border-primary">
        <div className="h-9 w-28 sm:h-10 sm:w-30 shrink-0">
          <img src="/logo.png" className="h-full w-full object-contain" alt="Arturee" />
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-black uppercase hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-1 transition-all text-navy rounded"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">

          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded border-2 border-black bg-white text-navy transition-colors hover:bg-lightgray"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <span className="text-base leading-none font-black">X</span>
            ) : (
              <span className="flex flex-col items-center justify-center gap-1">
                <span className="h-0.5 w-4 bg-current rounded" />
                <span className="h-0.5 w-4 bg-current rounded" />
                <span className="h-0.5 w-4 bg-current rounded" />
              </span>
            )}
          </button>
          <Link to="/login" className="hidden sm:block text-xs font-black uppercase underline decoration-4 underline-offset-4 decoration-lime text-navy hover:text-primary transition-colors">Sign In</Link>
          <button onClick={openModal} className="flex items-center justify-center whitespace-nowrap bg-linear-to-r from-primary to-lime text-white px-3 sm:px-6 py-2 text-xs sm:text-sm font-black uppercase tracking-wide transition-all shadow-[3px_3px_0px_#00BCD4] rounded hover:shadow-lg hover:scale-105">Join Now</button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden mt-2 bg-white/95 rough-border px-4 py-3 shadow-[6px_6px_0px_#4DD0E1] border-primary flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={`mobile-${item.to}`}
              to={item.to}
              onClick={closeMobileMenu}
              className="text-sm font-black uppercase text-navy hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-2 rounded transition-all"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={closeMobileMenu}
            className="sm:hidden text-sm font-black uppercase text-navy px-2 py-2 rounded underline decoration-4 underline-offset-4 decoration-lime"
          >
            Sign In
          </Link>
        </nav>
      )}
    </header>
  )
}

export default Navbar
