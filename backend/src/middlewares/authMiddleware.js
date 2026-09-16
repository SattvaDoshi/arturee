import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import { verifyAuthToken } from '../utils/token.js'

/**
 * Auth Middleware
 * ──────────────
 * 1. Verifies the Bearer JWT signature and expiry.
 * 2. Checks that decoded.sessionVersion matches user.sessionVersion in the DB.
 *    If they differ it means the user logged in on another device since this
 *    JWT was issued — this token is dead, return 401 with code SESSION_INVALIDATED.
 * 3. Attaches req.user for downstream handlers.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ''
    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer' || !token) {
      return next(new ApiError(401, 'Unauthorized: token missing'))
    }

    let decoded
    try {
      decoded = verifyAuthToken(token)
    } catch {
      return next(new ApiError(401, 'Unauthorized: invalid or expired token'))
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return next(new ApiError(401, 'Unauthorized: user not found'))
    }

    // ── Single-device enforcement ─────────────────────────────────────────
    // If the version or sessionId in this JWT does not match the DB, a newer 
    // login has happened from another device. Kill this session immediately.
    const isVersionMismatch = decoded.sessionVersion !== undefined && decoded.sessionVersion !== user.sessionVersion
    const isSessionIdMismatch = decoded.sessionId && user.activeSession?.sessionId && decoded.sessionId !== user.activeSession.sessionId

    if (isVersionMismatch || isSessionIdMismatch) {
      return res.status(401).json({
        success: false,
        code: 'SESSION_INVALIDATED',
        message: 'Your account was signed in on another device. This session has been terminated.',
      })
    }

    req.user = user
    next()
  } catch (error) {
    next(new ApiError(401, 'Unauthorized: invalid token'))
  }
}

export default authMiddleware
