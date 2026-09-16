import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { authApi, playbackApi, getDeviceId } from '../api/index.js'

const AuthContext = createContext(null)

// How often to poll the server to detect if another device has taken the session
const SESSION_POLL_MS = 60_000 // 60 seconds

export const AuthProvider = ({ children }) => {
  const [user,         setUser]         = useState(null)
  const [token,        setToken]        = useState(() => localStorage.getItem('art_token'))
  const [loading,      setLoading]      = useState(true)
  // kickedReason: { code, message } | null  — set when server kills this session
  const [kickedReason, setKickedReason] = useState(null)

  const pollRef = useRef(null)

  // ── Shared cleanup ──────────────────────────────────────────────────────
  const clearSession = useCallback(() => {
    localStorage.removeItem('art_token')
    localStorage.removeItem('art_user')
    localStorage.removeItem('art_session_token')
    setToken(null)
    setUser(null)
  }, [])

  // ── Stop polling ────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  // ── Start session heartbeat polling ─────────────────────────────────────
  // Every SESSION_POLL_MS we call /auth/me. If the server returns a 401 with
  // a SESSION_INVALIDATED or SESSION_INVALIDATED_IP code, we know another
  // device has taken the session and we show the kicked modal.
  const startPolling = useCallback(() => {
    stopPolling()
    pollRef.current = setInterval(async () => {
      const savedToken = localStorage.getItem('art_token')
      if (!savedToken) {
        stopPolling()
        return
      }
      try {
        await authApi.getMe()
        // Still valid — do nothing
      } catch (err) {
        const status = err.response?.status
        const code   = err.response?.data?.code
        const msg    = err.response?.data?.message

        if (status === 401) {
          stopPolling()
          clearSession()

          // Show the appropriate kicked modal
          if (code === 'SESSION_INVALIDATED' || code === 'SESSION_INVALIDATED_IP') {
            setKickedReason({ code, message: msg })
          }
          // For any other 401 (expired token, etc.) just silently log out
        }
      }
    }, SESSION_POLL_MS)
  }, [stopPolling, clearSession])

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('art_token')
      if (!savedToken) {
        setLoading(false)
        return
      }
      try {
        const res = await authApi.getMe()
        setUser(res.data.data)

        // Register device for playback session
        try {
          const pbRes = await playbackApi.registerDevice({ deviceId: getDeviceId() })
          if (pbRes.data?.data?.sessionToken) {
            localStorage.setItem('art_session_token', pbRes.data.data.sessionToken)
          }
        } catch (err) {
          console.warn('Playback device registration failed', err)
        }

        // Begin heartbeat now that we have a valid session
        startPolling()
      } catch (err) {
        const code = err.response?.data?.code
        const msg  = err.response?.data?.message

        clearSession()

        if (code === 'SESSION_INVALIDATED' || code === 'SESSION_INVALIDATED_IP') {
          setKickedReason({ code, message: msg })
        }
      } finally {
        setLoading(false)
      }
    }
    restoreSession()

    return () => stopPolling()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (newToken, userData) => {
    localStorage.setItem('art_token', newToken)
    localStorage.setItem('art_user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
    setKickedReason(null) // clear any previous kicked state

    // Register device for playback session
    try {
      const pbRes = await playbackApi.registerDevice({ deviceId: getDeviceId() })
      if (pbRes.data?.data?.sessionToken) {
        localStorage.setItem('art_session_token', pbRes.data.data.sessionToken)
      }
    } catch (err) {
      console.warn('Playback device registration failed on login', err)
    }

    // Start heartbeat for this session
    startPolling()
  }, [startPolling])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    stopPolling()
    try {
      await playbackApi.logoutDevice()
    } catch (err) {
      console.warn('Failed to logout device', err)
    }
    clearSession()
    setKickedReason(null)
  }, [stopPolling, clearSession])

  // ── Dismiss kicked modal ─────────────────────────────────────────────────
  const dismissKicked = useCallback(() => setKickedReason(null), [])

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  const isAdmin         = user?.role === 'admin'
  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider
      value={{
        user, token, loading,
        isAdmin, isAuthenticated,
        kickedReason, dismissKicked,
        login, logout, updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
