import mongoose from 'mongoose'

/**
 * WatchHistory — persists per-user per-video watch progress.
 * Used to auto-resume playback from where the user left off.
 */
const watchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },

    // Current playhead position in seconds
    currentTimestamp: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Completion percentage 0–100
    completionPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // True when completionPercent >= 90
    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    lastPlayedAt: {
      type: Date,
      default: null,
    },

    // Total seconds of the video at time of last save — used to compute %
    videoDurationSeconds: {
      type: Number,
      default: null,
    },

    // ── View-limit enforcement ────────────────────────────────────────────
    // Number of times the user has watched >= 80% of the video.
    // Each distinct playback session that crosses 80% increments this.
    // When watchCount >= 2, the purchase is auto-expired.
    watchCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // True when 80%+ was reached in the current playback session.
    // Prevents double-counting within the same session.
    has80PercentCurrentSession: {
      type: Boolean,
      default: false,
    },

    // Opaque ID set by the frontend at the start of each play session.
    // When it changes, it signals a new separate watch attempt.
    currentSessionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Unique progress record per user-video pair
watchHistorySchema.index({ userId: 1, videoId: 1 }, { unique: true })
watchHistorySchema.index({ userId: 1 })
watchHistorySchema.index({ lastPlayedAt: -1 })

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema)
export default WatchHistory
