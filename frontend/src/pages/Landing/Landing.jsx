import React from 'react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import HeroSection from '../../components/sections/HeroSection'
import DiscoverSection from '../../components/sections/DiscoverSection'
import CTASection from '../../components/sections/CTASection'
import InstallPrompt from '../../components/InstallPrompt'
import ContactUs from '../../components/sections/ContactUs'

const App = () => {
  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9] text-navy font-display antialiased selection:bg-primary/30">
        <Navbar />
        <main>
          <HeroSection />
          <DiscoverSection />
          <CTASection />
          <ContactUs/>
        </main>
        <Footer />
        <InstallPrompt />
      </div>
    </>
  )
}

export default App