import WatchHistory from '../models/WatchHistory.js'
import Video from '../models/Video.js'

/**
 * Save or update watch progress for a user on a video.
 * Uses findOneAndUpdate with upsert for idempotent writes.
 *
 * @param {string}  userId
 * @param {string}  videoId
 * @param {number}  currentTimestamp   Playhead position in seconds
 * @param {number}  videoDurationSeconds   Total video duration in seconds
 * @returns {WatchHistory}
 */
export const saveProgress = async (userId, videoId, currentTimestamp, videoDurationSeconds) => {
  const completionPercent = videoDurationSeconds > 0
    ? Math.min(100, Math.round((currentTimestamp / videoDurationSeconds) * 100))
    : 0

  const completed = completionPercent >= 90

  const update = {
    $set: {
      currentTimestamp,
      completionPercent,
      lastPlayedAt: new Date(),
      videoDurationSeconds,
    },
  }

  if (completed) {
    update.$set.completed = true
    update.$set.completedAt = new Date()
  }

  const record = await WatchHistory.findOneAndUpdate(
    { userId, videoId },
    update,
    { upsert: true, new: true }
  )

  // Increment view count on first watch
  if (record.currentTimestamp === currentTimestamp && currentTimestamp < 10) {
    await Video.updateOne({ _id: videoId }, { $inc: { viewCount: 1 } })
  }

  return record
}

/**
 * Get the watch progress for a user on a video.
 * Returns null if the user has never watched the video.
 *
 * @param {string} userId
 * @param {string} videoId
 * @returns {WatchHistory|null}
 */
export const getProgress = async (userId, videoId) => {
  return WatchHistory.findOne({ userId, videoId })
}

/**
 * Get the full watch history for a user, sorted by last played.
 *
 * @param {string} userId
 * @param {number} limit
 * @param {number} skip
 */
export const getUserHistory = async (userId, limit = 20, skip = 0) => {
  return WatchHistory.find({ userId })
    .sort({ lastPlayedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('videoId', 'title thumbnailUrl durationSeconds')
}

/**
 * Mark a video as completed explicitly (e.g. player fires ended event).
 */
export const markCompleted = async (userId, videoId) => {
  return WatchHistory.findOneAndUpdate(
    { userId, videoId },
    {
      $set: {
        completed: true,
        completionPercent: 100,
        completedAt: new Date(),
        lastPlayedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  )
}
