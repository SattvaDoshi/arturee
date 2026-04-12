import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/genres', label: 'Genre' },
    { to: '/artists', label: 'Artists' },
    { to: '/aboutus', label: 'Who are we' },
    { to: '/pricing', label: 'Pricing' },
  ]

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-4 z-[100] mx-4 md:mx-10 my-4">
      <div className="bg-white/90 backdrop-blur-sm rough-border px-4 sm:px-6 py-4 flex items-center justify-between shadow-[6px_6px_0px_#4DD0E1] border-primary">
        <div className="h-10 w-30">
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
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded border-2 border-black text-navy"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? 'X' : '|||'}
          </button>
          <Link to="/login" className="hidden sm:block text-xs font-black uppercase underline decoration-4 underline-offset-4 decoration-lime text-navy hover:text-primary transition-colors">Sign In</Link>
          <Link to="/signup" className="flex items-center justify-center bg-linear-to-r from-primary to-lime text-white px-4 sm:px-6 py-2 text-sm font-black uppercase hover:shadow-lg hover:scale-105 transition-all shadow-[4px_4px_0px_#00BCD4] rounded">Join Now</Link>
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
