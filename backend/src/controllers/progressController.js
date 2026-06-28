import asyncHandler from '../utils/asyncHandler.js'
import { saveProgress, getProgress, getUserHistory, markCompleted } from '../services/watchProgressService.js'
import ApiError from '../utils/ApiError.js'
import { hasPurchased } from '../services/playbackAuthService.js'

// ── Save watch progress ────────────────────────────────────────────────────

/**
 * POST /api/progress/save
 *
 * Body: { videoId, currentTimestamp, videoDurationSeconds }
 *
 * Called periodically by the player (e.g. every 10 seconds).
 * Requires a valid purchase.
 */
export const saveWatchProgress = asyncHandler(async (req, res) => {
  const { videoId, currentTimestamp, videoDurationSeconds } = req.body

  if (!videoId || currentTimestamp === undefined || !videoDurationSeconds) {
    throw new ApiError(400, 'videoId, currentTimestamp, and videoDurationSeconds are required.')
  }

  const userId = req.user._id.toString()

  // Only allow progress saves for purchased videos
  const purchased = await hasPurchased(userId, videoId)
  if (!purchased) {
    throw new ApiError(403, 'Access denied: purchase required.')
  }

  const record = await saveProgress(userId, videoId, Number(currentTimestamp), Number(videoDurationSeconds))

  res.status(200).json({
    success: true,
    data: {
      currentTimestamp: record.currentTimestamp,
      completionPercent: record.completionPercent,
      completed: record.completed,
    },
  })
})

// ── Get progress for a video ───────────────────────────────────────────────

/**
 * GET /api/progress/:videoId
 * Returns the user's progress for a specific video.
 */
export const getWatchProgress = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId = req.user._id.toString()

  const record = await getProgress(userId, videoId)

  res.status(200).json({
    success: true,
    data: record
      ? {
          currentTimestamp: record.currentTimestamp,
          completionPercent: record.completionPercent,
          completed: record.completed,
          lastPlayedAt: record.lastPlayedAt,
        }
      : { currentTimestamp: 0, completionPercent: 0, completed: false, lastPlayedAt: null },
  })
})

// ── Mark video as completed ────────────────────────────────────────────────

/**
 * POST /api/progress/complete
 *
 * Body: { videoId }
 * Called when the player fires the 'ended' event.
 */
export const completeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.body
  if (!videoId) throw new ApiError(400, 'videoId is required.')

  const userId = req.user._id.toString()

  const purchased = await hasPurchased(userId, videoId)
  if (!purchased) throw new ApiError(403, 'Access denied.')

  const record = await markCompleted(userId, videoId)

  res.status(200).json({
    success: true,
    data: {
      completed: record.completed,
      completionPercent: record.completionPercent,
      completedAt: record.completedAt,
    },
  })
})

// ── Get full watch history ─────────────────────────────────────────────────

/**
 * GET /api/progress/history
 * Query: page, limit
 */
export const getWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString()
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 20)
  const skip = (page - 1) * limit

  const records = await getUserHistory(userId, limit, skip)

  res.status(200).json({ success: true, data: records })
})
