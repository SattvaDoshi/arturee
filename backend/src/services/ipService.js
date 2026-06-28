import DeviceSession from '../models/DeviceSession.js'

/**
 * IP Validation Service
 * ────────────────────
 * Detects significant IP address changes that may indicate session hijacking.
 *
 * Strategy:
 *   - Same IP → always allowed
 *   - Different IP, same /24 subnet (e.g. ISP NAT rotation) → allowed
 *   - Different /24 subnet but same country → configurable (default: warn only)
 *   - Different country → invalidate session
 *
 * Country detection: We store the country code at login time in DeviceSession.
 * For incoming requests we use the X-Forwarded-For header (set by your reverse proxy).
 */

/**
 * Extract the real client IP from the request.
 * Trusts the first hop of X-Forwarded-For (set by Nginx or your reverse proxy).
 * Falls back to socket remote address.
 */
export const extractIp = (req) => {
  const xff = req.headers['x-forwarded-for']
  if (xff) {
    return xff.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || req.ip || 'unknown'
}

/**
 * Extract the /24 subnet prefix from an IPv4 address.
 * e.g. '103.21.244.15' → '103.21.244'
 */
const getSubnet24 = (ip) => {
  if (!ip || !ip.includes('.')) return ip
  return ip.split('.').slice(0, 3).join('.')
}

/**
 * Validate whether the current request IP is consistent with the stored session.
 *
 * @param {string} userId
 * @param {string} currentIp
 * @returns {{ valid: boolean, reason?: string, action?: 'allow'|'warn'|'block' }}
 */
export const validateIp = async (userId, currentIp) => {
  const session = await DeviceSession.findOne({ userId, isActive: true })

  if (!session) {
    return { valid: false, reason: 'No active session', action: 'block' }
  }

  const storedIp = session.ipAddress

  // Same IP — always valid
  if (currentIp === storedIp) {
    return { valid: true, action: 'allow' }
  }

  // Same /24 subnet — likely ISP NAT rotation, allow
  if (getSubnet24(currentIp) === getSubnet24(storedIp)) {
    // Update stored IP silently
    await DeviceSession.updateOne(
      { userId },
      { $set: { ipAddress: currentIp, lastSeenAt: new Date() } }
    )
    return { valid: true, action: 'allow' }
  }

  // Different subnet — for now: warn and allow but log
  // In production: switch action to 'block' or integrate MaxMind GeoIP for country check
  console.warn(`[IP Validation] IP changed for user ${userId}: ${storedIp} → ${currentIp}`)

  return {
    valid: true,
    action: 'warn',
    reason: 'IP address changed significantly. Proceeding but flagged.',
  }
}

/**
 * Update the session's last seen IP.
 */
export const updateSessionIp = async (userId, newIp) => {
  await DeviceSession.updateOne(
    { userId },
    { $set: { ipAddress: newIp, lastSeenAt: new Date() } }
  )
}
