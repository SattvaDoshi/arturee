import { useState, useEffect } from "react"

let globalDeferredPrompt = null;
let promptListeners = [];

// Listen globally immediately when the module loads, so we don't miss the event
if (typeof window !== 'undefined') {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    promptListeners.forEach(listener => listener(e));
  });

  window.addEventListener("appinstalled", () => {
    localStorage.setItem("pwa-installed", "true");
    globalDeferredPrompt = null;
    promptListeners.forEach(listener => listener(null));
  });
}

/**
 * Shared PWA install hook.
 * Returns: canInstall, isInstalled, isIOS, triggerInstall
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(globalDeferredPrompt)

  const standaloneNow =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true

  const [isInstalled, setIsInstalled] = useState(() => {
    if (standaloneNow) return true
    return localStorage.getItem("pwa-installed") === "true"
  })

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  useEffect(() => {
    // Keep deferredPrompt in sync with global state
    const handler = (e) => setDeferredPrompt(e)
    promptListeners.push(handler)
    
    setDeferredPrompt(globalDeferredPrompt)

    // Sync isInstalled across tabs
    const storageHandler = (e) => {
      if (e.key === "pwa-installed" && e.newValue === "true") {
        setIsInstalled(true)
      }
    }
    window.addEventListener("storage", storageHandler)

    return () => {
      promptListeners = promptListeners.filter(l => l !== handler)
      window.removeEventListener("storage", storageHandler)
    }
  }, [])

  const triggerInstall = async () => {
    if (!globalDeferredPrompt) return false
    try {
      globalDeferredPrompt.prompt()
      const { outcome } = await globalDeferredPrompt.userChoice
      if (outcome === "accepted") {
        setIsInstalled(true)
        localStorage.setItem("pwa-installed", "true")
      }
      globalDeferredPrompt = null
      promptListeners.forEach(l => l(null))
      return outcome === "accepted"
    } catch (err) {
      console.error("Install prompt failed:", err)
      return false
    }
  }

  return { canInstall: !!deferredPrompt, isInstalled, isIOS, triggerInstall }
}

