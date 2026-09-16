import { LogIn, MonitorSmartphone, Wifi } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BRAND_TEAL = '#4DD0E1'
const BRAND_LIME = '#C0E863'
const BRAND_NAVY = '#051d2e'

const REASON_CONFIG = {
  SESSION_INVALIDATED: {
    icon:    MonitorSmartphone,
    title:   'Logged In Elsewhere',
    message: 'Your account was signed in on another device.',
    detail:  'For your security, this session has been terminated. Only one active session is allowed per account.',
    color:   '#f97316',
  },
  SESSION_INVALIDATED_IP: {
    icon:    Wifi,
    title:   'Network Changed',
    message: 'Your session was terminated because your network location changed significantly.',
    detail:  'For security, Arturee only allows playback from the same network. Please log in again from your current location.',
    color:   '#8b5cf6',
  },
  DEFAULT: {
    icon:    MonitorSmartphone,
    title:   'Session Ended',
    message: 'Your session was terminated for security reasons.',
    detail:  'Please sign in again to continue watching.',
    color:   BRAND_TEAL,
  },
}

/**
 * KickedModal
 *
 * Shown when the user's session is forcibly terminated by the server.
 * Covers the full viewport with a blur backdrop so no content is visible.
 *
 * @param {{ code: string, message: string } | null} reason  — from AuthContext
 * @param {() => void} onDismiss — clears the reason from context state
 */
export default function KickedModal({ reason, onDismiss }) {
  const navigate = useNavigate()

  if (!reason) return null

  const config = REASON_CONFIG[reason.code] || REASON_CONFIG.DEFAULT
  const Icon   = config.icon

  const handleSignIn = () => {
    onDismiss()
    navigate('/login')
  }

  return (
    <div
      style={{
        position:            'fixed',
        inset:               0,
        zIndex:              99999,
        display:             'flex',
        alignItems:          'center',
        justifyContent:      'center',
        padding:             '1rem',
        background:          'rgba(5,29,46,0.97)',
        backdropFilter:      'blur(24px)',
        WebkitBackdropFilter:'blur(24px)',
        animation:           'kicked-fade 0.3s ease',
      }}
    >
      <style>{`
        @keyframes kicked-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes kicked-slide {
          from { opacity: 0; transform: translateY(32px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        style={{
          maxWidth:    '400px',
          width:       '100%',
          background:  'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          border:      `1px solid ${config.color}44`,
          borderRadius:'20px',
          padding:     'clamp(28px, 6vw, 44px)',
          textAlign:   'center',
          boxShadow:   `0 0 80px ${config.color}18, 0 32px 64px rgba(0,0,0,0.7)`,
          animation:   'kicked-slide 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Icon ring */}
        <div
          style={{
            width:          '76px',
            height:         '76px',
            borderRadius:   '50%',
            background:     `${config.color}15`,
            border:         `2px solid ${config.color}50`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 20px',
            boxShadow:      `0 0 28px ${config.color}28`,
          }}
        >
          <Icon size={34} color={config.color} strokeWidth={1.5} />
        </div>

        {/* Arturee badge */}
        <div
          style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          '6px',
            background:   'rgba(77,208,225,0.08)',
            border:       '1px solid rgba(77,208,225,0.2)',
            borderRadius: '100px',
            padding:      '4px 14px',
            marginBottom: '18px',
          }}
        >
          <span style={{ color: BRAND_TEAL, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            🔒 Session Terminated
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            color:        '#ffffff',
            fontSize:     'clamp(20px, 4.5vw, 24px)',
            fontWeight:   700,
            marginBottom: '12px',
            lineHeight:   1.3,
          }}
        >
          {config.title}
        </h2>

        {/* Server message (may differ from config.message) */}
        <p
          style={{
            color:        'rgba(255,255,255,0.8)',
            fontSize:     '14px',
            lineHeight:   1.65,
            marginBottom: '10px',
          }}
        >
          {reason.message || config.message}
        </p>

        {/* Guidance */}
        <p
          style={{
            color:        'rgba(255,255,255,0.4)',
            fontSize:     '13px',
            lineHeight:   1.55,
            marginBottom: '28px',
          }}
        >
          {config.detail}
        </p>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '24px' }} />

        {/* Sign in button */}
        <button
          id="kicked-modal-sign-in"
          onClick={handleSignIn}
          style={{
            width:         '100%',
            padding:       '14px 24px',
            borderRadius:  '12px',
            border:        'none',
            cursor:        'pointer',
            background:    `linear-gradient(135deg, ${BRAND_TEAL}, ${BRAND_LIME})`,
            color:         BRAND_NAVY,
            fontWeight:    700,
            fontSize:      '15px',
            letterSpacing: '0.02em',
            display:       'flex',
            alignItems:    'center',
            justifyContent:'center',
            gap:           '8px',
            boxShadow:     '0 4px 20px rgba(77,208,225,0.3)',
            transition:    'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(77,208,225,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 4px 20px rgba(77,208,225,0.3)' }}
        >
          <LogIn size={18} />
          Sign In Again
        </button>

        <p
          style={{
            marginTop:  '16px',
            color:      'rgba(255,255,255,0.2)',
            fontSize:   '11px',
            lineHeight: 1.5,
          }}
        >
          Arturee enforces single-device login to protect purchased content.
        </p>
      </div>
    </div>
  )
}
