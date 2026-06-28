import { Router } from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import sessionMiddleware from '../middlewares/sessionMiddleware.js'
import { playbackLimiter, drmLimiter } from '../middlewares/rateLimiter.js'
import {
  registerDevice,
  requestPlayback,
  logoutDevice,
  terminatePreviousSession,
  widevineLicenseProxy,
  fairplayLicenseProxy,
  playreadyLicenseProxy,
} from '../controllers/playbackController.js'

const router = Router()

// ── Device registration — call after login, before any playback ────────────
// Does NOT require session middleware (this IS the session setup step)
router.post('/register-device', authMiddleware, registerDevice)

// ── Playback URL request — requires active session ─────────────────────────
router.post('/request', authMiddleware, sessionMiddleware, playbackLimiter, requestPlayback)

// ── Session management ─────────────────────────────────────────────────────
router.post('/logout-device', authMiddleware, logoutDevice)
router.post('/terminate-session', authMiddleware, terminatePreviousSession)

export default router
