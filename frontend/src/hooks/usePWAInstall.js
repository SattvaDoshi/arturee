import { useState, useEffect } from "react"

/**
 * Shared PWA install hook.
 * Returns: canInstall, isInstalled, isIOS, triggerInstall
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  const standaloneNow =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true

  const [isInstalled, setIsInstalled] = useState(() => {
    if (standaloneNow) return true
    return localStorage.getItem("pwa-installed") === "true"
  })

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  useEffect(() => {
    if (isInstalled) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const installedHandler = () => {
      setIsInstalled(true)
      localStorage.setItem("pwa-installed", "true")
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", installedHandler)
    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [isInstalled])

  const triggerInstall = async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setIsInstalled(true)
      localStorage.setItem("pwa-installed", "true")
    }
    setDeferredPrompt(null)
    return outcome === "accepted"
  }

  return { canInstall: !!deferredPrompt, isInstalled, isIOS, triggerInstall }
}
