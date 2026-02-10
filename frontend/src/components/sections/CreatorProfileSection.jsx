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
            The Custodians
          </h2>
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
                <div className="inline-block px-3 py-1 bg-[#ce6a6b]/10 text-[#ce6a6b] font-mono text-[10px] uppercase">
                  Subject: New Users
                </div>
                <h3 className="text-4xl font-display text-[#1a2332] italic font-bold">Suchi</h3>
                <p className="text-navy/50 font-mono text-xs uppercase">Founder / Principal Curator</p>
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
                "Art is the only way to run away without leaving home. My mission was to build a sanctuary where those journeys are never interrupted by algorithms, only enhanced by curation."
              </div>
              <div className="border-l-2 border-[#ce6a6b] pl-6 py-2">
                <p className="text-navy/60 text-sm italic">
                  Personal Journal Entry #402: We curate for the soul, not for the scroll. If a piece of art doesn't make you pause your breath, it isn't ready for our gallery.
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
                <div className="inline-block px-3 py-1 bg-[#4a919e]/10 text-[#4a919e] font-mono text-[10px] uppercase">
                  Subject: Variation
                </div>
                <h3 className="text-4xl font-display text-navy italic font-bold">Anjali Mehta</h3>
                <p className="text-navy/50 font-mono text-xs uppercase">Editorial Director</p>
                <div className="h-px w-full bg-navy/10"></div>
              </div>
            </div>
            <div className="relative">
              <div className="text-2xl text-[#1a2332]/80 mb-8 leading-snug italic">
                "The modern world is loud; we chose to be quiet. Our philosophy centers on the resonance of the human voice—whether spoken in a poem or captured in a frame."
              </div>
              <div className="border-l-2 border-[#4a919e] pl-6 py-2">
                <p className="text-[#2d3748] text-sm italic">
                  Foundational Philosophy: When you give artists 85% of the revenue, you aren't just paying them; you're buying the time they need to create their next masterpiece.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CreatorProfileSection
