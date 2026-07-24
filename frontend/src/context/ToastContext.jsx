import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast])
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100"
            style={{ 
              background: '#071523', 
              border: '1px solid rgba(255,255,255,0.1)',
              minWidth: '280px'
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#C0E863]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <p className="text-sm text-white font-medium flex-1">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white/80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Global toast object for non-component usage
export const toast = {
  success: (msg) => {
    const event = new CustomEvent('toast', { detail: { message: msg, type: 'success' } })
    window.dispatchEvent(event)
  },
  error: (msg) => {
    const event = new CustomEvent('toast', { detail: { message: msg, type: 'error' } })
    window.dispatchEvent(event)
  }
}

export const GlobalToastListener = () => {
  const { success, error } = useContext(ToastContext)
  
  useEffect(() => {
    const handler = (e) => {
      if (e.detail.type === 'success') success(e.detail.message)
      else error(e.detail.message)
    }
    window.addEventListener('toast', handler)
    return () => window.removeEventListener('toast', handler)
  }, [success, error])
  
  return null
}
