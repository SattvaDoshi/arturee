import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: null
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    googleId: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    otpHash: {
      type: String,
      default: null
    },
    otpExpiresAt: {
      type: Date,
      default: null
    },
    resetPasswordTokenHash: {
      type: String,
      default: null
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video', default: [] }],
    avatarUrl: { type: String, default: null },

    // ── Single-device enforcement ──────────────────────────────────────────
    // Incremented on every new login. Embedded in the JWT so that any
    // previously-issued JWT fails the version check in authMiddleware,
    // effectively invalidating all sessions from other devices immediately.
    sessionVersion: { type: Number, default: 0 },
    
    // Explicit tracking of the current active session
    activeSession: {
      sessionId:  { type: String },
      deviceId:   { type: String },
      createdAt:  { type: Date },
      lastSeenAt: { type: Date },
      userAgent:  { type: String }
    },
  },
  {
    timestamps: true
  }
)

const User = mongoose.model('User', userSchema)

export default User
