import React, { useState } from 'react'

const CTASection = () => {
  const [openFaq, setOpenFaq] = useState(0) // First FAQ open by default

  const faqs = [
    {
      question: "How does the revenue sharing work?",
      answer: "We operate on a radical transparency model. 85% of net subscription fees are pooled and distributed to creators based on a weighted engagement metric that values completion rates over \"clickbait\" views."
    },
    {
      question: "Is there a focus on specific art forms?",
      answer: "While we host a diverse range of content, our core pillars are poetry, cinematic shorts, deep-dive podcasts, and live performance art that challenges the status quo."
    },
    {
      question: "Can I download content for offline viewing?",
      answer: "Yes, all members can download their favorite pieces via our mobile applications to enjoy art wherever their journey takes them."
    }
  ]

  return (
    <section className="bg-linear-to-br from-[#B2EBF2]/60 via-[#E0F7FA]/70 to-[#F1F8E9] py-32 px-6 lg:px-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime/35 rounded-full blur-[100px]"></div>
      <div className="mx-auto max-w-[900px] relative z-10">
        <div className="text-center mb-20 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-navy">Common Inquiries</h2>
          <div className="w-24 h-1.5 bg-linear-to-r from-primary to-lime mx-auto rounded-full"></div>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group bg-white rounded-3xl border overflow-hidden transition-all duration-300 shadow-sm ${
                index === 0 
                  ? 'border-coral/20 hover:bg-[#fef5f3] hover:border-primary' 
                  : 'border-[#80DEEA]/20 hover:bg-[#E0F7FA]/30 hover:border-primary'
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-8 text-left focus:outline-none"
              >
                <h3 className="text-xl font-semibold bg-linear-to-r from-primary to-lime bg-clip-text text-transparent pr-8">
                  {faq.question}
                </h3>
                <span className={`text-primary transform transition-transform duration-500 text-3xl ${openFaq === index ? 'rotate-180' : ''}`}>
                  +
                </span>
              </button>
              {openFaq === index && (
                <div className="px-8 pb-8 text-navy/80 leading-relaxed text-lg">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CTASection
