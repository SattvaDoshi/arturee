import rateLimit from 'express-rate-limit'

/**
 * Rate limiters scoped to specific route groups.
 * All limits are intentionally conservative for a premium OTT platform.
 */

// General API limiter — 2000 req/15 min per IP (increased to prevent 429s during dev/normal usage)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
})

// Auth read limiter — for /auth/me, 300 req/15 min per IP
// Higher limit because this is polled for session heartbeat
export const authReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth checks. Please try again later.' },
})

// Upload initiation — 10 req/hour per IP (admin only)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many upload requests. Slow down.' },
})

// Playback URL requests — 30 req/15 min per IP
export const playbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many playback requests.' },
})

// Purchase — 5 req/10 min per IP (prevent order spamming)
export const purchaseLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many purchase requests. Please slow down.' },
})

// DRM license proxy — 60 req/min per IP (frequent during playback)
export const drmLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many DRM license requests.' },
})
