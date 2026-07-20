import mongoose from 'mongoose'

/**
 * DeviceSession — enforces one-active-device and one-active-IP policy.
 * Only one active document should exist per userId at any time.
 * When a new device logs in, the previous document is replaced.
 */
const deviceSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one row per user
    },

    // Fingerprint sent by the client (combination of UA + screen + platform hash)
    deviceId: {
      type: String,
      required: true,
    },

    // Human-readable device label (e.g. "Chrome on Windows")
    deviceLabel: {
      type: String,
      default: null,
    },

    // JWT or session token used to identify this login session
    sessionToken: {
      type: String,
      required: true,
    },

    // IP at login time
    ipAddress: {
      type: String,
      required: true,
    },

    // Country code at login — used for significant IP-change detection
    countryCode: {
      type: String,
      default: null,
    },

    loginAt: {
      type: Date,
      default: Date.now,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

deviceSessionSchema.index({ sessionToken: 1 })
// NOTE: userId index is created automatically by unique:true above

const DeviceSession = mongoose.model('DeviceSession', deviceSessionSchema)
export default DeviceSession
