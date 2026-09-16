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
 *   2. IP address has not changed outside the /24 subnet
 *
 * On failure: terminates the session, revokes all playback URLs,
 *             and returns 401 with a structured error code so the
 *             frontend can show the correct "kicked" modal.
 *
 * The client must send:
 *   - Authorization: Bearer <jwt>                   (handled by authMiddleware)
 *   - X-Device-Id: <fingerprint>                    (client-generated)
 *   - X-Session-Token: <sessionToken from login>    (returned at login/device registration)
 */
const sessionMiddleware = async (req, res, next) => {
  try {
    const userId      = req.user._id.toString()
    const deviceId    = req.headers['x-device-id']     || ''
    const sessionToken = req.headers['x-session-token'] || ''
    const currentIp   = extractIp(req)

    // ── 1. Device validation ──────────────────────────────────────────────
    const deviceCheck = await validateDevice(userId, deviceId, sessionToken)

    if (!deviceCheck.valid) {
      await terminateSession(userId)
      await revokeAllPlaybackSessions(userId)
      return res.status(401).json({
        success: false,
        code:    'SESSION_INVALIDATED',
        message: deviceCheck.reason || 'Session invalidated. Your account was accessed from another device.',
      })
    }

    // ── 2. IP validation ──────────────────────────────────────────────────
    const ipCheck = await validateIp(userId, currentIp)

    if (!ipCheck.valid) {
      await terminateSession(userId)
      await revokeAllPlaybackSessions(userId)
      return res.status(401).json({
        success: false,
        code:    ipCheck.code || 'SESSION_INVALIDATED_IP',
        message: ipCheck.reason || 'Session invalidated: your network location changed.',
      })
    }

    // Attach session context for downstream use
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
