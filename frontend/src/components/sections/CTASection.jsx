import React, { useState } from 'react'

const CTASection = () => {
  const [openFaq, setOpenFaq] = useState(0) // First FAQ open by default

  const faqs = [
    {
      question: "What is Arturee?",
      answer: "Arturee is an exclusive online video streaming platform — a passion-driven space where art meets soul. Modern life has its weights; art makes it worth living. Think of Arturee as your art meal plan: a curated destination that nourishes your heART, serving as the bridge between visionary artists and the people who love their work."
    },
    {
      question: "Who is Arturee for?",
      answer: "Arturee is for YOU. Whether you're an art lover seeking an emotional journey or a creator ready to share your voice with the world — this is your sky to fly, spread your wings, and let art breathe. Because art is not just something you watch; art is YOU."
    },
    {
      question: "What does Arturee offer?",
      answer: "Arturee brings everything you love about art to a single destination at your fingertips — exclusive content crafted by our artists specially for you, a platform where artists earn for their passion, and an experience designed to ignite the artist within you. Our content is your rainbow in a gloomy sky."
    },
    {
      question: "How much does it cost?",
      answer: "For viewers, we offer flexible pricing combinations to suit your lifestyle. For artists ready to share their craft, click the Join Us button to become part of the Arturee family and start earning from your passion."
    },
    {
      question: "Why choose Arturee?",
      answer: "We are sincere, simple, and honest dreamers coming together to fulfil our passion for art. We live by three values: True to Art and Artist, What's Inside is Outside, and Free Will. By choosing Arturee, you're not just subscribing to content — you're becoming part of a movement. By not choosing us, well… you'd break our heART."
    }
  ]

  return (
    <section className="bg-linear-to-br from-[#B2EBF2]/60 via-[#E0F7FA]/70 to-[#F1F8E9] py-32 px-6 lg:px-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime/35 rounded-full blur-[100px]"></div>
      <div className="mx-auto max-w-[900px] relative z-10">
        <div className="text-center mb-20 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-navy">Everything You Need to Know</h2>
          <div className="w-24 h-1.5 bg-linear-to-r from-primary to-lime mx-auto rounded-full"></div>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group bg-white rounded-3xl border overflow-hidden transition-all duration-300 shadow-sm ${
                index % 2 === 0
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
