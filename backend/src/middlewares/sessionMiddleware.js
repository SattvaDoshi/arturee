import { validateDevice } from '../services/deviceService.js'
import { validateIp, extractIp } from '../services/ipService.js'
import { revokeAllPlaybackSessions } from '../services/sessionService.js'
import { terminateSession } from '../services/deviceService.js'
import ApiError from '../utils/ApiError.js'

/**
 * Session middleware — must be used AFTER authMiddleware.
 *
 * Validates:
 *   1. Device fingerprint matches the registered active session
 *   2. IP address has not changed significantly
 *
 * On failure: terminates the session and returns 401.
 *
 * The client must send:
 *   - Authorization: Bearer <jwt>                   (handled by authMiddleware)
 *   - X-Device-Id: <fingerprint>                    (client-generated)
 *   - X-Session-Token: <sessionToken from login>    (returned at login/device registration)
 */
const sessionMiddleware = async (req, res, next) => {
  try {
    const userId = req.user._id.toString()
    const deviceId = req.headers['x-device-id'] || ''
    const sessionToken = req.headers['x-session-token'] || ''
    const currentIp = extractIp(req)

    // ── Device validation ─────────────────────────────────────────────────
    const deviceCheck = await validateDevice(userId, deviceId, sessionToken)

    if (!deviceCheck.valid) {
      // Terminate the session and revoke all playback URLs
      await terminateSession(userId)
      await revokeAllPlaybackSessions(userId)
      return next(new ApiError(401, deviceCheck.reason || 'Session invalidated.'))
    }

    // ── IP validation ─────────────────────────────────────────────────────
    const ipCheck = await validateIp(userId, currentIp)

    if (!ipCheck.valid) {
      await terminateSession(userId)
      await revokeAllPlaybackSessions(userId)
      return next(new ApiError(401, 'Session invalidated: IP address changed significantly.'))
    }

    if (ipCheck.action === 'warn') {
      // Log the warning but allow the request to proceed
      console.warn(`[Session] IP change warning for user ${userId}: ${ipCheck.reason}`)
    }

    // Attach context for downstream use
    req.sessionContext = {
      deviceId,
      sessionToken,
      ipAddress: currentIp,
    }

    next()
  } catch (err) {
    next(err)
  }
}

export default sessionMiddleware
