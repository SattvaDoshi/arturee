import React, { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/sections/HeroSection'
import DiscoverSection from '../components/sections/DiscoverSection'
import CreatorProfileSection from '../components/sections/CreatorProfileSection'
import CTASection from '../components/sections/CTASection'
import SplashScreen from '../components/SplashScreen'

const App = () => {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9] text-navy font-display antialiased selection:bg-primary/30">
        <Navbar />
        <main>
          <HeroSection />
          <DiscoverSection />
          <CreatorProfileSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App