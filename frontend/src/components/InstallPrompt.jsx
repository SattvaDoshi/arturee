import { useState, useEffect } from 'react'
import { Download, X, Share, PlusSquare, ArrowUp } from 'lucide-react'

/**
 * Detects platform and offers PWA install.
 *  - Android / Desktop Chrome: triggers native beforeinstallprompt
 *  - iOS Safari: shows manual step-by-step instructions
 *  - Already installed (standalone): hidden entirely
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  const isInStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  const [installed, setInstalled] = useState(isInStandalone)

  useEffect(() => {
    if (isInStandalone) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const installedHandler = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [isInStandalone])

  // Don't show if already installed, dismissed, or in standalone mode
  if (installed || dismissed || isInStandalone) return null

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setDeferredPrompt(null)
    }
  }

  const canInstallNative = !!deferredPrompt

  return (
    <>
      {/* ── Floating Install Button (bottom-right) ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-full bg-white/80 hover:bg-white text-[#051d2e]/50 hover:text-[#051d2e] shadow transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            if (canInstallNative) handleInstall()
            else if (isIOS) setShowIOSGuide(true)
            else handleInstall() // fallback
          }}
          className=" p-4 rounded-2xl font-bold text-[#051d2e] shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-sm"
          style={{ background: 'linear-gradient(135deg, #4DD0E1, #C0E863)' }}
        >
          <Download className="w-5 h-5 group-hover:animate-bounce" />
          
        </button>
      </div>

      {/* ── iOS Guide Modal ── */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#051d2e]/50 backdrop-blur-sm"
            onClick={() => setShowIOSGuide(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            {/* Header */}
            <div
              className="px-6 pt-6 pb-4 text-center"
              style={{ background: 'linear-gradient(135deg, #4DD0E1, #C0E863)' }}
            >
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/30 hover:bg-white/50 transition"
              >
                <X className="w-4 h-4 text-[#051d2e]" />
              </button>
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/30 flex items-center justify-center shadow-lg">
                <Download className="w-8 h-8 text-[#051d2e]" />
              </div>
              <h3 className="text-lg font-black text-[#051d2e]">Install ART</h3>
              <p className="text-xs text-[#051d2e]/70 mt-1">Add to your home screen for the best experience</p>
            </div>

            {/* Steps */}
            <div className="px-6 py-5 space-y-4">
              <Step
                num={1}
                icon={<Share className="w-5 h-5 text-primary" />}
                title="Tap the Share button"
                desc="At the bottom of your Safari browser"
              />
              <Step
                num={2}
                icon={<PlusSquare className="w-5 h-5 text-primary" />}
                title='Tap "Add to Home Screen"'
                desc="Scroll down in the share sheet to find it"
              />
              <Step
                num={3}
                icon={<ArrowUp className="w-5 h-5 text-lime" />}
                title='Tap "Add"'
                desc="The app will appear on your home screen"
              />
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-3.5 rounded-xl font-bold text-[#051d2e] text-sm hover:scale-[1.02] transition-all"
                style={{ background: 'linear-gradient(135deg, #4DD0E1, #C0E863)' }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0 }
          to   { transform: translateY(0); opacity: 1 }
        }
        .animate-slideUp { animation: slideUp 0.35s ease-out; }
      `}</style>
    </>
  )
}

/* ── Step Row ── */
function Step({ num, icon, title, desc }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-[#E0F7FA] flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-[#051d2e]">
          <span className="text-primary mr-1">{num}.</span>{title}
        </p>
        <p className="text-xs text-[#051d2e]/60 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
