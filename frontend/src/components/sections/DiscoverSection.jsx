import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { landingConfigApi } from '../../api/index.js'

const DEFAULT_CARDS = [
  {
    title: 'Visual Symphony',
    subtitle: '',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBnsgMc-9vWB2jVZnNY9OxoK8_BaZASds2u3vuoZZc4O7X0MDZWge7YPEJtPFWKGKcOK9n8fdj7q_tvvKjH2PIbS8sG1Rh3vDSk1TVEbhDVGK7u0LzC1JQLs6sPuTfmhUgDFENXG_haHS5GFKfnpXrpGLQOsFhHBaMxfIYhahDCScBhiD6VnLxXG9vvOAKh0kEvytrJhTXy5GHTF1QV8jVz5F5UQrBHINz-gtU7ujs1LMASn9d9VGc0bA9oKxl_LQt3M84YGgbN--4',
    tag: 'Featured Premiere',
    link: '/pricing',
  },
  {
    title: 'Digital Renaissance',
    subtitle: 'Original Series • 8 Episodes',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCt-jEXc91uTeJMaVK6zjnOMFJKCGus_B1r6AYlGDj7_wlxzJJBj_lRGPAWkyiE4Qr7cD4sfnnIdlZ3bSfgEuHe89crQEMsg3-ReTjP-VsU7nFrMufroLvl2bb7Hz5wWv1HzpQ_PZVZ_NebgzWxa_pBZpZLxR2Gpg8fOVsTWb9266HoYO5I924k2u04SvPfegjaO3GWO6B8EPlCUe2h44GXeTJD8Xeer3p1eV5E31cIXxxzHmgt5I0Sx4Ny_RKL1i8NICHTI6242mQ',
    tag: 'Trending',
    link: '/pricing',
  },
  {
    title: 'The Beat Lab',
    subtitle: 'Documentary • Feature Film',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDORGisarDYAqiHhwqXhYY4WJNNlgj2-xTq1FnVgjAhSlFDLWIHSnN0BTssUzt-B3SegXY1P0OTnOLyOPsxsBP3HcUPad0uxdr7a3D5jEV2kEvyNbdgDyE4z8D4lnNshop8mrxEwEmvktNDOZq_7VYRiuDS-LNg9xnqAABIzCrNeTEPaFezdoe_QKqILe1LWPMYt8AXrdeSvSsbottdWIGtzjVO4KmsTHdxx8rB-u3hnWjRXN0FnFfTts5w-JYkpsSh_Q1C6LSR3Yg',
    tag: '',
    link: '/pricing',
  },
  {
    title: 'Vivid Sessions',
    subtitle: 'Live Sessions • Weekly',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSlu6MXincC_nuFxgb0-Qvvi98L2ihaUkswQOo-vb-lFvwESZwA-LdRVspW60Iny8RYTUaL4Ja1TMJ5JeFLL8V3SoUsgPHbo_goFB2AYNXyH1LExdnnkRSudA47pH8kPDDUHrFsLZDQ4AzPU98TYnGaWvPk4vRPLXdiyLiz15XJoDcjwmTc0hdzANZI83gpdb0XODPeJxofCLh9C_EenN5SJJsfR56_URLhCtCsiEWzYSKMLbTr3vs_cU9hGtU8mPKrldjwSdeMRo',
    tag: '',
    link: '/pricing',
  },
  {
    title: 'Neon Pulse',
    subtitle: '',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCsy8ybTozKR1HiRFdBhwUpfnIGozYNMfABlXdQSgfAjiMjlUC3_inSVNVMv0vf3VQy0tt5e39uzqccD28xR9aQjOTVCj1NBgt-KYcyYBysCMcUCR7RGxqHpPugUXfq18gRtF8JPVi6-lR_Fd7jsZlWfWVtAeB2YDeWTObwihEy4BFEbO5hckAKWe7z4Eo36D2eg2oIiitpulF8UxpA6mzZg9djheSNosdv_VdsKLChme6M28deuo6FmJKD7T5k3fPmH9h7PHjz_e8',
    tag: '',
    link: '/pricing',
  },
]

const DiscoverSection = () => {
  const [sectionData, setSectionData] = useState({
    headline: 'Exclusive Art',
    subheadline: 'Art : Anywhere and Everywhere',
    ctaText: 'View All',
    ctaLink: '/pricing',
    cards: DEFAULT_CARDS,
  })

  useEffect(() => {
    let isMounted = true
    const fetchConfig = async () => {
      try {
        const res = await landingConfigApi.get()
        if (!isMounted) return
        const discover = res.data?.data?.discoverSection
        if (discover) {
          setSectionData({
            headline: discover.headline || 'Exclusive Art',
            subheadline: discover.subheadline || 'Art : Anywhere and Everywhere',
            ctaText: discover.ctaText || 'View All',
            ctaLink: discover.ctaLink || '/pricing',
            cards:
              discover.cards?.length > 0 ? discover.cards : DEFAULT_CARDS,
          })
        }
      } catch (err) {
        console.error('Failed to load discover section config:', err)
      }
    }
    fetchConfig()
    return () => {
      isMounted = false
    }
  }, [])

  const { headline, subheadline, ctaText, ctaLink, cards } = sectionData
  const c1 = cards[0] || DEFAULT_CARDS[0]
  const c2 = cards[1] || DEFAULT_CARDS[1]
  const c3 = cards[2] || DEFAULT_CARDS[2]
  const c4 = cards[3] || DEFAULT_CARDS[3]
  const c5 = cards[4] || DEFAULT_CARDS[4]

  return (
    <section className="py-20 bg-linear-to-br from-[#B2EBF2]/60 via-[#E0F7FA]/80 to-[#F1F8E9]/60 md:px-20 px-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-navy">
              {headline}
            </h2>
            <p className="text-navy/70 mt-2 font-medium">{subheadline}</p>
          </div>
          <Link
            to={ctaLink || '/pricing'}
            className="bg-linear-to-r from-primary to-lime text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-1 hover:shadow-lg hover:scale-105 transition-all"
          >
            {ctaText || 'View All'} <span className="text-sm">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 rounded-2xl sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[200px]">
          {/* Large Hero Card (#1) */}
          <Link
            to={c1.link || '/pricing'}
            className="lg:col-span-2 lg:row-span-2 rounded-2xl overflow-hidden group relative shadow-2xl"
          >
            <img
              alt={c1.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              src={c1.imageUrl}
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#1A1A1A]/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              {c1.tag && (
                <span className="bg-linear-to-r from-primary to-lime text-white text-[10px] font-black px-3 py-1 rounded-full uppercase mb-4 inline-block shadow-lg">
                  {c1.tag}
                </span>
              )}
              <h3 className="text-3xl font-black drop-shadow-lg">
                {c1.title}
              </h3>
              {c1.subtitle && (
                <p className="text-[#ebaca2] text-sm mt-1 drop-shadow">
                  {c1.subtitle}
                </p>
              )}
            </div>
          </Link>

          {/* Tall Card (#2) */}
          <Link
            to={c2.link || '/pricing'}
            className="lg:col-span-1 rounded-2xl lg:row-span-3 overflow-hidden group relative shadow-xl"
          >
            <img
              alt={c2.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              src={c2.imageUrl}
            />
            {c2.tag && (
              <div className="absolute top-6 left-6">
                <span className="px-3 py-1 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-full">
                  {c2.tag}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-transform translate-y-4 group-hover:translate-y-0">
              <h3 className="text-xl font-bold drop-shadow-lg">
                {c2.title}
              </h3>
              {c2.subtitle && (
                <p className="text-[#ebaca2] text-sm drop-shadow">
                  {c2.subtitle}
                </p>
              )}
            </div>
          </Link>

          {/* Medium Card (#3) */}
          <Link
            to={c3.link || '/pricing'}
            className="lg:col-span-1 rounded-2xl lg:row-span-2 overflow-hidden group relative shadow-xl"
          >
            <img
              alt={c3.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              src={c3.imageUrl}
            />
            {c3.tag && (
              <div className="absolute top-6 left-6">
                <span className="px-3 py-1 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-full">
                  {c3.tag}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-all">
              <h3 className="text-xl font-bold drop-shadow-lg">
                {c3.title}
              </h3>
              {c3.subtitle && (
                <p className="text-[#ebaca2] text-sm drop-shadow">
                  {c3.subtitle}
                </p>
              )}
            </div>
          </Link>

          {/* Medium Card 2 (#4) */}
          <Link
            to={c4.link || '/pricing'}
            className="lg:col-span-1 rounded-2xl lg:row-span-2 overflow-hidden group relative shadow-xl"
          >
            <img
              alt={c4.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              src={c4.imageUrl}
            />
            {c4.tag && (
              <div className="absolute top-6 left-6">
                <span className="px-3 py-1 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-full">
                  {c4.tag}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-all">
              <h3 className="text-xl font-bold drop-shadow-lg">
                {c4.title}
              </h3>
              {c4.subtitle && (
                <p className="text-[#ebaca2] text-sm drop-shadow">
                  {c4.subtitle}
                </p>
              )}
            </div>
          </Link>

          {/* Small Card (#5) */}
          <Link
            to={c5.link || '/pricing'}
            className="lg:col-span-1 rounded-2xl lg:row-span-1 overflow-hidden group relative shadow-xl"
          >
            <img
              alt={c5.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              src={c5.imageUrl}
            />
            {c5.tag && (
              <div className="absolute top-4 left-4">
                <span className="px-2 py-0.5 bg-primary/90 backdrop-blur-md text-white text-[9px] font-black uppercase rounded-full">
                  {c5.tag}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-all">
              <h3 className="text-lg font-bold drop-shadow-lg text-[#ebaca2]">
                {c5.title}
              </h3>
              {c5.subtitle && (
                <p className="text-white/80 text-xs drop-shadow">
                  {c5.subtitle}
                </p>
              )}
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DiscoverSection

