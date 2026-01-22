import React from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HeroSection from './components/sections/HeroSection'
import DiscoverSection from './components/sections/DiscoverSection'
import VideoDetailSection from './components/sections/VideoDetailSection'
import CreatorProfileSection from './components/sections/CreatorProfileSection'
import CTASection from './components/sections/CTASection'

const App = () => {
  return (
    <div className="min-h-screen bg-cream text-deepbrown font-sans antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <DiscoverSection />
        <VideoDetailSection />
        {/* <CreatorProfileSection /> */}
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default App