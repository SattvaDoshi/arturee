import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-linear-to-br from-[#B2EBF2]/50 via-[#E0F7FA]/60 to-[#F1F8E9]/40 border-t border-primary/40 pt-20 pb-10 px-6 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-linear-to-br from-primary to-lime rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tighter lowercase bg-linear-to-r from-primary to-lime bg-clip-text text-transparent">arturee</span>
            </div>
            <p className="text-navy max-w-sm leading-relaxed">
              The world's premier cinematic gallery for independent voices and artistic visionaries. Stream, support, and discover.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-11 h-11 rounded-xl bg-salmon/10 flex items-center justify-center hover:bg-linear-to-br hover:from-primary hover:to-lime hover:text-white transition-all group text-[#1a2332] hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
              </a>
              <a href="#" className="w-11 h-11 rounded-xl bg-salmon/10 flex items-center justify-center hover:bg-linear-to-br hover:from-primary hover:to-lime hover:text-white transition-all group text-[#1a2332] hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-11 h-11 rounded-xl bg-salmon/10 flex items-center justify-center hover:bg-linear-to-br hover:from-primary hover:to-lime hover:text-white transition-all group text-[#1a2332] hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-navy mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-navy">
              <li><a href="#" className="hover:text-primary transition-colors font-medium">Library</a></li>
              <li><a href="#" className="hover:text-primary transition-colors font-medium">Artist Portal</a></li>
              <li><a href="#" className="hover:text-primary transition-colors font-medium">Pricing Plans</a></li>
              <li><a href="#" className="hover:text-primary transition-colors font-medium">Gift Access</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-navy mb-6">Follow the Journey</h4>
            <div className="flex gap-4">
              <a href="#" className="w-11 h-11 rounded-xl bg-salmon/10 flex items-center justify-center hover:bg-linear-to-br hover:from-primary hover:to-lime hover:text-white transition-all group text-[#1a2332] hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </a>
              <a href="#" className="w-11 h-11 rounded-xl bg-salmon/10 flex items-center justify-center hover:bg-linear-to-br hover:from-primary hover:to-lime hover:text-white transition-all group text-[#1a2332] hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>
              </a>
              <a href="#" className="w-11 h-11 rounded-xl bg-salmon/10 flex items-center justify-center hover:bg-linear-to-br hover:from-primary hover:to-lime hover:text-white transition-all group text-[#1a2332] hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-primary/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-navy/60 text-xs">© 2026 Arturee Cinematic Platform. Crafted for the curious.</p>
          <div className="flex gap-8 text-xs text-navy/60">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
