import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'

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
    tag: 'Best Value ┬╖ Save 37%',
    description: 'Full immersion. A full year of art, yours.',
    features: ['Everything in 6 Months', 'Exclusive member badge', 'Artist Q&A sessions', '4K + Dolby quality'],
  },
]

const videoPrices = { single: 49, double: 89, triple: 129 }

const sampleVideos = [
  { id: 1, title: 'Petals in the Rain', artist: 'Suchi Bansal', genre: 'Poetry', thumb: 'poetry' },
  { id: 2, title: 'Inking Emotions ΓÇö Live', artist: 'Anjali Jain', genre: 'Spoken Word', thumb: 'spoken' },
  { id: 3, title: 'The Last Canvas', artist: 'Rohan Mehta', genre: 'Short Film', thumb: 'film' },
  { id: 4, title: 'Mitti ki Khushboo', artist: 'Priya Das', genre: 'Dance', thumb: 'dance' },
  { id: 5, title: 'Silence Speaks', artist: 'Kabir Nair', genre: 'Music', thumb: 'music' },
  { id: 6, title: 'Woven Dreams', artist: 'Aisha Qureshi', genre: 'Documentary', thumb: 'doc' },
]

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
      'Each purchased video (single, double, or triple bundle) can be streamed a maximum of 2 (two) times. Once both views are consumed, a fresh purchase is required to watch the content again. This limit applies per account and cannot be transferred.',
    highlight: true,
  },
  {
    title: 'Subscription Access',
    content:
      'Active subscribers can stream all available content without per-view restrictions for the duration of their active plan.',
  },
  {
    title: 'Refund Policy',
    content:
      'Subscription fees are non-refundable once the billing period begins and at least one piece of content has been accessed. If no content has been accessed within 24 hours of purchase, a full refund may be requested.',
  },
  {
    title: 'Cancellation Policy',
    content:
      'You may cancel your subscription at any time from your Account Settings. Cancellation takes effect at the end of the current billing period ΓÇö you will not be charged again, but access continues until the period expires. No partial refunds are issued for unused days.',
  },
  {
    title: 'Content Availability',
    content:
      'Arturee reserves the right to add, modify, or remove content from the platform at any time. Purchased videos that are taken down will remain accessible to buyers for their remaining view count.',
  },
  {
    title: 'Account & Sharing',
    content:
      'Accounts are for individual use only. Sharing login credentials is prohibited. Concurrent streams are limited by plan ΓÇö monthly allows 1 stream, quarterly 2, and half-yearly/yearly allows 3 simultaneous streams.',
  },
]

const Pricing = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState('subscribe')
  const [openTerm, setOpenTerm] = useState(null)

  return (
    <div>
        <Navbar/>
        <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9]">
      {/* Hero */}
      <div className="relative pt-20 pb-16 px-6 lg:px-20 text-center overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-5">
          <span className="inline-block font-mono text-[10px] uppercase tracking-[0.5em] text-navy/40">
            Plans & Pricing
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-navy leading-tight">
            Nourish Your{' '}
            <span className="bg-linear-to-r from-primary to-lime bg-clip-text text-transparent">
              heART
            </span>
          </h1>
          <p className="text-lg text-navy/60 max-w-xl mx-auto leading-relaxed">
            Choose how you want to experience art ΓÇö a full subscription feast, or hand-pick the pieces that move you.
          </p>
          {/* Tab Toggle */}
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
        </div>
      </div>

      <div className="px-6 lg:px-20 pb-20">
        {/* ΓöÇΓöÇ SUBSCRIPTION PLANS ΓöÇΓöÇ */}
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
                        Γé╣{plan.price.toLocaleString('en-IN')}
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
                        <span className={`mt-0.5 text-base ${plan.highlight ? 'text-lime' : 'text-primary'}`}>Γ£ô</span>
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

            {/* Subscription note */}
            <p className="text-center text-navy/40 text-xs mt-6 font-mono">
              All prices in Indian Rupees (INR) ┬╖ GST applicable ┬╖ Auto-renews unless cancelled
            </p>
          </div>
        )}

        {/* ΓöÇΓöÇ Bundle ΓöÇΓöÇ */}
        {tab === 'video' && (
          <div className="max-w-[1200px] mx-auto">
            {/* Bundle pricing info */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
              {[
                { count: 1, label: 'Single Video', price: videoPrices.single, save: null },
                { count: 2, label: 'Bundle of 2', price: videoPrices.double, save: `Save Γé╣${2 * videoPrices.single - videoPrices.double}` },
                { count: 3, label: 'Bundle of 3', price: videoPrices.triple, save: `Save Γé╣${3 * videoPrices.single - videoPrices.triple}` },
              ].map((tier) => (
                <div
                  key={tier.count}
                  onClick={() => navigate('/checkout', { state: { type: 'video', plan: tier.label, price: tier.price } })}
                  className="flex-1 max-w-xs bg-white border border-primary/20 rounded-2xl p-5 text-center shadow-sm cursor-pointer transition-transform hover:-translate-y-2 hover:shadow-lg"
                >
                  <p className="text-navy/40 font-mono text-[10px] uppercase tracking-widest mb-1">{tier.label}</p>
                  <p className="text-3xl font-black text-navy">Γé╣{tier.price}</p>
                  {tier.save && (
                    <span className="inline-block mt-2 px-3 py-0.5 bg-lime/30 text-navy text-xs font-semibold rounded-full">
                      {tier.save}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-center text-navy/40 text-xs mt-6 font-mono">
              All prices in Indian Rupees (INR) ┬╖ GST applicable ┬╖ Per-purchase 2-view limit applies
            </p>
          </div>
        )}

        {/* ΓöÇΓöÇ TERMS & CONDITIONS ΓöÇΓöÇ */}
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
                className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 shadow-sm ${
                  item.highlight
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
                    className={`text-2xl transition-transform duration-300 ${
                      openTerm === i ? 'rotate-45' : ''
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
