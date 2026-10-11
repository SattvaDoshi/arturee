import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Mail, Youtube, MessageCircle, ChevronLeft } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import UserLayout from '../../components/layout/UserLayout'
import { useAuth } from '../../context/AuthContext'

function DashboardAbout() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* ── Page Header / Info Card ── */}
      <div
        className="rounded-3xl p-6 sm:p-10 border border-[#4DD0E1]/30 shadow-sm relative overflow-hidden"
        style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-[#4DD0E1]/20 via-[#C0E863]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center justify-center w-8 h-8 rounded-xl border border-[#4DD0E1]/30 text-[#051d2e]/60 hover:text-[#051d2e] hover:border-[#4DD0E1] hover:bg-white/50 transition shrink-0"
              title="Back to Dashboard"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <span
              className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#051d2e]"
              style={{ background: 'linear-gradient(135deg, #4DD0E1, #C0E863)' }}
            >
              Info
            </span>
            <span className="text-xs font-bold text-[#051d2e]/50 uppercase tracking-widest">
              About arturee
            </span>
          </div>

          <h1 className="text-2xl sm:text-3.5xl font-black text-[#051d2e] tracking-tight leading-snug">
            Welcome to arturee—your front-row seat to exclusive poetry and storytelling performances.
          </h1>

          <p className="text-base sm:text-lg text-[#051d2e]/75 leading-relaxed font-medium max-w-3xl">
            Explore the endless depths of creativity built entirely from words, passion, and imagination. Experience the magical journey—all from the comfort of your home.
          </p>
        </div>
      </div>

      {/* ── About the Team ── */}
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#051d2e]/50">
            Vision & Leadership
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#051d2e] tracking-tight mt-1">
            About the Team
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Suchi Bansal */}
          <div
            className="rounded-3xl p-6 sm:p-8 border border-[#4DD0E1]/25 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-[#4DD0E1]/50"
            style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)' }}
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-[#4DD0E1]/30 shrink-0 shadow-md">
                  <img
                    src="/Suchi1.jpg"
                    alt="Suchi Bansal"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#051d2e]">Suchi Bansal</h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#051d2e]/50 mt-0.5">
                    Co-Founder
                  </p>
                  <a
                    href="https://www.instagram.com/suchhee.23"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold text-[#ce6a6b] bg-[#ce6a6b]/10 hover:bg-[#ce6a6b]/20 transition"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>@suchhee.23</span>
                  </a>
                </div>
              </div>

              <blockquote className="text-sm sm:text-base text-[#051d2e]/80 italic leading-relaxed pl-4 border-l-2 border-[#4DD0E1]">
                "I am a poetess, a storyteller, an aspiring author — and also a Chartered Accountant who genuinely loves her job. Art and numbers both tell stories; I just speak both languages."
              </blockquote>
            </div>
          </div>

          {/* Anjali Jain */}
          <div
            className="rounded-3xl p-6 sm:p-8 border border-[#4DD0E1]/25 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-[#4DD0E1]/50"
            style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)' }}
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-[#C0E863]/40 shrink-0 shadow-md">
                  <img
                    src="/Anjali Jain.jpg"
                    alt="Anjali Jain"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#051d2e]">Anjali Jain</h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#051d2e]/50 mt-0.5">
                    Co-Founder
                  </p>
                  <a
                    href="https://www.instagram.com/a.j.moyotales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold text-[#ce6a6b] bg-[#ce6a6b]/10 hover:bg-[#ce6a6b]/20 transition"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>@a.j.moyotales</span>
                  </a>
                </div>
              </div>

              <blockquote className="text-sm sm:text-base text-[#051d2e]/80 italic leading-relaxed pl-4 border-l-2 border-[#C0E863]">
                “Art didn't just give me a purpose; it saved my life,” says Anjali Jain—an author who fights to keep her inner artist thriving against all odds and societal norms. Anjali is the creative mind behind the book 'Inking Emotions'. A world record holder and award-winning performer, she has graced many esteemed platforms as a featured artist. For her, writing isn't just a hobby—it's worship.
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact Us ── */}
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#051d2e]/50">
            Connect
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#051d2e] tracking-tight mt-1">
            Contact Us
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mail */}
          <a
            href="mailto:support@arturee.com"
            className="p-5 rounded-2xl border border-[#4DD0E1]/25 hover:border-[#4DD0E1] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            style={{ background: 'rgba(255, 255, 255, 0.75)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-[#4DD0E1]/15 text-[#00BCD4] group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#051d2e]/50">Email</p>
              <p className="text-sm font-bold text-[#051d2e] mt-0.5 truncate">support@arturee.com</p>
            </div>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/arturee_art/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl border border-[#4DD0E1]/25 hover:border-[#ce6a6b] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            style={{ background: 'rgba(255, 255, 255, 0.75)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-[#ce6a6b]/15 text-[#ce6a6b] group-hover:scale-110 transition-transform">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#051d2e]/50">Instagram</p>
              <p className="text-sm font-bold text-[#051d2e] mt-0.5">@arturee_art</p>
            </div>
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com/@arturee_art?si=iKkQXMrpacLWZpjR"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl border border-[#4DD0E1]/25 hover:border-red-400 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            style={{ background: 'rgba(255, 255, 255, 0.75)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-red-500/15 text-red-500 group-hover:scale-110 transition-transform">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#051d2e]/50">YouTube</p>
              <p className="text-sm font-bold text-[#051d2e] mt-0.5">@arturee_art</p>
            </div>
          </a>

          {/* WhatsApp Community */}
          <a
            href="https://chat.whatsapp.com/DMZ724Vxg44DQgpOAqwHRq"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl border border-[#4DD0E1]/25 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, rgba(77,208,225,0.15), rgba(192,232,99,0.25))' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-emerald-500/20 text-emerald-600 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">WhatsApp Community</p>
              <p className="text-sm font-black text-[#051d2e] mt-0.5">Join Community</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

const AboutUs = ({ inDashboard = false }) => {
  if (inDashboard) {
    return (
      <UserLayout>
        <DashboardAbout />
      </UserLayout>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9]">
      <Navbar />
      <section className="bg-linear-to-br from-[#E0F7FA]/70 via-[#B2EBF2]/40 to-[#F1F8E9]/60 pb-20 px-6 lg:px-20 overflow-hidden relative">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="font-mono text-navy/50 text-[10px] uppercase tracking-[0.5em] mb-6">
            art comes home
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-navy leading-tight">
            The{' '}
            <span className="bg-linear-to-r from-primary to-lime text-white px-3 py-1 md:px-4 md:py-2 inline-block transform rough-border text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl shadow-lg">
              Dreamers
            </span>
          </h2>
        </div>

        {/* arturee Intro */}
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
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-white/50 font-mono text-xs uppercase">CEO & Founder</p>
                  <span className="text-white/30">•</span>
                  <a
                    href="https://www.instagram.com/suchhee.23"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-[#ce6a6b]/60 to-transparent hover:from-[#ce6a6b]/40 border border-[#ce6a6b]/30 hover:border-[#ce6a6b]/60 transition-all group shadow-sm"
                  >
                    <Instagram size={14} className="text-[#ce6a6b] group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-xs text-[#ce6a6b] font-medium tracking-wide">Sakhiii</span>
                  </a>

                </div>
                <div className="h-px w-full bg-white/10"></div>
              </div>
            </div>
            <div className="relative">
              <div className="text-2xl text-white/90 mb-8 leading-snug italic">
                "I am a poetess, a storyteller, an aspiring author — and also a Chartered Accountant who genuinely loves her job. Art and numbers both tell stories; I just speak both languages."
              </div>
              <div className="border-l-2 border-[#ce6a6b] pl-6 py-2">
                <p className="text-white/70 text-sm italic">
                  Suchi Bansal lives life with a singular mission: to explore everything it has to offer. A Chartered Accountant by day and a storyteller at heart, she is a Financial Analyst who balances the structured world of numbers with a fearless pursuit of creative and spiritual growth. <br /> <br /> Suchi embraces a multi-passionate life as a poet, storyteller, and aspiring author and actively learns Hindustani classical music and classical Kathak dance. As an avid traveler, she uses her journeys to deeply understand diverse perspectives which expand her horizons as both a human being and a creator. The latest colour to her vision is finding arturee—a dream she intends to paint the art world with!
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
                <div className="flex flex-wrap items-center justify-end md:justify-start gap-3">
                  <p className="text-white/50 font-mono text-xs uppercase">CEO</p>
                  <span className="text-white/30">•</span>
                  <a
                    href="https://www.instagram.com/a.j.moyotales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-[#4a919e]/40 to-transparent hover:from-[#4a919e]/40 border border-[#4a919e]/30 hover:border-[#4a919e]/60 transition-all group shadow-sm"
                  >
                    <Instagram size={14} className="text-[#4a919e] group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-xs text-[#4a919e] font-medium tracking-wide">a.j.moyotales</span>
                  </a>
                </div>
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
    <Footer />
  </div>
)
}

export default AboutUs
