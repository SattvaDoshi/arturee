import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import { landingConfigApi } from '../../api/index.js'

const subscriptionPlans = [
  {
    label: 'Monthly',
    price: 199,
    period: 'month',
    tag: null,
    description: 'Perfect to explore Arturee at your own pace.',
    features: ['Unlimited streaming', 'Access to new releases', 'Mobile & desktop', 'HD quality'],
  },
  {
    label: '3 Months',
    price: 499,
    period: '3 months',
    tag: 'Save 16%',
    description: 'Commit a season to art. Your heART will thank you.',
    features: ['Everything in Monthly', 'Priority new content', 'HD quality'],
  },
  {
    label: '6 Months',
    price: 849,
    period: '6 months',
    tag: 'Save 29%',
    description: 'Half a year of pure inspiration, uninterrupted.',
    features: ['Everything in 3 Months', 'Early access to events', 'Creator notes & scripts', '4K quality'],
    highlight: true,
  },
  {
    label: 'Yearly',
    price: 1499,
    period: 'year',
    tag: 'Best Value · Save 37%',
    description: 'Full immersion. A full year of art, yours.',
    features: ['Everything in 6 Months', 'Exclusive member badge', 'Artist Q&A sessions', '4K + Dolby quality'],
  },
]

const videoPrices = { single: 49, double: 89, triple: 129 }


const thumbColors = {
  poetry: 'from-[#B2EBF2] to-[#4DD0E1]',
  spoken: 'from-[#F8BBD0] to-[#ce6a6b]',
  film: 'from-[#D1C4E9] to-[#7E57C2]',
  dance: 'from-[#DCEDC8] to-[#C0E863]',
  music: 'from-[#FFE0B2] to-[#FF9800]',
  doc: 'from-[#CFD8DC] to-[#607D8B]',
}

const termsItems = [
  {
    title: 'Per-Video Watch Limit',
    content:
      'Each purchased video  can be streamed a maximum of 2 (two) times. Once both views are consumed, a fresh purchase is required to watch the content again. This limit applies per account and cannot be transferred.',
    highlight: true,
  },
  // {
  //   title: 'Subscription Access',
  //   content:
  //     'Active subscribers can stream all available content without per-view restrictions for the duration of their active plan.',
  // },
  {
    title: 'Refund Policy',
    content:
      'Subscription fees are non-refundable once the billing period begins and at least one piece of content has been accessed. If no content has been accessed within 24 hours of purchase, a full refund may be requested. However it will be at the discretion of Arturee',
  },
  // {
  //   title: 'Cancellation Policy',
  //   content:
  //     'You may cancel your subscription at any time from your Account Settings. Cancellation takes effect at the end of the current billing period — you will not be charged again, but access continues until the period expires. No partial refunds are issued for unused days.',
  // },
  {
    title: 'Content Availability',
    content:
      'Arturee reserves the right to add, modify, or remove content from the platform at any time. Purchased videos that are taken down will remain accessible to buyers for their remaining view count.',
  },
  {
    title: 'Account & Sharing',
    content:
      'Accounts are for individual use only. Sharing login credentials is prohibited.',
  },
  {
    title: 'Anti-Piracy & Screen Recording',
    content:
      'All videos are dynamically watermarked with your registered name and email address. Unauthorized screen recording, downloading, or distribution of content is strictly prohibited, and strict legal action will be taken against any violations.',
    highlight: true,
  },
]

const Pricing = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState('video')
  const [openTerm, setOpenTerm] = useState(null)
  const [landingConfig, setLandingConfig] = useState(null)

  useEffect(() => {
    landingConfigApi
      .get()
      .then((res) => setLandingConfig(res.data?.data || null))
      .catch(() => null)
  }, [])

  const pricingHeadline = landingConfig?.pricingSection?.headline || 'Pricing'
  const pricingSubheadline =
    landingConfig?.pricingSection?.subheadline ||
    'Choose how you want to experience art — pay per video per minute.'
  const activePlans =
    landingConfig?.pricingSection?.plans && landingConfig.pricingSection.plans.length > 0
      ? landingConfig.pricingSection.plans
      : [
        {
          label: 'Single Video',
          price: videoPrices.single,
          save: null,
          desc: 'Watch any single video on the platform with 2 streams included.',
          highlight: false,
          points: ['2 streams per video', 'HD quality streaming', 'Standard Rate', 'Instant access'],
        },
        {
          label: 'Bundle of 2',
          price: videoPrices.double,
          save: `Save Rs. ${2 * videoPrices.single - videoPrices.double}`,
          desc: 'Hand-pick 2 videos of your choice at a discounted bundle price.',
          highlight: false,
          points: ['Everything in Single', '2 videos of your choice', 'Discounted bundle price', 'HD quality streaming'],
        },
        {
          label: 'Bundle of 3',
          price: videoPrices.triple,
          save: `Save Rs. ${3 * videoPrices.single - videoPrices.triple}`,
          desc: 'Best value! Choose 3 videos and enjoy immersive storytelling.',
          highlight: true,
          points: ['Best Value bundle', '3 videos of your choice', 'Maximum savings', '4K + Dolby quality'],
        },
      ]

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9]">
        {/* Hero */}
        <div className="relative pt-20 pb-16 px-6 lg:px-20 text-center overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-5">
            <span className="inline-block font-mono text-[10px] uppercase tracking-[0.5em] text-navy/40">
              {pricingHeadline}
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-navy leading-tight">
              Nourish Your{' '}
              <span className="bg-linear-to-r from-primary to-lime text-white px-3 py-1 md:px-4 md:py-2 inline-block transform rough-border text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl shadow-lg">
                heART
              </span>
            </h1>
            <p className="text-lg text-navy/60 max-w-xl mx-auto leading-relaxed">
              {pricingSubheadline}
            </p>
            {/* TAB TOGGLE: Subscription commented out for now, keep pay per video active */}
            {/*
          <div className="inline-flex bg-white border border-primary/20 rounded-2xl p-1.5 shadow-sm mt-4">
            <button
              onClick={() => setTab('subscribe')}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                tab === 'subscribe'
                  ? 'bg-linear-to-r from-primary to-teal text-white shadow-md'
                  : 'text-navy/50 hover:text-navy'
              }`}
            >
              Subscription
            </button>
            <button
              onClick={() => setTab('video')}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                tab === 'video'
                  ? 'bg-linear-to-r from-primary to-teal text-white shadow-md'
                  : 'text-navy/50 hover:text-navy'
              }`}
            >
              Bundle
            </button>
          </div>
          */}
          </div>
        </div>

        <div className="px-6 lg:px-20 pb-20">
          {/* SUBSCRIPTION PLANS (commented out for future use) */}
          {/*
        {tab === 'subscribe' && (
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.label}
                  className={`relative flex flex-col rounded-3xl border p-7 transition-all duration-300 ${
                    plan.highlight
                      ? 'bg-navy text-white border-navy shadow-2xl scale-105'
                      : 'bg-white border-primary/20 shadow-md hover:shadow-xl hover:border-primary/50'
                  }`}
                >
                  {plan.tag && (
                    <span
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        plan.highlight
                          ? 'bg-lime text-navy'
                          : 'bg-primary/15 text-primary border border-primary/30'
                      }`}
                    >
                      {plan.tag}
                    </span>
                  )}
                  <div className="mb-6">
                    <p className={`font-mono text-[10px] uppercase tracking-widest mb-2 ${plan.highlight ? 'text-lime' : 'text-primary'}`}>
                      {plan.label}
                    </p>
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-navy'}`}>
                        Rs. {plan.price.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-sm mb-1.5 ${plan.highlight ? 'text-white/60' : 'text-navy/40'}`}>
                        / {plan.period}
                      </span>
                    </div>
                    <p className={`text-sm mt-3 leading-relaxed ${plan.highlight ? 'text-white/70' : 'text-navy/50'}`}>
                      {plan.description}
                    </p>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span className={`mt-0.5 text-base ${plan.highlight ? 'text-lime' : 'text-primary'}`}>✓</span>
                        <span className={plan.highlight ? 'text-white/80' : 'text-navy/70'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/checkout', { state: { type: 'subscription', plan: plan.label, price: plan.price } })}
                    className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
                      plan.highlight
                        ? 'bg-lime text-navy hover:bg-[#a8d356]'
                        : 'bg-linear-to-r from-primary to-teal text-white hover:shadow-lg hover:shadow-primary/30'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>

            <p className="text-center text-navy/40 text-xs mt-6 font-mono">
              All prices in Indian Rupees (INR) · GST applicable · Auto-renews unless cancelled
            </p>
          </div>
        )}
        */}

          {/* PAY PER VIDEO & BUNDLES */}
          {tab === 'video' && (
            <div className="max-w-[800px] mx-auto">
              <div className="relative flex flex-col items-center justify-center rounded-3xl border bg-navy text-white border-navy shadow-2xl p-6 md:p-12 text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-lime/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10">
                  <span className="inline-block px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-lime text-navy mb-6">
                    Simple & Transparent
                  </span>
                  <p className="font-mono text-sm uppercase tracking-widest mb-2 font-bold text-lime">
                    Pay for what you watch
                  </p>
                  <div className="my-6 flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white whitespace-nowrap">
                      1 min = ₹1
                    </span>
                  </div>
                  <p className="text-lg mt-4 leading-relaxed text-white/80 max-w-md mx-auto">
                    This is our simple pricing for videos. Enjoy high-quality streaming without any complex bundles.
                  </p>

                  <ul className="space-y-3 mt-8 text-left max-w-sm mx-auto flex-1">
                    <li className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 text-base font-bold text-lime">✓</span>
                      <span className="text-white/90">HD quality streaming</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 text-base font-bold text-lime">✓</span>
                      <span className="text-white/90">Pay exactly for video duration</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 text-base font-bold text-lime">✓</span>
                      <span className="text-white/90">Instant access to content</span>
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-center text-navy/40 text-xs mt-6 font-mono">
                All prices in Indian Rupees (INR) · GST applicable · Per-purchase 2-view limit applies
              </p>
            </div>
          )}

          {/* TERMS & CONDITIONS */}
          <div className="max-w-[900px] mx-auto mt-24">
            <div className="text-center mb-10 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-navy">
                Terms, Policies & Fair Use
              </h2>
              <div className="w-16 h-1 bg-linear-to-r from-primary to-lime mx-auto rounded-full" />
              <p className="text-navy/50 text-sm max-w-lg mx-auto">
                We believe in being transparent. Here's everything you need to know before you dive in.
              </p>
            </div>

            <div className="space-y-4">
              {termsItems.map((item, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 shadow-sm ${item.highlight
                      ? 'border-[#ce6a6b]/30 hover:border-[#ce6a6b]/60'
                      : 'border-primary/15 hover:border-primary/40'
                    }`}
                >
                  <button
                    onClick={() => setOpenTerm(openTerm === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      {item.highlight && (
                        <span className="w-2 h-2 rounded-full bg-[#ce6a6b] shrink-0" />
                      )}
                      <h3 className={`font-semibold text-base ${item.highlight ? 'text-[#ce6a6b]' : 'text-navy'}`}>
                        {item.title}
                      </h3>
                    </span>
                    <span
                      className={`text-2xl transition-transform duration-300 ${openTerm === i ? 'rotate-45' : ''
                        } ${item.highlight ? 'text-[#ce6a6b]' : 'text-primary'}`}
                    >
                      +
                    </span>
                  </button>
                  {openTerm === i && (
                    <div className="px-6 pb-6 text-navy/60 text-sm leading-relaxed">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-center text-navy/30 text-xs mt-8 font-mono">
              By using Arturee, you agree to these terms. Last updated March 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
