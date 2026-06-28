import { randomUUID } from 'crypto'
import DeviceSession from '../models/DeviceSession.js'

/**
 * Create or replace the active device session for a user.
 * Calling this on a new device automatically invalidates the previous session
 * (one-active-device enforcement).
 *
 * @param {string}  userId
 * @param {string}  deviceId       Client-generated fingerprint
 * @param {string}  deviceLabel    e.g. "Chrome on Windows"
 * @param {string}  sessionToken   The user's current JWT (or a derived token)
 * @param {string}  ipAddress
 * @param {string}  countryCode
 */
export const upsertDeviceSession = async ({
  userId,
  deviceId,
  deviceLabel,
  sessionToken,
  ipAddress,
  countryCode = null,
}) => {
  // findOneAndUpdate with upsert ensures atomicity — replaces any existing row
  const session = await DeviceSession.findOneAndUpdate(
    { userId },
    {
      $set: {
        deviceId,
        deviceLabel,
        sessionToken,
        ipAddress,
        countryCode,
        loginAt: new Date(),
        lastSeenAt: new Date(),
        isActive: true,
      },
    },
    { upsert: true, new: true }
  )
  return session
}

/**
 * Fetch the active DeviceSession for a user.
 */
export const getActiveSession = async (userId) => {
  return DeviceSession.findOne({ userId, isActive: true })
}

/**
 * Validate that the incoming request comes from the registered device.
 *
 * @param {string} userId
 * @param {string} deviceId   Device fingerprint from the request
 * @param {string} sessionToken
 * @returns {{ valid: boolean, reason?: string }}
 */
export const validateDevice = async (userId, deviceId, sessionToken) => {
  const session = await DeviceSession.findOne({ userId })

  if (!session) {
    return { valid: false, reason: 'No active session found. Please log in again.' }
  }

  if (!session.isActive) {
    return { valid: false, reason: 'Session has been terminated.' }
  }

  if (session.sessionToken !== sessionToken) {
    return { valid: false, reason: 'Session token mismatch. Logged in from another device.' }
  }

  if (session.deviceId !== deviceId) {
    return { valid: false, reason: 'Device mismatch. This session is active on another device.' }
  }

  // Update last seen time
  await DeviceSession.updateOne({ userId }, { $set: { lastSeenAt: new Date() } })

  return { valid: true }
}

/**
 * Terminate the active session for a user (logout / force-logout).
 */
export const terminateSession = async (userId) => {
  await DeviceSession.updateOne(
    { userId },
    { $set: { isActive: false } }
  )
}

/**
 * Terminate all sessions except the current one (for admin / security).
 */
export const terminateAllSessions = async (userId) => {
  await DeviceSession.deleteMany({ userId })
}
