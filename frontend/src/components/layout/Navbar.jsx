import React from 'react'

const Navbar = () => {
  return (
    <header className="sticky top-4 z-[100] mx-4 md:mx-10 my-4">
      <div className="bg-white/90 backdrop-blur-sm rough-border px-6 py-4 flex items-center justify-between shadow-[6px_6px_0px_#4DD0E1] border-primary">
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-br from-primary to-lime p-2 rounded-lg transform -rotate-6 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 8h-2V6c0-1.1-.9-2-2-2s-2 .9-2 2v2h-2V5c0-1.1-.9-2-2-2s-2 .9-2 2v3H7V6c0-1.1-.9-2-2-2S3 4.9 3 6v9c0 3.31 2.69 6 6 6h6c3.31 0 6-2.69 6-6V10c0-1.1-.9-2-2-2zm0 7c0 2.21-1.79 4-4 4H9c-2.21 0-4-1.79-4-4V6c0-.55.45-1 1-1s1 .45 1 1v5h2V5c0-.55.45-1 1-1s1 .45 1 1v6h2V6c0-.55.45-1 1-1s1 .45 1 1v5h2v4z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black tracking-tighter lowercase bg-linear-to-r from-primary to-lime bg-clip-text text-transparent">arturee</h2>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a className="text-sm font-black uppercase hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-1 transition-all text-navy rounded" href="#dashboard">Dashboard</a>
          <a className="text-sm font-black uppercase hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-1 transition-all text-navy rounded" href="#shows">Shows</a>
          <a className="text-sm font-black uppercase hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-1 transition-all text-navy rounded" href="#podcasts">Podcasts</a>
          <a className="text-sm font-black uppercase hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-1 transition-all text-navy rounded" href="#comedy">Comedy</a>
          <a className="text-sm font-black uppercase hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-1 transition-all text-navy rounded" href="#pricing">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-xs font-black uppercase underline decoration-4 underline-offset-4 decoration-lime text-navy">Sign In</button>
          <button className="bg-linear-to-r from-primary to-lime text-white px-6 py-2 text-sm font-black uppercase hover:shadow-lg hover:scale-105 transition-all shadow-[4px_4px_0px_#00BCD4] rounded">Join Now</button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
