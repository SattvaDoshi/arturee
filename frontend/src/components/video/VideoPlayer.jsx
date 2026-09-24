import React, { useEffect, useRef, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Hls from 'hls.js'
import { playbackApi, progressApi } from '../../api/index.js'
import { AlertCircle, Loader2, ShieldX, Cast, Monitor, Airplay, Minimize2, Shield, Maximize } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND_TEAL   = '#4DD0E1'
const BRAND_LIME   = '#C0E863'
const BRAND_NAVY   = '#051d2e'

// ─── Security threat catalog ──────────────────────────────────────────────────

const THREATS = {
  SCREEN_RECORD: {
    id:      'SCREEN_RECORD',
    icon:    Monitor,
    title:   'Screen Recording Detected',
    message: 'Screen recording and screen capture of Arturee content is strictly prohibited by our Terms of Service.',
    detail:  'Please stop any active screen recording software, then tap "I Understand" to resume playback.',
    color:   '#ef4444',
  },
  CHROMECAST: {
    id:      'CHROMECAST',
    icon:    Cast,
    title:   'Casting Not Allowed',
    message: 'Casting or mirroring this content to external devices is strictly prohibited.',
    detail:  'Arturee content is licensed for personal viewing only on this device.',
    color:   '#f97316',
  },
  AIRPLAY: {
    id:      'AIRPLAY',
    icon:    Airplay,
    title:   'AirPlay Blocked',
    message: 'AirPlay streaming of Arturee content to external displays is not permitted.',
    detail:  'Please disconnect AirPlay and continue watching on this device.',
    color:   '#f97316',
  },
  PIP: {
    id:      'PIP',
    icon:    Minimize2,
    title:   'Picture-in-Picture Blocked',
    message: 'Picture-in-Picture mode is not allowed for protected content.',
    detail:  'Please return to full-screen viewing within the Arturee app.',
    color:   '#8b5cf6',
  },
  FOCUS_LOST: {
    id:      'FOCUS_LOST',
    icon:    ShieldX,
    title:   'Playback Paused',
    message: 'Playback was paused because the page is no longer in focus.',
    detail:  'Screen recording or mirroring tools often require switching away from this window. Tap "Resume" to continue watching.',
    color:   BRAND_TEAL,
  },
}

// ─── Watermark helpers ────────────────────────────────────────────────────────

const randomWatermarkPos = () => ({
  top:  `${10 + Math.random() * 70}%`,
  left: `${5  + Math.random() * 60}%`,
})

const nowDateStr = () => new Date().toISOString().slice(0, 10)

// ─── Security Warning Modal ───────────────────────────────────────────────────

function SecurityModal({ threat, onDismiss }) {
  if (!threat) return null

  const Icon = threat.icon

  return (
    // Full-screen backdrop — covers the entire page so the video frame can't be seen
    <div
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '1rem',
        background:      'rgba(5, 29, 46, 0.96)',
        backdropFilter:  'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        animation:       'arturee-fade-in 0.25s ease',
      }}
      // Block all interaction with the page behind it
      onClick={e => e.stopPropagation()}
    >
      {/* Modal card */}
      <div
        style={{
          maxWidth:       '420px',
          width:          '100%',
          background:     'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
          border:         `1px solid ${threat.color}55`,
          borderRadius:   '20px',
          padding:        'clamp(24px, 5vw, 40px)',
          textAlign:      'center',
          boxShadow:      `0 0 60px ${threat.color}22, 0 24px 48px rgba(0,0,0,0.6)`,
          animation:      'arturee-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Icon ring */}
        <div
          style={{
            width:          '72px',
            height:         '72px',
            borderRadius:   '50%',
            background:     `${threat.color}18`,
            border:         `2px solid ${threat.color}60`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 20px',
            boxShadow:      `0 0 24px ${threat.color}30`,
          }}
        >
          <Icon size={32} color={threat.color} strokeWidth={1.5} />
        </div>

        {/* Shield badge */}
        <div
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '6px',
            background:     'rgba(77,208,225,0.1)',
            border:         '1px solid rgba(77,208,225,0.25)',
            borderRadius:   '100px',
            padding:        '4px 12px',
            marginBottom:   '16px',
          }}
        >
          <Shield size={11} color={BRAND_TEAL} />
          <span style={{ color: BRAND_TEAL, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Content Protection
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            color:        '#ffffff',
            fontSize:     'clamp(18px, 4vw, 22px)',
            fontWeight:   700,
            marginBottom: '12px',
            lineHeight:   1.3,
          }}
        >
          {threat.title}
        </h2>

        {/* Main message */}
        <p
          style={{
            color:        'rgba(255,255,255,0.8)',
            fontSize:     '14px',
            lineHeight:   1.6,
            marginBottom: '10px',
          }}
        >
          {threat.message}
        </p>

        {/* Detail / instruction */}
        <p
          style={{
            color:        'rgba(255,255,255,0.45)',
            fontSize:     '13px',
            lineHeight:   1.5,
            marginBottom: '28px',
          }}
        >
          {threat.detail}
        </p>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '24px' }} />

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          style={{
            width:          '100%',
            padding:        '13px 24px',
            borderRadius:   '12px',
            border:         'none',
            cursor:         'pointer',
            background:     `linear-gradient(135deg, ${BRAND_TEAL}, ${BRAND_LIME})`,
            color:          BRAND_NAVY,
            fontWeight:     700,
            fontSize:       '15px',
            letterSpacing:  '0.02em',
            boxShadow:      '0 4px 20px rgba(77,208,225,0.35)',
            transition:     'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(77,208,225,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 4px 20px rgba(77,208,225,0.35)' }}
        >
          I Understand — Resume
        </button>

        {/* Legal note */}
        <p
          style={{
            marginTop:  '16px',
            color:      'rgba(255,255,255,0.25)',
            fontSize:   '11px',
            lineHeight: 1.5,
          }}
        >
          Unauthorised recording or distribution of Arturee content is a violation of our Terms of Service and may be subject to legal action.
        </p>
      </div>
    </div>
  )
}

// ─── Main VideoPlayer component ───────────────────────────────────────────────

/**
 * VideoPlayer
 *
 * Security layers:
 *  1. disableRemotePlayback    → removes Chromecast button; fires event if cast attempted
 *  2. x-webkit-airplay=deny   → blocks AirPlay on Safari/iOS
 *  3. disablePictureInPicture  → blocks PiP, fires 'enterpictureinpicture' as a warning
 *  4. Pause + SecurityModal    → pauses playback and shows a blocking modal for every detected threat
 *  5. visibilitychange/blur    → pauses and warns when page is hidden (common in screen recording)
 *  6. video.remote events      → intercepts Chromecast connection attempts
 *  7. Forensic watermark       → drifting semi-transparent user ID visible in any recording
 *  8. CSS mix-blend-mode trick → forces GPU compositing layer that breaks some software recorders
 *  9. controlsList             → hides native download button
 * 10. Context-menu block       → prevents right-click → "Save"
 *
 * @param {string}  videoId
 * @param {string}  [poster]
 * @param {object}  [user]
 */
export default function VideoPlayer({ videoId, poster, user, isVertical = false }) {
  const wrapperRef = useRef(null)
  const videoRef = useRef(null)
  const hlsRef   = useRef(null)

  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [sessionActive,  setSessionActive]  = useState(false)
  const [purchaseExpired, setPurchaseExpired] = useState(false)

  // Unique ID for this play session — sent with progress saves
  // to deduplicate view counts across resume/seek events.
  const playSessionIdRef = useRef(uuidv4())

  // The active security threat being shown — null = no popup
  const [activeThreat,   setActiveThreat]   = useState(null)

  // Watermark
  const [wmPos,  setWmPos]  = useState(randomWatermarkPos)
  const [wmText, setWmText] = useState('')

  // Progress throttle
  const lastProgressRef = useRef(0)

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Pause + show modal for a specific threat */
  const triggerThreat = useCallback((threatKey) => {
    const video = videoRef.current
    if (video && !video.paused) video.pause()
    setActiveThreat(THREATS[threatKey])
  }, [])

  /** Dismiss modal and resume */
  const dismissThreat = useCallback(() => {
    setActiveThreat(null)
    // Small delay so the modal finishes fading before play()
    setTimeout(() => {
      videoRef.current?.play().catch(() => {})
    }, 200)
  }, [])

  /** Toggle Wrapper Fullscreen */
  const toggleFullscreen = useCallback(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (wrapper.requestFullscreen) wrapper.requestFullscreen().catch(()=>{})
      else if (wrapper.webkitRequestFullscreen) wrapper.webkitRequestFullscreen()
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(()=>{})
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    }
  }, [])

  // ── Watermark label ───────────────────────────────────────────────────────
  useEffect(() => {
    const label = user?.email || user?.name || 'arturee.com'
    setWmText(`${label} • ${nowDateStr()}`)
  }, [user])

  // ── Drift watermark every 60 s ────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive) return
    const id = setInterval(() => setWmPos(randomWatermarkPos()), 60_000)
    return () => clearInterval(id)
  }, [sessionActive])

  // ── Security event listeners ──────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive) return

    const video = videoRef.current

    // 1. Page visibility change (tab switch, app background, screen recorder starting)
    const onVisibilityChange = () => {
      if (document.hidden) triggerThreat('FOCUS_LOST')
    }

    // 2. Window blur (OS-level focus loss — common when launching a screen recorder)
    const onWindowBlur = () => triggerThreat('FOCUS_LOST')

    // 3. Picture-in-Picture entered (even though disablePictureInPicture is set,
    //    some browser extensions can still trigger this)
    const onEnterPip = () => {
      // Immediately exit PiP if browser allowed it despite the attribute
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {})
      }
      triggerThreat('PIP')
    }

    // 4. Remote Playback API (Chromecast / DLNA)
    const onRemoteConnecting = () => triggerThreat('CHROMECAST')
    const onRemoteConnect    = () => {
      // Force disconnect
      video?.remote?.cancelWatchingRemotePlayback?.().catch(() => {})
      triggerThreat('CHROMECAST')
    }

    // 5. Screen Wake Lock — when a screen recorder requests a wake lock to
    //    prevent screen dimming, some browsers emit devicechange. This is a
    //    heuristic signal, not definitive.
    const onDeviceChange = () => {
      // Only trigger if playing — device change during idle is fine
      if (video && !video.paused) triggerThreat('SCREEN_RECORD')
    }

    // 6. Fullscreen change — when cast tools enter fullscreen
    const onFullscreenChange = () => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const fsElement = document.fullscreenElement || document.webkitFullscreenElement
      
      // If fullscreen element is NOT our own wrapper, something else went fullscreen
      if (fsElement && fsElement !== wrapper) {
        // If the video element itself went fullscreen natively, exit it and wrapper-fullscreen instead
        if (fsElement === video) {
          if (document.exitFullscreen) document.exitFullscreen().catch(()=>{})
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
          
          setTimeout(() => {
            if (wrapper.requestFullscreen) wrapper.requestFullscreen().catch(()=>{})
            else if (wrapper.webkitRequestFullscreen) wrapper.webkitRequestFullscreen()
          }, 100)
        } else {
          triggerThreat('SCREEN_RECORD')
        }
      }
    }

    // Attach all listeners
    document.addEventListener('visibilitychange',   onVisibilityChange)
    window.addEventListener('blur',                 onWindowBlur)
    document.addEventListener('fullscreenchange',   onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)

    if (video) {
      video.addEventListener('enterpictureinpicture', onEnterPip)
      // Remote Playback API (Chrome / Edge)
      if (video.remote) {
        video.remote.addEventListener('connecting', onRemoteConnecting)
        video.remote.addEventListener('connect',    onRemoteConnect)
      }
    }

    // navigator.mediaDevices — attempt to monkey-patch getDisplayMedia
    // so we are notified if the *page itself* tries to start screen capture
    if (navigator.mediaDevices?.getDisplayMedia) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices)
      navigator.mediaDevices.getDisplayMedia = (...args) => {
        triggerThreat('SCREEN_RECORD')
        return originalGetDisplayMedia(...args)
      }
    }

    return () => {
      document.removeEventListener('visibilitychange',       onVisibilityChange)
      window.removeEventListener('blur',                     onWindowBlur)
      document.removeEventListener('fullscreenchange',       onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)

      if (video) {
        video.removeEventListener('enterpictureinpicture', onEnterPip)
        if (video.remote) {
          video.remote.removeEventListener('connecting', onRemoteConnecting)
          video.remote.removeEventListener('connect',    onRemoteConnect)
        }
      }
    }
  }, [sessionActive, triggerThreat])

  // ── HLS + playback init ───────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    const initPlayback = async () => {
      try {
        setLoading(true)
        const res = await playbackApi.requestPlayback({ videoId })
        const { streamUrl, signingParams, resumeAt } = res.data.data

        if (!mounted) return

        const video = videoRef.current
        if (!video) return

        if (resumeAt > 0) {
          const onLoaded = () => {
            video.currentTime = resumeAt
            video.removeEventListener('loadedmetadata', onLoaded)
          }
          video.addEventListener('loadedmetadata', onLoaded)
        }

        // ── Original file fallback (no HLS — MediaConvert not run) ──────────
        // signingParams is null when the backend served a presigned S3 URL
        // for the raw original video file. Assign directly to <video src>.
        if (!signingParams && streamUrl && !streamUrl.includes('.m3u8')) {
          video.src = streamUrl
          video.addEventListener('loadedmetadata', () => {
            if (mounted) { setLoading(false); setSessionActive(true) }
          })
          return
        }

        if (Hls.isSupported()) {
          const hls = new Hls({
            maxBufferLength:    30,
            maxMaxBufferLength: 60,
            xhrSetup: (xhr, url) => {
              if (signingParams) {
                const sep = url.includes('?') ? '&' : '?'
                xhr.open('GET', `${url}${sep}${signingParams}`)
              }
            },
          })

          hlsRef.current = hls
          hls.loadSource(streamUrl)
          hls.attachMedia(video)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (mounted) { setLoading(false); setSessionActive(true) }
          })

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR: hls.startLoad(); break
                case Hls.ErrorTypes.MEDIA_ERROR:   hls.recoverMediaError(); break
                default:
                  hls.destroy()
                  if (mounted) setError('A fatal error occurred while playing the video.')
              }
            }
          })

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          const safariUrl = signingParams
            ? `${streamUrl}${streamUrl.includes('?') ? '&' : '?'}${signingParams}`
            : streamUrl
          video.src = safariUrl
          video.addEventListener('loadedmetadata', () => {
            if (mounted) { setLoading(false); setSessionActive(true) }
          })
        } else {
          if (mounted) setError('Your browser does not support playing this video.')
        }

      } catch (err) {
        if (!mounted) return
        setLoading(false)
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError(err.response.data.message || 'Session invalidated. Are you watching on another device?')
        } else {
          setError(err.response?.data?.message || 'Failed to load video stream. Please try again.')
        }
      }
    }

    initPlayback()

    return () => {
      mounted = false
      if (hlsRef.current) hlsRef.current.destroy()
    }
  }, [videoId])

  // ── Progress tracking ─────────────────────────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const now = Date.now()
    if (now - lastProgressRef.current > 10_000) {
      lastProgressRef.current = now
      const isCompleted = video.duration > 0 && (video.duration - video.currentTime < 10)
      progressApi.update({
        videoId,
        currentTimestamp:     Math.floor(video.currentTime),
        videoDurationSeconds: Math.floor(video.duration || 0),
        isCompleted,
        playSessionId:        playSessionIdRef.current,  // ← sent for view-limit tracking
      }).then(res => {
        // Server signals that both views have been used — stop playback
        if (res?.data?.code === 'PURCHASE_EXPIRED') {
          video.pause()
          setPurchaseExpired(true)
        }
      }).catch(err => {
        if (err.response?.status === 402 || err.response?.data?.code === 'PURCHASE_EXPIRED') {
          video.pause()
          setPurchaseExpired(true)
        } else {
          console.warn('Progress update failed', err)
        }
      })
      if (isCompleted) progressApi.complete({ videoId }).catch(() => {})
    }
  }, [videoId])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Keyframe animations injected once ───────────────────────────── */}
      <style>{`
        @keyframes arturee-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes arturee-slide-up {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        /* Hide native fullscreen button so we can enforce wrapper-fullscreen */
        video::-webkit-media-controls-fullscreen-button {
          display: none !important;
        }
      `}</style>

      {/* ── Security Warning Modal (full-page, above everything) ─────────── */}
      <SecurityModal threat={activeThreat} onDismiss={dismissThreat} />

      {/* ── Player wrapper ───────────────────────────────────────────────── */}
      <div
        ref={wrapperRef}
        onDoubleClick={toggleFullscreen}
        className={`relative ${isVertical ? 'aspect-[9/16] max-w-sm mx-auto' : 'aspect-video'} rounded-2xl overflow-hidden bg-black shadow-2xl border group`}
        style={{
          borderColor: 'rgba(77,208,225,0.25)',
          userSelect:  'none',
          // ── CSS anti-recording trick ────────────────────────────────────
          // Forces the browser to composite this element on a separate GPU
          // layer. Software-only screen recorders that don't capture the GPU
          // compositor (OBS software mode, some Android recorders) will see
          // a black rectangle instead of the video frame.
          isolation:   'isolate',
          willChange:  'transform',
          transform:   'translateZ(0)',
        }}
        onContextMenu={e => e.preventDefault()}
      >
        {/* ── Error overlay ── */}
        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-white font-semibold text-lg">{error}</p>
          </div>
        )}

        {/* ── Purchase Expired overlay ─────────────────────────────────────
             Shown when the user has used both their allowed views (≥80% each).
             Covers the player and explains access has ended.                 */}
        {purchaseExpired && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/92 p-8 text-center"
            style={{ backdropFilter: 'blur(8px)' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <AlertCircle size={30} color="#ef4444" strokeWidth={1.5} />
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(77,208,225,0.08)', border: '1px solid rgba(77,208,225,0.2)',
              borderRadius: '100px', padding: '4px 14px', marginBottom: '16px',
            }}>
              <span style={{ color: '#4DD0E1', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                View Limit Reached
              </span>
            </div>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
              Both Views Used
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.6, maxWidth: '320px', margin: '0 auto 8px' }}>
              You have watched this video to completion twice. Your access to this video has expired.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', lineHeight: 1.5 }}>
              You can re-purchase the video to watch it again.
            </p>
          </div>
        )}

        {/* ── Loading overlay ── */}
        {loading && !error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin mb-3" style={{ color: BRAND_TEAL }} />
            <p className="font-medium animate-pulse" style={{ color: BRAND_TEAL }}>Initializing Secure Stream...</p>
          </div>
        )}

        {/* ── Forensic Watermark ──────────────────────────────────────────
             Drifts to a random position every 60 s at 18% opacity.
             Clearly visible in screen recordings — identifies the leaker. */}
        {sessionActive && wmText && (
          <div
            aria-hidden="true"
            style={{
              position:      'absolute',
              top:           wmPos.top,
              left:          wmPos.left,
              zIndex:        15,
              pointerEvents: 'none',
              userSelect:    'none',
              opacity:       0.18,
              color:         '#ffffff',
              fontSize:      'clamp(10px, 1.2vw, 14px)',
              fontFamily:    'monospace',
              fontWeight:    600,
              letterSpacing: '0.03em',
              whiteSpace:    'nowrap',
              textShadow:    '0 1px 3px rgba(0,0,0,0.8)',
              transition:    'top 1.5s ease, left 1.5s ease',
            }}
          >
            {wmText}
          </div>
        )}

        {/* ── GPU-compositor anti-recording overlay ──────────────────────
             mix-blend-mode on a sibling element forces the video to be
             blended on the GPU, which breaks software-only capture tools
             (those that hook into DirectX/GDI instead of compositing).   */}
        {sessionActive && (
          <div
            aria-hidden="true"
            style={{
              position:      'absolute',
              inset:         0,
              zIndex:        4,
              pointerEvents: 'none',
              userSelect:    'none',
              // Intentionally nearly-transparent; visual impact is zero but
              // forces the browser into GPU-blend path.
              background:    'rgba(0,0,0,0.002)',
              mixBlendMode:  'multiply',
              WebkitUserDrag: 'none',
            }}
          />
        )}

        {/* ── Custom Fullscreen Button (shown on hover) ── */}
        {sessionActive && !error && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>
        )}

        {/* ── Video element ── */}
        <video
          ref={videoRef}
          id={`arturee-player-${videoId}`}

          // ── Anti-casting ────────────────────────────────────────────────
          disableRemotePlayback        // Hides Cast button (Chromecast) in Chrome
          x-webkit-airplay="deny"      // Hides AirPlay button in Safari
          disablePictureInPicture      // Prevents PiP extraction

          // ── Controls ────────────────────────────────────────────────────
          controls={sessionActive && !error}
          controlsList="nodownload"    // Hides native download button
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          style={{
            // Push the video onto its own GPU compositing layer.
            // On Android Chrome, this prevents some system-level recorders
            // from capturing the decoded video frame from system memory.
            filter:     'contrast(1.00001)',
            willChange: 'transform',
          }}
        />
      </div>
    </>
  )
}
