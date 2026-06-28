import mongoose from 'mongoose'

/**
 * PlaybackSession — a short-lived record tied to a CloudFront signed URL.
 * Prevents signed URL sharing: each playback request gets a unique sessionToken.
 * Expires automatically after TTL (matched to the signed URL expiry + buffer).
 */
const playbackSessionSchema = new mongoose.Schema(
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
    sessionToken: {
      type: String,
      required: true,
      unique: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },

    // Which quality was issued
    quality: {
      type: String,
      enum: ['720p', '1080p'],
      required: true,
    },

    // Signed URL itself (stored for reference / audit, never re-served)
    signedUrl: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// TTL index — MongoDB auto-deletes expired sessions
playbackSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
playbackSessionSchema.index({ userId: 1, videoId: 1 })
playbackSessionSchema.index({ sessionToken: 1 })

const PlaybackSession = mongoose.model('PlaybackSession', playbackSessionSchema)
export default PlaybackSession
