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
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  const letters = "Arturee".split("")

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-800 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #E8DFD0 50%, #D4C4B0 100%)' }}
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating orb 1 */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] animate-[floatOrb1_8s_ease-in-out_infinite]"
          style={{ 
            background: 'radial-gradient(circle, rgba(201,184,163,0.6) 0%, transparent 70%)',
            top: '10%',
            left: '-10%'
          }}
        />
        {/* Large floating orb 2 */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-[80px] animate-[floatOrb2_10s_ease-in-out_infinite]"
          style={{ 
            background: 'radial-gradient(circle, rgba(212,196,176,0.5) 0%, transparent 70%)',
            bottom: '5%',
            right: '-5%'
          }}
        />
        {/* Accent orb */}
        <div 
          className="absolute w-[300px] h-[300px] rounded-full blur-[60px] animate-[floatOrb3_6s_ease-in-out_infinite]"
          style={{ 
            background: 'radial-gradient(circle, rgba(139,126,116,0.3) 0%, transparent 70%)',
            top: '40%',
            right: '20%'
          }}
        />
      </div>

      {/* Decorative lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-[1px] animate-[lineSlide_3s_ease-in-out_infinite]"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(139,126,116,${0.1 + i * 0.05}), transparent)`,
              width: `${150 + i * 50}px`,
              top: `${20 + i * 15}%`,
              left: '-200px',
              animationDelay: `${i * 0.4}s`
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-[particleFloat_4s_ease-in-out_infinite]"
            style={{
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
              background: `rgba(139,126,116,${0.2 + Math.random() * 0.3})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with ripple effect */}
        <div className="relative mb-10">
          {/* Ripple rings */}
          <div className="absolute inset-0 -m-8">
            <div 
              className="absolute inset-0 rounded-full border-2 animate-[ripple_2s_ease-out_infinite]"
              style={{ borderColor: 'rgba(201,184,163,0.4)' }}
            />
            <div 
              className="absolute inset-0 rounded-full border-2 animate-[ripple_2s_ease-out_infinite_0.5s]"
              style={{ borderColor: 'rgba(201,184,163,0.3)' }}
            />
            <div 
              className="absolute inset-0 rounded-full border-2 animate-[ripple_2s_ease-out_infinite_1s]"
              style={{ borderColor: 'rgba(201,184,163,0.2)' }}
            />
          </div>
          
          {/* Rotating border */}
          <div className="absolute -inset-4 animate-[spin_8s_linear_infinite]">
            <div 
              className="w-full h-full rounded-3xl"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(201,184,163,0.8), transparent, rgba(139,126,116,0.6), transparent)',
                padding: '2px'
              }}
            >
              <div className="w-full h-full rounded-3xl" style={{ background: '#E8DFD0' }} />
            </div>
          </div>

          {/* Logo container */}
          <div 
            className="relative w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl animate-[scaleIn_0.8s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
            style={{ 
              background: 'linear-gradient(135deg, #C9B8A3 0%, #8B7E74 100%)',
              boxShadow: '0 25px 60px rgba(139,126,116,0.4), 0 10px 30px rgba(74,63,53,0.2)'
            }}
          >
            {/* Play icon with glow */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-12 h-12 fill-white drop-shadow-lg animate-[iconPulse_2s_ease-in-out_infinite]"
              style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Animated brand name with staggered letters */}
        <div className="overflow-hidden mb-4">
          <h1 className="text-6xl md:text-8xl font-display font-bold flex">
            {letters.map((letter, index) => (
              <span
                key={index}
                className="inline-block transition-all duration-500"
                style={{
                  opacity: textRevealed ? 1 : 0,
                  transform: textRevealed ? 'translateY(0) rotateX(0)' : 'translateY(100%) rotateX(-90deg)',
                  transitionDelay: `${index * 80}ms`,
                  background: 'linear-gradient(135deg, #8B7E74 0%, #4A3F35 100%)',
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

        {/* Animated underline */}
        <div 
          className="h-1 rounded-full mb-6 animate-[lineExpand_0.8s_ease-out_1s_forwards]"
          style={{ 
            background: 'linear-gradient(90deg, transparent, #C9B8A3, #8B7E74, #C9B8A3, transparent)',
            width: '0px'
          }}
        />

        {/* Tagline with typewriter effect */}
        <div className="overflow-hidden">
          <p 
            className="text-lg md:text-xl tracking-[0.4em] uppercase font-light animate-[fadeSlideUp_0.8s_ease-out_1.2s_forwards] opacity-0"
            style={{ color: '#8B7E74' }}
          >
            Where Artists Come Alive
          </p>
        </div>

        {/* Animated loading section */}
        <div className="mt-14 flex flex-col items-center animate-[fadeIn_0.8s_ease-out_1.5s_forwards] opacity-0">
          {/* Morphing loader */}
          <div className="relative w-16 h-16 mb-4">
            <div 
              className="absolute inset-0 rounded-full animate-[morphLoader_2s_ease-in-out_infinite]"
              style={{ 
                border: '3px solid transparent',
                borderTopColor: '#C9B8A3',
                borderRightColor: '#8B7E74'
              }}
            />
            <div 
              className="absolute inset-2 rounded-full animate-[morphLoader_2s_ease-in-out_infinite_reverse]"
              style={{ 
                border: '2px solid transparent',
                borderBottomColor: '#D4C4B0',
                borderLeftColor: '#C9B8A3'
              }}
            />
            <div 
              className="absolute inset-4 rounded-full animate-[pulse_1s_ease-in-out_infinite]"
              style={{ background: 'rgba(201,184,163,0.3)' }}
            />
          </div>
          
          {/* Loading text */}
          <p 
            className="text-sm tracking-widest animate-[fadeInOut_1.5s_ease-in-out_infinite]"
            style={{ color: '#8B7E74' }}
          >
            Loading your experience...
          </p>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 rounded-tl-3xl animate-[cornerFadeIn_1s_ease-out_0.3s_forwards] opacity-0" style={{ borderColor: 'rgba(139,126,116,0.3)' }} />
      <div className="absolute top-8 right-8 w-20 h-20 border-r-2 border-t-2 rounded-tr-3xl animate-[cornerFadeIn_1s_ease-out_0.5s_forwards] opacity-0" style={{ borderColor: 'rgba(139,126,116,0.3)' }} />
      <div className="absolute bottom-8 left-8 w-20 h-20 border-l-2 border-b-2 rounded-bl-3xl animate-[cornerFadeIn_1s_ease-out_0.7s_forwards] opacity-0" style={{ borderColor: 'rgba(139,126,116,0.3)' }} />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 rounded-br-3xl animate-[cornerFadeIn_1s_ease-out_0.9s_forwards] opacity-0" style={{ borderColor: 'rgba(139,126,116,0.3)' }} />

      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  )
}

export default SplashScreen
