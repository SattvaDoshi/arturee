import React from 'react'

const CreatorProfileSection = () => {
  return (
    <section className="bg-linear-to-br from-[#E0F7FA]/70 via-[#B2EBF2]/40 to-[#F1F8E9]/60 pb-20 px-6 lg:px-20 overflow-hidden relative">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="font-mono text-navy/50 text-[10px] uppercase tracking-[0.5em] mb-6">
            art comes home
          </span>
          <div className='flex gap-6 justify-center items-center'>
            <h2 className="text-6xl font-display italic text-navy font-black tracking-tighter">
              The
            </h2>
            <span className='bg-linear-to-r from-primary to-lime text-white px-3 py-1 md:px-4 md:py-2 inline-block transform rough-border text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl shadow-lg'>
              Dreamers
            </span>
          </div>
        </div>

        {/* Arturee Intro */}
        <div className="max-w-3xl mx-auto mb-20 text-center space-y-5">
          <p className="text-lg text-navy/70 leading-relaxed">
            Every great journey comes with moments of doubt and unexpected challenges, but we anchored ourselves in one simple truth.
          </p>
          <p className="text-2xl md:text-3xl font-black italic text-transparent bg-clip-text bg-linear-to-r from-[#ce6a6b] to-[#4a919e] leading-relaxed py-2">
            "If a dream is planted in your heart, it is yours to build"
          </p>
          <p className="text-lg text-navy/70 leading-relaxed">
            Together, we pushed through and finally, we have turned our vision into reality.
          </p>
          <div className="w-16 h-0.5 bg-linear-to-r from-[#ce6a6b] to-[#4a919e] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* First Creator Card */}
          <div className="p-12 lg:-rotate-1 bg-navy/95 text-white shadow-2xl border border-white/10 rounded-3xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
              <div className="w-48 h-64 border-4 border-white/20 shadow-lg shrink-0">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: "url('/Suchi1.jpg')" }}
                />
              </div>
              <div className="space-y-4 pt-4">
                <h3 className="text-4xl font-display text-white italic font-bold">Suchi Bansal</h3>
                <p className="text-white/50 font-mono text-xs uppercase">CEO (Founder)</p>
                <div className="h-px w-full bg-white/10"></div>
              </div>
            </div>
            <div className="relative">
              <div className="text-2xl text-white/90 mb-8 leading-snug italic">
                "I am a poetess, a storyteller, an aspiring author — and also a Chartered Accountant who genuinely loves her job. Art and numbers both tell stories; I just speak both languages."
              </div>
              <div className="border-l-2 border-[#ce6a6b] pl-6 py-2">
                <p className="text-white/70 text-sm italic">
                  Suchi Bansal lives life with a singular mission: to explore everything it has to offer. A Chartered Accountant by day and a storyteller at heart, she is a Financial Analyst who balances the structured world of numbers with a fearless pursuit of creative and spiritual growth. Suchi embraces a multi-passionate life as a poet, storyteller, and aspiring author and actively learns Hindustani classical music and classical Kathak dance. As an avid traveler, she uses her journeys to deeply understand diverse perspectives which expand her horizons as both a human being and a creator. The latest colour to her vision is finding Arturee—a dream she intends to paint the art world with!
                </p>
              </div>
            </div>
          </div>

          {/* Second Creator Card */}
          <div className="p-12 lg:rotate-1 bg-navy/95 text-white shadow-2xl border border-white/10 lg:mt-32 rounded-3xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row-reverse gap-8 mb-12">
              <div className="w-48 h-64 border-4 border-white/20 shadow-lg shrink-0">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: "url('/Anjali%20Jain.jpg')" }}
                />
              </div>
              <div className="space-y-4 pt-4 text-right md:text-left">
                <h3 className="text-4xl font-display text-white italic font-bold">Anjali Jain</h3>
                <p className="text-white/50 font-mono text-xs uppercase">CEO</p>
                <div className="h-px w-full bg-white/10"></div>
              </div>
            </div>
            <div className="relative">
              <div className="text-2xl text-white/90 mb-8 leading-snug italic">
                "Art didn't just give me a purpose; it saved my life."
              </div>
              <div className="border-l-2 border-[#4a919e] pl-6 py-2">
                <p className="text-white/70 text-sm italic">
                  Anjali Jain is the author of <em>Inking Emotions</em> — a world record holder, award-winning performer, and a featured artist on many esteemed stages. For Anjali, writing isn't a hobby; it's worship. She fights every day to keep her inner artist alive against all odds and societal norms.
                </p>
              </div>
            </div>
          </div>


        </div>

        {/* Gratitude Section */}
        <div className="max-w-3xl mx-auto mt-20 text-center space-y-6">
          <div className="w-16 h-1 bg-linear-to-r from-[#ce6a6b] to-[#4a919e] mx-auto mb-8 rounded-full opacity-50"></div>
          <p className="text-xl text-navy/80 leading-relaxed italic font-medium">
            "This wouldn't have been possible without the support of the artists, our friends, and our family."
          </p>
          <p className="text-lg text-navy/70 leading-relaxed">
            Thank you, <span className="font-bold text-[#ce6a6b]">Nirmala Bansal</span>, for making it possible for us!
          </p>
          <p className="text-lg text-navy/70 leading-relaxed">
            Gratitude to our web team <span className="font-bold text-[#4a919e]">Sattva Doshi</span> and <span className="font-bold text-[#4a919e]">Akshat Mandot</span> for doing such a commendable job.
          </p>
        </div>
      </div>
    </section>
  )
}

export default CreatorProfileSection
