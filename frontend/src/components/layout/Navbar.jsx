import React from 'react'

const Navbar = () => {
  return (
    <header className="sticky top-4 z-[100] mx-4 md:mx-10 my-4">
      <div className="bg-white/90 backdrop-blur-sm rough-border px-6 py-4 flex items-center justify-between shadow-[6px_6px_0px_#4DD0E1] border-primary">
        <div className="h-10 w-30 ">
          <img src="./logo.png" className='h-full w-full object-contain' alt="" />
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a className="text-sm font-black uppercase hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-1 transition-all text-navy rounded" href="/">Dashboard</a>
          <a className="text-sm font-black uppercase hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-1 transition-all text-navy rounded" href="/genres ">Genre</a>
          <a className="text-sm font-black uppercase hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-1 transition-all text-navy rounded" href="/artists">Artists</a>
          <a className="text-sm font-black uppercase hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-1 transition-all text-navy rounded" href="/aboutus">Who are we</a>
          <a className="text-sm font-black uppercase hover:bg-linear-to-r hover:from-primary hover:to-lime hover:text-white px-2 py-1 transition-all text-navy rounded" href="/pricing">Pricing</a>
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
