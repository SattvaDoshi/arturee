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
