import React, { useState } from 'react'
import { useArtistModal } from '../../context/ArtistModalContext'

const Field = ({ id, label, error, children }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold text-navy">
      {label} <span className="text-[#ce6a6b]">*</span>
    </label>
    {children}
    {error && <p className="text-[#ce6a6b] text-xs mt-1">{error}</p>}
  </div>
)

const ContactUs = () => {
  const { openModal } = useArtistModal()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setSubmitted(true)
  }

  return (
    <section className="bg-linear-to-br from-[#B2EBF2]/60 via-[#E0F7FA]/70 to-[#F1F8E9] py-32 px-6 lg:px-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-lime/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-[1100px] relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="inline-block font-mono text-[10px] uppercase tracking-[0.5em] text-navy/40">Get in touch</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-navy">
            Talk to Us
          </h2>
          <div className="w-24 h-1.5 bg-linear-to-r from-primary to-lime mx-auto rounded-full" />
          <p className="text-navy/55 text-base max-w-md mx-auto leading-relaxed">
            Whether you're an art lover, an aspiring creator, or just curious — we'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Left info panel */}
          <div className="lg:col-span-2 space-y-6">
            {[
              {
                icon: '✉️',
                label: 'Email Us',
                value: 'hello@arturee.in',
                sub: 'We reply within 24 hours',
                href: 'mailto:hello@arturee.in',
              },
              {
                icon: '📸',
                label: 'Instagram',
                value: '@arturee.art',
                sub: 'Follow our journey',
                href: 'https://www.instagram.com/arturee.art',
              },
              {
                icon: '🎨',
                label: 'For Artists',
                value: 'artists@arturee.in',
                sub: 'Join us as a creator',
                href: 'mailto:artists@arturee.in',
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.label === 'Instagram' ? '_blank' : '_self'}
                rel={item.label === 'Instagram' ? 'noopener noreferrer' : undefined}
                className="flex items-start gap-4 bg-white rounded-2xl border border-primary/15 p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer block"
              >
                <span className="text-2xl mt-0.5">{item.icon}</span>
                <div>
                  <p className="font-semibold text-navy text-sm">{item.label}</p>
                  <p className="text-primary text-sm font-medium hover:underline">{item.value}</p>
                  <p className="text-navy/40 text-xs mt-0.5">{item.sub}</p>
                </div>
              </a>
            ))}

            <div className="bg-navy rounded-2xl p-6 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px]" />
              <p className="text-white font-bold text-base relative z-10">Are you an artist?</p>
              <p className="text-white/55 text-xs leading-relaxed relative z-10">
                Arturee is your sky. Share your art with the world and earn from what you love.
              </p>
              <button
                type="button"
                onClick={openModal}
                className="relative z-10 mt-2 px-5 py-2 rounded-xl bg-lime text-navy font-bold text-xs hover:bg-yellow transition-all duration-200 cursor-pointer"
              >
                Join Us →
              </button>
            </div>
          </div>

          {/* Right form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white rounded-3xl border border-primary/20 shadow-lg p-12 text-center space-y-5">
                <div className="w-16 h-16 bg-linear-to-br from-primary to-lime rounded-full flex items-center justify-center mx-auto text-white text-2xl shadow-lg">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-navy tracking-tight">Message Received!</h3>
                <p className="text-navy/55 text-sm leading-relaxed max-w-xs mx-auto">
                  Thank you for reaching out. We'll get back to you within 24 hours. You matter to us — and so does your art.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }) }}
                  className="px-6 py-2.5 rounded-2xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-all"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white rounded-3xl border border-primary/15 shadow-lg p-8 md:p-10 space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field id="name" label="Your Name" error={errors.name}>
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g. Suchi Bansal"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm text-navy placeholder:text-navy/30 focus:outline-none transition-colors ${
                        errors.name
                          ? 'border-[#ce6a6b]/60 bg-[#fef5f3] focus:border-[#ce6a6b]'
                          : 'border-primary/20 bg-[#f0fdfa]/40 focus:border-primary/60'
                      }`}
                    />
                  </Field>

                  <Field id="email" label="Email Address" error={errors.email}>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm text-navy placeholder:text-navy/30 focus:outline-none transition-colors ${
                        errors.email
                          ? 'border-[#ce6a6b]/60 bg-[#fef5f3] focus:border-[#ce6a6b]'
                          : 'border-primary/20 bg-[#f0fdfa]/40 focus:border-primary/60'
                      }`}
                    />
                  </Field>
                </div>

                <Field id="message" label="Your Message" error={errors.message}>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us what's on your mind — questions, ideas, feedback, or just a hello…"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-navy placeholder:text-navy/30 focus:outline-none transition-colors resize-none ${
                      errors.message
                        ? 'border-[#ce6a6b]/60 bg-[#fef5f3] focus:border-[#ce6a6b]'
                        : 'border-primary/20 bg-[#f0fdfa]/40 focus:border-primary/60'
                    }`}
                  />
                </Field>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-navy/35 text-xs">
                    We respect your privacy. No spam, ever.
                  </p>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-2xl bg-linear-to-r from-primary to-teal text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200"
                  >
                    Send Message →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactUs