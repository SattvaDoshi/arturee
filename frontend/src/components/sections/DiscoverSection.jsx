import React from 'react'

const DiscoverSection = () => {
  return (
    <section className="py-20 bg-linear-to-br from-[#B2EBF2]/60 via-[#E0F7FA]/80 to-[#F1F8E9]/60 md:px-20 px-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-navy">Exclusive Originals</h2>
            <p className="text-navy/70 mt-2 font-medium">Immerse yourself in our hand-picked masterpieces</p>
          </div>
          <a className="bg-linear-to-r from-primary to-lime text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-1 hover:shadow-lg hover:scale-105 transition-all" href="#all">
            View All <span className="text-sm">→</span>
          </a>
        </div>
        <div className="grid grid-cols-1 rounded-2xl sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[200px]">
          {/* Large Hero Card */}
          <div className="lg:col-span-2 lg:row-span-2 rounded-2xl overflow-hidden group relative shadow-2xl">
            <img alt="Hero Featured" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnsgMc-9vWB2jVZnNY9OxoK8_BaZASds2u3vuoZZc4O7X0MDZWge7YPEJtPFWKGKcOK9n8fdj7q_tvvKjH2PIbS8sG1Rh3vDSk1TVEbhDVGK7u0LzC1JQLs6sPuTfmhUgDFENXG_haHS5GFKfnpXrpGLQOsFhHBaMxfIYhahDCScBhiD6VnLxXG9vvOAKh0kEvytrJhTXy5GHTF1QV8jVz5F5UQrBHINz-gtU7ujs1LMASn9d9VGc0bA9oKxl_LQt3M84YGgbN--4" />
            <div className="absolute inset-0 bg-linear-to-t from-[#1A1A1A]/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="bg-linear-to-r from-primary to-lime text-white text-[10px] font-black px-3 py-1 rounded-full uppercase mb-4 inline-block shadow-lg">
                Featured Premiere
              </span>
              <h3 className="text-3xl font-black drop-shadow-lg">Visual Symphony</h3>
            </div>
          </div>
          
          {/* Tall Card */}
          <div className="lg:col-span-1 rounded-2xl lg:row-span-3 overflow-hidden group relative shadow-xl">
            <img alt="Digital Renaissance" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt-jEXc91uTeJMaVK6zjnOMFJKCGus_B1r6AYlGDj7_wlxzJJBj_lRGPAWkyiE4Qr7cD4sfnnIdlZ3bSfgEuHe89crQEMsg3-ReTjP-VsU7nFrMufroLvl2bb7Hz5wWv1HzpQ_PZVZ_NebgzWxa_pBZpZLxR2Gpg8fOVsTWb9266HoYO5I924k2u04SvPfegjaO3GWO6B8EPlCUe2h44GXeTJD8Xeer3p1eV5E31cIXxxzHmgt5I0Sx4Ny_RKL1i8NICHTI6242mQ" />
            <div className="absolute top-6 left-6">
              <span className="px-3 py-1 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-full">Trending</span>
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-transform translate-y-4 group-hover:translate-y-0">
              <h3 className="text-xl font-bold drop-shadow-lg">Digital Renaissance</h3>
              <p className="text-[#ebaca2] text-sm drop-shadow">Original Series • 8 Episodes</p>
            </div>
          </div>
          
          {/* Medium Card */}
          <div className="lg:col-span-1 rounded-2xl lg:row-span-2 overflow-hidden group relative shadow-xl">
            <img alt="The Beat Lab" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDORGisarDYAqiHhwqXhYY4WJNNlgj2-xTq1FnVgjAhSlFDLWIHSnN0BTssUzt-B3SegXY1P0OTnOLyOPsxsBP3HcUPad0uxdr7a3D5jEV2kEvyNbdgDyE4z8D4lnNshop8mrxEwEmvktNDOZq_7VYRiuDS-LNg9xnqAABIzCrNeTEPaFezdoe_QKqILe1LWPMYt8AXrdeSvSsbottdWIGtzjVO4KmsTHdxx8rB-u3hnWjRXN0FnFfTts5w-JYkpsSh_Q1C6LSR3Yg" />
            <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-all">
              <h3 className="text-xl font-bold drop-shadow-lg">The Beat Lab</h3>
              <p className="text-[#ebaca2] text-sm drop-shadow">Documentary • Feature Film</p>
            </div>
          </div>
          
          {/* Medium Card 2 */}
          <div className="lg:col-span-1 rounded-2xl lg:row-span-2 overflow-hidden group relative shadow-xl">
            <img alt="Vivid Sessions" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSlu6MXincC_nuFxgb0-Qvvi98L2ihaUkswQOo-vb-lFvwESZwA-LdRVspW60Iny8RYTUaL4Ja1TMJ5JeFLL8V3SoUsgPHbo_goFB2AYNXyH1LExdnnkRSudA47pH8kPDDUHrFsLZDQ4AzPU98TYnGaWvPk4vRPLXdiyLiz15XJoDcjwmTc0hdzANZI83gpdb0XODPeJxofCLh9C_EenN5SJJsfR56_URLhCtCsiEWzYSKMLbTr3vs_cU9hGtU8mPKrldjwSdeMRo" />
            <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-all">
              <h3 className="text-xl font-bold drop-shadow-lg">Vivid Sessions</h3>
              <p className="text-[#ebaca2] text-sm drop-shadow">Live Sessions • Weekly</p>
            </div>
          </div>
          
          {/* Small Card */}
          <div className="lg:col-span-1 rounded-2xl lg:row-span-1 overflow-hidden group relative shadow-xl">
            <img alt="Neon Pulse" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsy8ybTozKR1HiRFdBhwUpfnIGozYNMfABlXdQSgfAjiMjlUC3_inSVNVMv0vf3VQy0tt5e39uzqccD28xR9aQjOTVCj1NBgt-KYcyYBysCMcUCR7RGxqHpPugUXfq18gRtF8JPVi6-lR_Fd7jsZlWfWVtAeB2YDeWTObwihEy4BFEbO5hckAKWe7z4Eo36D2eg2oIiitpulF8UxpA6mzZg9djheSNosdv_VdsKLChme6M28deuo6FmJKD7T5k3fPmH9h7PHjz_e8" />
            <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-all">
              <h3 className="text-lg font-bold drop-shadow-lg text-[#ebaca2]">Neon Pulse</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DiscoverSection
