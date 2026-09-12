import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, playbackApi, getDeviceId } from '../api/index.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('art_token'))
  const [loading, setLoading] = useState(true)

  // Restore session on mount
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
      } catch {
        localStorage.removeItem('art_token')
        localStorage.removeItem('art_user')
        localStorage.removeItem('art_session_token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = useCallback(async (newToken, userData) => {
    localStorage.setItem('art_token', newToken)
    localStorage.setItem('art_user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
    
    // Register device for playback session
    try {
      const pbRes = await playbackApi.registerDevice({ deviceId: getDeviceId() })
      if (pbRes.data?.data?.sessionToken) {
        localStorage.setItem('art_session_token', pbRes.data.data.sessionToken)
      }
    } catch (err) {
      console.warn('Playback device registration failed on login', err)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await playbackApi.logoutDevice()
    } catch (err) {
      console.warn('Failed to logout device', err)
    }
    localStorage.removeItem('art_token')
    localStorage.removeItem('art_user')
    localStorage.removeItem('art_session_token')
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, isAuthenticated, login, logout, updateUser }}>
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
