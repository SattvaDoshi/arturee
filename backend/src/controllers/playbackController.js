import asyncHandler from '../utils/asyncHandler.js'
import { authorizePlayback } from '../services/playbackAuthService.js'
import { terminateSession } from '../services/deviceService.js'
import { revokeAllPlaybackSessions } from '../services/sessionService.js'
import { upsertDeviceSession } from '../services/deviceService.js'
import { buildDeviceLabel } from '../utils/deviceDetect.js'
import { extractIp } from '../services/ipService.js'
import { logPlaybackError } from '../services/cloudWatchService.js'
import { proxyWidevineLicense, proxyFairPlayLicense, proxyPlayReadyLicense } from '../services/drmService.js'
import ApiError from '../utils/ApiError.js'
import { getProgress } from '../services/watchProgressService.js'

// ── Register device session (call after login) ─────────────────────────────

/**
 * POST /api/playback/register-device
 *
 * Must be called immediately after login to register/replace the active device.
 * The sessionToken returned here must be included in all subsequent requests
 * as the X-Session-Token header.
 *
 * Body: { deviceId }
 * Returns: { sessionToken, deviceId }
 */
export const registerDevice = asyncHandler(async (req, res) => {
  const { deviceId } = req.body
  if (!deviceId) throw new ApiError(400, 'deviceId is required.')

  const userId = req.user._id.toString()
  const ipAddress = extractIp(req)
  const userAgent = req.headers['user-agent'] || ''
  const deviceLabel = buildDeviceLabel(userAgent)

  // Use the user's JWT as the session token — ties device registration to auth
  const authHeader = req.headers.authorization || ''
  const sessionToken = authHeader.split(' ')[1] || ''

  await upsertDeviceSession({
    userId,
    deviceId,
    deviceLabel,
    sessionToken,
    ipAddress,
  })

  res.status(200).json({
    success: true,
    data: {
      deviceId,
      sessionToken,
      deviceLabel,
      message: 'Device registered. Any previous session has been invalidated.',
    },
  })
})

// ── Request playback URL ───────────────────────────────────────────────────

/**
 * POST /api/playback/request
 *
 * Headers: Authorization, X-Device-Id, X-Session-Token
 * Body: { videoId }
 *
 * Returns: { streamUrl, quality, sessionToken, drmLicenseUrl, expiresAt, resumeAt }
 */
export const requestPlayback = asyncHandler(async (req, res) => {
  const { videoId } = req.body
  if (!videoId) throw new ApiError(400, 'videoId is required.')

  const userId = req.user._id.toString()
  const userAgent = req.headers['user-agent'] || ''
  const deviceId = req.sessionContext?.deviceId || req.headers['x-device-id'] || ''
  const ipAddress = req.sessionContext?.ipAddress || extractIp(req)

  try {
    const result = await authorizePlayback({
      userId,
      videoId,
      userAgent,
      deviceId,
      ipAddress,
    })

    // Get resume position
    const progress = await getProgress(userId, videoId)
    const resumeAt = progress?.currentTimestamp || 0

    res.status(200).json({
      success: true,
      data: {
        streamUrl: result.streamUrl,
        quality: result.quality,
        sessionToken: result.sessionToken,
        drmLicenseUrl: result.drmLicenseUrl,
        expiresAt: result.expiresAt,
        resumeAt,
        videoDurationSeconds: result.videoDurationSeconds,
      },
    })
  } catch (err) {
    logPlaybackError(userId, videoId)
    throw err
  }
})

// ── Logout device ──────────────────────────────────────────────────────────

/**
 * POST /api/playback/logout-device
 *
 * Terminates the active device session and revokes all playback URLs.
 */
export const logoutDevice = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString()
  await terminateSession(userId)
  await revokeAllPlaybackSessions(userId)

  res.status(200).json({
    success: true,
    message: 'Device session terminated and all playback URLs revoked.',
  })
})

// ── Terminate previous session (force another device off) ─────────────────

/**
 * POST /api/playback/terminate-session
 *
 * Body: { deviceId }
 * Allows a user to forcibly log out a previous device.
 * After calling this, call /register-device to establish the new session.
 */
export const terminatePreviousSession = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString()
  await terminateSession(userId)
  await revokeAllPlaybackSessions(userId)

  res.status(200).json({
    success: true,
    message: 'Previous session terminated. Please register your current device.',
  })
})

// ── DRM License Proxy ──────────────────────────────────────────────────────

/**
 * POST /api/drm/license/widevine/:videoId
 * Raw request body = EME license request bytes
 */
export const widevineLicenseProxy = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId = req.user._id.toString()

  const licenseRequest = req.body // express.raw() must parse this route
  const licenseResponse = await proxyWidevineLicense(videoId, licenseRequest, userId)

  res.set('Content-Type', 'application/octet-stream')
  res.send(licenseResponse)
})

/**
 * POST /api/drm/license/fairplay/:videoId
 */
export const fairplayLicenseProxy = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId = req.user._id.toString()
  const licenseRequest = req.body
  const licenseResponse = await proxyFairPlayLicense(videoId, licenseRequest, userId)
  res.set('Content-Type', 'application/octet-stream')
  res.send(licenseResponse)
})

/**
 * POST /api/drm/license/playready/:videoId
 */
export const playreadyLicenseProxy = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId = req.user._id.toString()
  const licenseRequest = req.body
  const licenseResponse = await proxyPlayReadyLicense(videoId, licenseRequest, userId)
  res.set('Content-Type', 'application/octet-stream')
  res.send(licenseResponse)
})
