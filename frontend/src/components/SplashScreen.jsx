import React, { useState, useEffect } from 'react'

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)
  const [textRevealed, setTextRevealed] = useState(false)

  useEffect(() => {
    // Trigger text animation
    setTimeout(() => setTextRevealed(true), 300)

    const timer = setTimeout(() => {
      setIsFading(true)
      setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 600)
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  const letters = "ARTUREE".split("")

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: '#212e53' }}
    >
      {/* Animated gradient orbs — cyan / lime palette matching sections */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Cyan orb top-left */}
        <div
          className="absolute w-[550px] h-[550px] rounded-full blur-[120px] animate-[floatOrb1_8s_ease-in-out_infinite]"
          style={{
            background: 'radial-gradient(circle, rgba(77,208,225,0.35) 0%, transparent 70%)',
            top: '-5%',
            left: '-10%'
          }}
        />
        {/* Lime orb bottom-right */}
        <div
          className="absolute w-[450px] h-[450px] rounded-full blur-[100px] animate-[floatOrb2_10s_ease-in-out_infinite]"
          style={{
            background: 'radial-gradient(circle, rgba(192,232,99,0.25) 0%, transparent 70%)',
            bottom: '-5%',
            right: '-5%'
          }}
        />
        {/* Accent teal orb center-right */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full blur-[80px] animate-[floatOrb3_6s_ease-in-out_infinite]"
          style={{
            background: 'radial-gradient(circle, rgba(0,188,212,0.2) 0%, transparent 70%)',
            top: '35%',
            right: '15%'
          }}
        />
      </div>

      {/* Diagonal decorative stripe */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, #4DD0E1, transparent)`,
              width: `${200 + i * 60}px`,
              top: `${15 + i * 14}%`,
              left: '-250px',
              animation: `lineSlide 3s ease-in-out infinite`,
              animationDelay: `${i * 0.35}s`
            }}
          />
        ))}
      </div>

      {/* Floating particles — cyan & lime dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(22)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-[particleFloat_4s_ease-in-out_infinite]"
            style={{
              width: `${3 + (i % 5)}px`,
              height: `${3 + (i % 5)}px`,
              background: i % 2 === 0
                ? `rgba(77,208,225,${0.25 + (i % 4) * 0.1})`
                : `rgba(192,232,99,${0.2 + (i % 3) * 0.1})`,
              left: `${(i * 4.5) % 100}%`,
              top: `${(i * 7 + 10) % 100}%`,
              animationDelay: `${(i * 0.18) % 4}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6">

        {/* Logo badge */}
        <div className="relative mb-10">
          {/* Spinning conic ring */}
          <div className="absolute -inset-4 animate-[spin_6s_linear_infinite] rounded-2xl overflow-hidden">
            <div
              className="w-full h-full rounded-2xl"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, #4DD0E1 25%, transparent 50%, #C0E863 75%, transparent 100%)',
                padding: '2px'
              }}
            >
              <div className="w-full h-full rounded-2xl" style={{ background: '#212e53' }} />
            </div>
          </div>

          {/* Ripple rings */}
          <div className="absolute inset-0 -m-10">
            <div
              className="absolute inset-0 rounded-full border animate-[ripple_2s_ease-out_infinite]"
              style={{ borderColor: 'rgba(77,208,225,0.35)' }}
            />
            <div
              className="absolute inset-0 rounded-full border animate-[ripple_2s_ease-out_infinite]"
              style={{ borderColor: 'rgba(77,208,225,0.2)', animationDelay: '0.6s' }}
            />
          </div>

          {/* Icon box */}
          <div
            className="relative w-24 h-24 rounded-2xl flex items-center justify-center animate-[scaleIn_0.8s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
            style={{
              background: 'linear-gradient(135deg, #4DD0E1 0%, #C0E863 100%)',
              boxShadow: '0 20px 60px rgba(77,208,225,0.45), 0 8px 24px rgba(192,232,99,0.2)'
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-12 h-12 fill-white drop-shadow-lg animate-[iconPulse_2s_ease-in-out_infinite]"
              style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.6))' }}
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Staggered brand name */}
        <div className="overflow-hidden mb-3">
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter flex">
            {letters.map((letter, index) => (
              <span
                key={index}
                className="inline-block transition-all duration-500"
                style={{
                  opacity: textRevealed ? 1 : 0,
                  transform: textRevealed
                    ? 'translateY(0) rotateX(0)'
                    : 'translateY(110%) rotateX(-90deg)',
                  transitionDelay: `${index * 75}ms`,
                  background: 'linear-gradient(135deg, #4DD0E1 0%, #C0E863 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>

        {/* Expanding underline bar */}
        <div
          className="h-[3px] rounded-full mb-6 animate-[lineExpand_0.8s_ease-out_1s_forwards]"
          style={{
            background: 'linear-gradient(90deg, transparent, #4DD0E1, #C0E863, #4DD0E1, transparent)',
            width: '0px'
          }}
        />

        {/* Tagline */}
        <div className="overflow-hidden mb-2">
          <p
            className="text-sm md:text-base tracking-[0.45em] uppercase font-black animate-[fadeSlideUp_0.8s_ease-out_1.2s_forwards] opacity-0"
            style={{ color: '#4DD0E1' }}
          >
             where heart meets art
          </p>
        </div>

        {/* Sub-tagline badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-widest animate-[fadeIn_0.8s_ease-out_1.4s_forwards] opacity-0 mt-2"
          style={{ borderColor: 'rgba(77,208,225,0.3)', color: 'rgba(77,208,225,0.7)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-[pulse_1s_ease-in-out_infinite]"
            style={{ background: '#C0E863' }}
          />
          Arts Comes Home
        </div>

        {/* Loading bar */}
        <div className="mt-14 w-56 flex flex-col items-center gap-3 animate-[fadeIn_0.8s_ease-out_1.6s_forwards] opacity-0">
          <div
            className="w-full h-[3px] rounded-full overflow-hidden"
            style={{ background: 'rgba(77,208,225,0.15)' }}
          >
            <div
              className="h-full rounded-full animate-[loadingBar_2s_ease-in-out_1.8s_forwards]"
              style={{
                background: 'linear-gradient(90deg, #4DD0E1, #C0E863)',
                width: '0%',
                boxShadow: '0 0 12px rgba(77,208,225,0.6)'
              }}
            />
          </div>
          <p
            className="text-[10px] font-mono tracking-[0.35em] uppercase animate-[fadeInOut_1.5s_ease-in-out_infinite]"
            style={{ color: 'rgba(77,208,225,0.55)' }}
          >
            Loading your experience...
          </p>
        </div>
      </div>

      {/* Corner brackets — cyan accent */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 animate-[cornerFadeIn_1s_ease-out_0.3s_forwards] opacity-0" style={{ borderColor: 'rgba(77,208,225,0.4)' }} />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 animate-[cornerFadeIn_1s_ease-out_0.5s_forwards] opacity-0" style={{ borderColor: 'rgba(77,208,225,0.4)' }} />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 animate-[cornerFadeIn_1s_ease-out_0.7s_forwards] opacity-0" style={{ borderColor: 'rgba(192,232,99,0.35)' }} />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 animate-[cornerFadeIn_1s_ease-out_0.9s_forwards] opacity-0" style={{ borderColor: 'rgba(192,232,99,0.35)' }} />

      {/* Side label — like section "CREATOR_FIRST" tags */}
      <div
        className="absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 font-black text-[9px] uppercase tracking-[0.5em] animate-[fadeIn_1s_ease-out_1s_forwards] opacity-0 select-none"
        style={{ color: 'rgba(77,208,225,0.35)' }}
      >
        Streaming · Art · Culture
      </div>
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 font-black text-[9px] uppercase tracking-[0.5em] animate-[fadeIn_1s_ease-out_1.2s_forwards] opacity-0 select-none"
        style={{ color: 'rgba(192,232,99,0.3)' }}
      >
        Creator First · Always
      </div>
    </div>
  )
}

export default SplashScreen
