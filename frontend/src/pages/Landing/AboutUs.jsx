import React from 'react'
import CreatorProfileSection from '../../components/sections/CreatorProfileSection'
import Navbar from '../../components/layout/Navbar'

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9] text-navy font-display antialiased selection:bg-primary/30">
        <Navbar/>
        <CreatorProfileSection />
    </div>
  )
}

export default AboutUs
