import Purchase from '../models/Purchase.js'
import VideoAsset from '../models/VideoAsset.js'
import Video from '../models/Video.js'
import { generateSignedUrl } from './cloudFrontService.js'
import { createPlaybackSession } from './sessionService.js'
import { detectDeviceType, resolveQuality } from '../utils/deviceDetect.js'
import { buildLicenseProxyUrl } from '../drm/drmProvider.js'
import ApiError from '../utils/ApiError.js'
import awsConfig from '../config/awsConfig.js'

/**
 * Playback Authorization Service
 * ────────────────────────────────
 * Gate that enforces purchase verification before issuing a CloudFront signed URL.
 *
 * Flow:
 *   1. Verify purchase exists and is completed
 *   2. Fetch VideoAsset for the requested video
 *   3. Detect device type → resolve quality (720p/1080p)
 *   4. Generate CloudFront signed URL
 *   5. Create PlaybackSession record
 *   6. Return stream URL + optional DRM license URL
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.videoId
 * @param {string} params.userAgent    From req.headers['user-agent']
 * @param {string} params.deviceId     Client fingerprint
 * @param {string} params.ipAddress
 * @returns {{ streamUrl: string, quality: string, sessionToken: string, resumeAt: number, drmLicenseUrl: string|null, expiresAt: Date }}
 */
export const authorizePlayback = async ({
  userId,
  videoId,
  userAgent,
  deviceId,
  ipAddress,
}) => {
  // ── 1. Fetch and validate the video ────────────────────────────────────────
  const video = await Video.findById(videoId)
  if (!video || !video.isPublished) {
    throw new ApiError(404, 'Video not found or not available.')
  }

  // ── 2. YouTube-hosted path: no S3/CloudFront needed ───────────────────────
  if (video.videoSource === 'youtube') {
    // For paid YouTube videos, still verify purchase
    if (video.price > 0) {
      const purchase = await Purchase.findOne({ userId, videoId, status: 'completed' })
      if (!purchase) {
        throw new ApiError(403, 'Access denied: purchase required to watch this video.')
      }
    }
    return {
      videoSource:          'youtube',
      youtubeUrl:           video.youtubeUrl,
      streamUrl:            null,
      signingParams:        null,
      quality:              null,
      sessionToken:         null,
      drmLicenseUrl:        null,
      expiresAt:            null,
      videoDurationSeconds: video.durationSeconds,
    }
  }

  // ── 3. S3/CloudFront path ──────────────────────────────────────────────────
  if (video.status !== 'ready') {
    throw new ApiError(409, 'Video is still being processed. Please try again shortly.')
  }

  // For paid videos, verify purchase
  if (video.price > 0) {
    const purchase = await Purchase.findOne({ userId, videoId, status: 'completed' })
    if (!purchase) {
      throw new ApiError(403, 'Access denied: purchase required to watch this video.')
    }
  }

  // ── 4. Fetch video asset (HLS paths) ──────────────────────────────────────
  const asset = await VideoAsset.findOne({ videoId })
  if (!asset) {
    throw new ApiError(500, 'Video asset configuration not found.')
  }

  // ── 5. Device type → quality ───────────────────────────────────────────────
  const deviceType = detectDeviceType(userAgent)
  const quality = resolveQuality(deviceType)

  const cloudFrontPath =
    quality === '720p'
      ? asset.hls720pCloudFrontPath
      : asset.hls1080pCloudFrontPath

  if (!cloudFrontPath) {
    throw new ApiError(500, `${quality} stream not available for this video.`)
  }

  // ── 6. Generate CloudFront Signed URL (wildcard custom policy) ────────────
  const { streamUrl, signingParams, expiresAt } = generateSignedUrl(cloudFrontPath)

  // ── 7. Create playback session ─────────────────────────────────────────────
  const playbackSession = await createPlaybackSession({
    userId,
    videoId,
    deviceId,
    ipAddress,
    quality,
    signedUrl: streamUrl,
    expiresAt,
  })

  // ── 8. DRM license URL (null when DRM_PROVIDER=none) ──────────────────────
  const drmLicenseUrl = buildLicenseProxyUrl(videoId, 'widevine')

  return {
    streamUrl,
    signingParams,
    quality,
    videoSource:          'upload',
    sessionToken:         playbackSession.sessionToken,
    drmLicenseUrl,
    expiresAt,
    videoDurationSeconds: video.durationSeconds,
  }
}

/**
 * Check whether a user has a completed purchase for a specific video.
 * Lightweight check — no AWS calls.
 */
export const hasPurchased = async (userId, videoId) => {
  const purchase = await Purchase.findOne({
    userId,
    videoId,
    status: { $in: ['completed', 'expired'] }, // allow expired so final-session progress saves work
  })
  return !!purchase
}
