import React from 'react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <section className="relative px-6 py-12 md:py-20 md:px-20 mb-12 md:mb-20">
      <div className="mx-auto max-w-[1200px] flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="w-full lg:w-1/2 z-20 space-y-6 md:space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tighter uppercase break-words">
            Where Art <br /> Finds Its <br />
            <span className="bg-linear-to-r from-primary to-lime text-white px-3 py-1 md:px-4 md:py-2 inline-block transform rotate-2 rough-border text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl shadow-lg">
              Home
            </span>
          </h1>
          <div className="bg-white/90 backdrop-blur-sm rough-border p-4 md:p-6 shadow-[6px_6px_0px_#4DD0E1] md:shadow-[10px_10px_0px_#4DD0E1] max-w-md transform -rotate-1">
            <p className="text-base md:text-lg lg:text-xl font-bold leading-tight text-navy">
                Modern life has its weights; <br /> Art makes it worth living
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-6 pt-2 md:pt-4">
            <Link to="/dashboard" className="bg-navy text-white px-6 py-3 md:px-10 md:py-5 text-base md:text-xl font-black uppercase hover:scale-105 transition-all shadow-[6px_6px_0px_#4DD0E1] md:shadow-[8px_8px_0px_#4DD0E1] rounded-lg text-center">
              Start Watching
            </Link>
            <Link to="/signup" className="bg-linear-to-r from-primary to-lime text-white rough-border px-6 py-3 md:px-10 md:py-5 text-base md:text-xl font-black uppercase hover:shadow-lg hover:scale-105 transition-all shadow-[6px_6px_0px_#00BCD4] md:shadow-[8px_8px_0px_#00BCD4] rounded-lg text-center">
              Sign Up
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-1/2 relative min-h-[500px] sm:min-h-[550px] md:min-h-[600px] mt-8 lg:mt-0 mb-16 sm:mb-20">
          {/* Background cyan frame - hidden on mobile */}
          <div className="absolute top-20 md:top-16 lg:top-20 -left-6 md:-left-10 w-48 h-60 md:w-56 md:h-72 lg:w-64 lg:h-80 bg-linear-to-br from-salmon to-lime rough-border transform rotate-6 z-0 overflow-hidden hidden md:block">
            <img className="w-full h-full object-cover mix-blend-multiply opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt-jEXc91uTeJMaVK6zjnOMFJKCGus_B1r6AYlGDj7_wlxzJJBj_lRGPAWkyiE4Qr7cD4sfnnIdlZ3bSfgEuHe89crQEMsg3-ReTjP-VsU7nFrMufroLvl2bb7Hz5wWv1HzpQ_PZVZ_NebgzWxa_pBZpZLxR2Gpg8fOVsTWb9266HoYO5I924k2u04SvPfegjaO3GWO6B8EPlCUe2h44GXeTJD8Xeer3p1eV5E31cIXxxzHmgt5I0Sx4Ny_RKL1i8NICHTI6242mQ" alt="Background" />
          </div>
          
          {/* Main polaroid image */}
          <div className="absolute top-0 right-0 sm:right-4 md:right-8 lg:right-0 w-[75%] sm:w-[70%] md:w-[65%] bg-white p-3 pb-12 md:p-4 md:pb-16 rough-border polaroid-shadow transform rotate-3 z-10">
            <img className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Featured Artist" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnsgMc-9vWB2jVZnNY9OxoK8_BaZASds2u3vuoZZc4O7X0MDZWge7YPEJtPFWKGKcOK9n8fdj7q_tvvKjH2PIbS8sG1Rh3vDSk1TVEbhDVGK7u0LzC1JQLs6sPuTfmhUgDFENXG_haHS5GFKfnpXrpGLQOsFhHBaMxfIYhahDCScBhiD6VnLxXG9vvOAKh0kEvytrJhTXy5GHTF1QV8jVz5F5UQrBHINz-gtU7ujs1LMASn9d9VGc0bA9oKxl_LQt3M84YGgbN--4" />
            <div className="absolute bottom-3 left-4 md:bottom-4 md:left-6 font-black uppercase italic text-base sm:text-lg md:text-2xl tracking-tighter text-navy">
              VIVID_001
            </div>
          </div>
          
        {/* Sticker */}
<div
  className="
    absolute bottom-0 left-0 sm:left-2
    w-40 h-40 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56
    bg-gradient-to-br from-primary to-lime
    rough-border
    -rotate-12
    z-20
    flex items-center justify-center
    p-3 md:p-3
    shadow-[6px_6px_0px_rgba(33,46,83,0.3)]
    overflow-hidden
  "
>
  <span
    className="
      block
      text-center
      uppercase
      font-black
      italic
      text-white
      leading-none
      text-xl sm:text-2xl md:text-3xl lg:text-[2.2rem]
      max-w-full
    "
  >
    ART AT
    <br />
    YOUR
    <br />
    FINGERTIPS
  </span>
</div>
          
          {/* Top label */}
          <div className="absolute -top-6 md:-top-8 right-8 sm:right-12 md:right-16 lg:right-20 bg-linear-to-r from-yellow to-lime px-3 py-1 md:px-4 md:py-2 rough-border z-30 transform -rotate-6 font-black uppercase text-xs md:text-sm text-navy shadow-md">
            ART_FIRST
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
