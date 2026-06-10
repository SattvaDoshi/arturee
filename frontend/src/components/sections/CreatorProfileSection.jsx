import React from 'react'

const CreatorProfileSection = () => {
  return (
    <section className="bg-linear-to-br from-[#E0F7FA]/70 via-[#B2EBF2]/40 to-[#F1F8E9]/60 pb-20 px-6 lg:px-20 overflow-hidden relative">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="font-mono text-navy/50 text-[10px] uppercase tracking-[0.5em] mb-6">
            Confidential Repository / Personnel
          </span>
          <h2 className="text-6xl font-display italic text-navy font-black tracking-tighter">
            The Dreamers
          </h2>
        </div>

        {/* Arturee Intro */}
        <div className="max-w-3xl mx-auto mb-20 text-center space-y-5">
          <p className="text-lg text-navy/70 leading-relaxed">
            Arturee is an exclusive online video streaming platform — a passion-driven space where every frame is crafted specially for <span className="font-semibold text-navy">YOU</span>.
          </p>
          <p className="text-lg text-navy/70 leading-relaxed">
            Modern life has its weights; <em>art makes it worth living.</em> We are the weighing scale between Artists and art lovers — your art meal plan to support your{' '}
            <span className="text-[#ce6a6b] font-semibold">heART</span>.
          </p>
          <p className="text-lg text-navy/70 leading-relaxed">
            Responsibilities often make life a little gloomy. Arturee is the rainbow in that sky — a sky where art gets to fly, spread its wings, and find its way to you.
          </p>
          <div className="w-16 h-0.5 bg-linear-to-r from-[#ce6a6b] to-[#4a919e] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* First Creator Card */}
          <div className="p-12 lg:-rotate-1 bg-amber-50 shadow-xl border border-black/5 rounded-lg">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
              <div className="w-48 h-64 grayscale border-4 border-white shadow-lg shrink-0">
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtBBFbXLkBJnaNtyq0WMUPTRGFrYZ0EnMAycSqgnBPEGpa-xdm9pmNaVfjSKbzWLmF8_gqHKopmmOuSWONrKUJ_hOlwukNXcQPoEjnwabPqj5h6DldsnOBNlDNGiBLUViNzj2cgSBMydqGWm-EWuYVEQJj_ZiKyuomKFfpc7XyoWsSIymcIjVkg38d2uqyzIoyewrmVTZrc4Y1wse0MMdRUudKIGJMraQh9ALeSYYrKSDgLRnJ_9ds3t9tFSJs3JCbO3y02tOE3gQ')"}}
                />
              </div>
              <div className="space-y-4 pt-4">
                <h3 className="text-4xl font-display text-[#1a2332] italic font-bold">Suchi Bansal</h3>
                <p className="text-navy/50 font-mono text-xs uppercase">Founder</p>
                <div className="h-px w-full bg-navy/10"></div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -right-4 w-32 h-32 opacity-10 pointer-events-none">
                <img 
                  alt="" 
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhrnU_SBMTZP-Kz9lRkOwcTw4KMoVOGPaDc8TEEfYuZe-Q4WTiOAcnfWc7wS_dgRIglpFfFvjm5cJcpKEYAcpcWVeM5kNt8DQmpWccFNRebaI6eK71NtgSFRQD3hQKZSNJDANRfzk9MmckE-JRrS9VEVDt6cdbOSv5e-FYjhXfAx6OpQNeJ_Ph7kGAch5lGIFEo0KUj0jiMWN5PSKk2PMUsCX-2Y_U_X08EQ9Ea5M1QVuCjdnRGOKlKphcHw9AUAGW2FNpoZmQDf4" 
                />
              </div>
              <div className="text-2xl text-navy/80 mb-8 leading-snug italic">
                "I am a poetess, a storyteller, an aspiring author — and also a Chartered Accountant who genuinely loves her job. Art and numbers both tell stories; I just speak both languages."
              </div>
              <div className="border-l-2 border-[#ce6a6b] pl-6 py-2">
                <p className="text-navy/60 text-sm italic">
                  Suchi's travels aren't just holidays — they're chapters. Every new place widens her lens, sharpens her voice, and feeds the storyteller within. Arturee was born from that same hunger: to explore, to feel, and to share.
                </p>
              </div>
            </div>
          </div>

          {/* Second Creator Card */}
          <div className="p-12 lg:rotate-1 bg-amber-50 shadow-xl border border-black/5 lg:mt-32 rounded-lg">
            <div className="flex flex-col md:flex-row-reverse gap-8 mb-12">
              <div className="w-48 h-64 grayscale border-4 border-white shadow-lg shrink-0">
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCr5z4_n5O1sPNaPj6prn7e7Hx4HIRgWkTOGMuapn59CyfK_6dB0DM_KFUb7HYofIhCHluSXWHaUKzoYuCmVavhzwrFGbcX8A1noDyi08OIqt8iDUvfP71jk34zxraA7m1KYte2mkzizZEERhjiUFfDbemZ3kGE5QpjLA8z5ZFI4X_ZGMq5XKWwuoSSY3JOxN46dV9na9ySlZE2waKvX93b93A94KOP5VGMFPJFPhs23--DIhN3Hqv_kFo0Q65uH1hrPGuEy9SNyc0')"}}
                />
              </div>
              <div className="space-y-4 pt-4 text-right md:text-left">
                <h3 className="text-4xl font-display text-navy italic font-bold">Anjali Jain</h3>
                <p className="text-navy/50 font-mono text-xs uppercase">Team Arturee</p>
                <div className="h-px w-full bg-navy/10"></div>
              </div>
            </div>
            <div className="relative">
              <div className="text-2xl text-[#1a2332]/80 mb-8 leading-snug italic">
                "Art didn't just give me a purpose; it saved my life."
              </div>
              <div className="border-l-2 border-[#4a919e] pl-6 py-2">
                <p className="text-[#2d3748] text-sm italic">
                  Anjali Jain is the author of <em>Inking Emotions</em> — a world record holder, award-winning performer, and a featured artist on many esteemed stages. For Anjali, writing isn't a hobby; it's worship. She fights every day to keep her inner artist alive against all odds and societal norms.
                </p>
              </div>
            </div>
          </div>

          {/* Third Creator Card */}
          <div className="lg:col-span-2 flex justify-center lg:mt-8">
            <div className="p-12 lg:-rotate-2 bg-amber-50 shadow-xl border border-black/5 rounded-lg w-full max-w-[580px]">
              <div className="flex flex-col md:flex-row gap-8 mb-12">
              <div className="w-48 h-64 grayscale border-4 border-white shadow-lg shrink-0">
                <div 
                  className="w-full h-full bg-cover bg-center bg-[#e2e8f0]"
                />
              </div>
              <div className="space-y-4 pt-4">
                <h3 className="text-4xl font-display text-navy italic font-bold">Shravani K.</h3>
                <p className="text-navy/50 font-mono text-xs uppercase">Team Arturee</p>
                <div className="h-px w-full bg-navy/10"></div>
              </div>
            </div>
            <div className="relative">
              <div className="text-2xl text-[#1a2332]/80 mb-8 leading-snug italic">
                "Life is too short to follow just one path"
              </div>
              <div className="border-l-2 border-[#e07a5f] pl-6 py-2">
                <p className="text-[#2d3748] text-sm italic">
                  So now she's a jack of all trades. Shravani tells stories through different mediums — through photography, videography, video editing, creative writing and much more yet to explore. She's also a bharatnatyam dancer, creating, performing and living art in every possible way!
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CreatorProfileSection
