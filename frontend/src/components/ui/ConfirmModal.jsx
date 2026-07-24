import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDestructive = true }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,29,46,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-6 relative flex flex-col items-center text-center shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg transition">
          <X className="w-5 h-5 text-white/40" />
        </button>

        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-500/15 text-red-400' : 'bg-[#4DD0E1]/15 text-[#4DD0E1]'}`}>
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-white mb-2">{title}</h3>
        <p className="text-sm text-white/50 mb-6">{message}</p>

        <div className="flex w-full gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
            style={isDestructive 
              ? { background: '#f87171', color: '#051d2e' }
              : { background: '#4DD0E1', color: '#051d2e' }
            }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
