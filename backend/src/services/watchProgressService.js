import WatchHistory from '../models/WatchHistory.js'
import Purchase from '../models/Purchase.js'
import Video from '../models/Video.js'

const VIEW_LIMIT         = 2    // purchases expire after this many ≥80% watches
const COMPLETION_PERCENT = 80   // the threshold that counts as a "full watch"

/**
 * Save or update watch progress for a user on a video.
 *
 * Core logic:
 *  - Tracks completionPercent on every progress save.
 *  - When completionPercent >= 80 for the first time in a given play session,
 *    it increments watchCount on the WatchHistory record AND viewsUsed on the Purchase.
 *  - When viewsUsed reaches VIEW_LIMIT (2), the Purchase is marked 'expired'.
 *
 * Session deduplication:
 *  - The frontend sends a unique sessionId per play (generated at video load time).
 *  - If the current progress save belongs to the same sessionId as the last
 *    one that triggered an 80% count, we skip incrementing.
 *
 * @param {string}  userId
 * @param {string}  videoId
 * @param {number}  currentTimestamp        Playhead position in seconds
 * @param {number}  videoDurationSeconds    Total video duration in seconds
 * @param {string}  [playSessionId]         Opaque ID for this play attempt
 * @returns {{ record: WatchHistory, purchaseExpired: boolean }}
 */
export const saveProgress = async (
  userId,
  videoId,
  currentTimestamp,
  videoDurationSeconds,
  playSessionId = null,
) => {
  const completionPercent = videoDurationSeconds > 0
    ? Math.min(100, Math.round((currentTimestamp / videoDurationSeconds) * 100))
    : 0

  const completed = completionPercent >= 90

  // Fetch current record so we can make decisions before writing
  const existing = await WatchHistory.findOne({ userId, videoId })

  // ── View-limit gate ────────────────────────────────────────────────────────
  // We need to increment watchCount when:
  //   1. completionPercent crossed the 80% threshold, AND
  //   2. This is a NEW session (playSessionId changed), OR we've never counted it
  const crossedThreshold   = completionPercent >= COMPLETION_PERCENT
  const isNewSession       = playSessionId && playSessionId !== existing?.currentSessionId
  const alreadyCountedThis = existing?.has80PercentCurrentSession && !isNewSession

  let shouldIncrementCount = crossedThreshold && !alreadyCountedThis
  let purchaseExpired = false

  if (shouldIncrementCount) {
    // Atomically increment viewsUsed on the Purchase record
    const purchase = await Purchase.findOneAndUpdate(
      { userId, videoId, status: 'completed' },
      { $inc: { viewsUsed: 1 } },
      { returnDocument: 'after' }
    )

    if (purchase) {
      if (purchase.viewsUsed >= VIEW_LIMIT) {
        // Expire the purchase
        await Purchase.findByIdAndUpdate(purchase._id, {
          $set: {
            status:    'expired',
            expiredAt: new Date(),
          },
        })
        purchaseExpired = true
        console.log(`[ViewLimit] Purchase expired for user ${userId}, video ${videoId} after ${purchase.viewsUsed} views.`)
      }
    }
  }

  // ── Build the WatchHistory update ──────────────────────────────────────────
  const update = {
    $set: {
      currentTimestamp,
      completionPercent,
      lastPlayedAt:      new Date(),
      videoDurationSeconds,
    },
  }

  if (completed) {
    update.$set.completed   = true
    update.$set.completedAt = new Date()
  }

  if (shouldIncrementCount) {
    update.$inc = { watchCount: 1 }
    update.$set.has80PercentCurrentSession = true

    // Record the session that triggered this count
    if (playSessionId) {
      update.$set.currentSessionId = playSessionId
    }
  } else if (isNewSession && playSessionId) {
    // New session started but hasn't crossed 80% yet — reset the flag
    update.$set.has80PercentCurrentSession = false
    update.$set.currentSessionId = playSessionId
  }

  const record = await WatchHistory.findOneAndUpdate(
    { userId, videoId },
    update,
    { upsert: true, returnDocument: 'after' }
  )

  // Increment video view count on first play
  if (!existing && currentTimestamp < 10) {
    await Video.updateOne({ _id: videoId }, { $inc: { viewCount: 1 } })
  }

  return { record, purchaseExpired }
}

/**
 * Get the watch progress for a user on a video.
 * Returns null if the user has never watched the video.
 */
export const getProgress = async (userId, videoId) => {
  return WatchHistory.findOne({ userId, videoId })
}

/**
 * Get the full watch history for a user, sorted by last played.
 */
export const getUserHistory = async (userId, limit = 20, skip = 0) => {
  const history = await WatchHistory.find({ userId })
    .sort({ lastPlayedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'videoId',
      select: 'title thumbnailUrl durationSeconds genre',
      populate: { path: 'genre', select: 'name' }
    })
    .lean()

  const videoIds = history.map(h => h.videoId?._id).filter(Boolean)
  const purchases = await Purchase.find({ 
    userId, 
    videoId: { $in: videoIds }, 
    status: { $in: ['completed', 'expired'] } 
  }).lean()
  
  const purchaseMap = purchases.reduce((acc, p) => {
    acc[p.videoId.toString()] = p
    return acc
  }, {})

  return history.map(h => ({
    ...h,
    purchase: purchaseMap[h.videoId?._id?.toString()] || null
  }))
}

/**
 * Mark a video as completed explicitly (e.g. player fires ended event).
 */
export const markCompleted = async (userId, videoId) => {
  return WatchHistory.findOneAndUpdate(
    { userId, videoId },
    {
      $set: {
        completed:          true,
        completionPercent:  100,
        completedAt:        new Date(),
        lastPlayedAt:       new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  )
}
