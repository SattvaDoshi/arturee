import { randomBytes } from 'crypto'
import PlaybackSession from '../models/PlaybackSession.js'

/**
 * Create a new PlaybackSession record tied to a signed URL.
 *
 * @param {object} params
 * @returns {PlaybackSession}
 */
export const createPlaybackSession = async ({
  userId,
  videoId,
  deviceId,
  ipAddress,
  quality,
  signedUrl,
  expiresAt,
}) => {
  const sessionToken = randomBytes(32).toString('hex')

  const session = await PlaybackSession.create({
    userId,
    videoId,
    sessionToken,
    deviceId,
    ipAddress,
    quality,
    signedUrl,
    expiresAt,
  })

  return session
}

/**
 * Revoke all active playback sessions for a user+video combination.
 * Called when the signed URL must be invalidated early (e.g. forced logout).
 */
export const revokePlaybackSessions = async (userId, videoId) => {
  await PlaybackSession.updateMany(
    { userId, videoId, isRevoked: false },
    { $set: { isRevoked: true } }
  )
}

/**
 * Revoke all playback sessions for a user across all videos.
 */
export const revokeAllPlaybackSessions = async (userId) => {
  await PlaybackSession.updateMany(
    { userId, isRevoked: false },
    { $set: { isRevoked: true } }
  )
}

/**
 * Validate a playback session token is still active and not revoked.
 *
 * @param {string} sessionToken
 * @returns {{ valid: boolean, session?: object, reason?: string }}
 */
export const validatePlaybackSession = async (sessionToken) => {
  const session = await PlaybackSession.findOne({ sessionToken })

  if (!session) {
    return { valid: false, reason: 'Playback session not found.' }
  }

  if (session.isRevoked) {
    return { valid: false, reason: 'Playback session has been revoked.' }
  }

  if (session.expiresAt < new Date()) {
    return { valid: false, reason: 'Playback session has expired.' }
  }

  return { valid: true, session }
}
