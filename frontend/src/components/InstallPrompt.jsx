import { useState } from 'react'
import { Download, X, Share, PlusSquare, ArrowUp, CheckCircle } from 'lucide-react'
import { usePWAInstall } from '../hooks/usePWAInstall'

/**
 * Floating bottom-right PWA install button.
 * Hidden when already installed. Persists across reloads via localStorage.
 */
export default function InstallPrompt() {
  const { canInstall, isInstalled, isIOS, triggerInstall } = usePWAInstall()
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Hide if already installed, dismissed, or no way to install on this platform
  if (isInstalled || dismissed || (!canInstall && !isIOS)) return null

  const handleInstall = async () => {
    if (canInstall) {
      await triggerInstall()
    } else if (isIOS) {
      setShowIOSGuide(true)
    }
  }

  return (
    <>
      {/* ── Floating Install Button (bottom-right) ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-full bg-white/80 hover:bg-white text-[#051d2e]/50 hover:text-[#051d2e] shadow transition"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleInstall}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-[#051d2e] shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-sm"
          style={{ background: 'linear-gradient(135deg, #4DD0E1, #C0E863)' }}
          title="Install App"
        >
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      </div>

      {/* ── iOS Guide Modal ── */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#051d2e]/50 backdrop-blur-sm"
            onClick={() => setShowIOSGuide(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
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
              <h3 className="text-lg font-black text-[#051d2e]">Install Arturee</h3>
              <p className="text-xs text-[#051d2e]/70 mt-1">Add to your home screen for the best experience</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <Step num={1} icon={<Share className="w-5 h-5 text-[#4DD0E1]" />} title="Tap the Share button" desc="At the bottom of your Safari browser" />
              <Step num={2} icon={<PlusSquare className="w-5 h-5 text-[#4DD0E1]" />} title='Tap "Add to Home Screen"' desc="Scroll down in the share sheet to find it" />
              <Step num={3} icon={<ArrowUp className="w-5 h-5 text-[#C0E863]" />} title='Tap "Add"' desc="The app will appear on your home screen" />
            </div>

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

function Step({ num, icon, title, desc }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-[#E0F7FA] flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-[#051d2e]">
          <span className="text-[#4DD0E1] mr-1">{num}.</span>{title}
        </p>
        <p className="text-xs text-[#051d2e]/60 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

