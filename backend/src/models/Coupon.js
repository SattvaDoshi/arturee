import mongoose from 'mongoose'

/**
 * Coupon Model
 * ─────────────
 * discountType: 'flat' | 'percent'
 *   flat    → discountValue is an INR amount subtracted from the total
 *   percent → discountValue is a percentage (0–100); maxDiscount caps the INR saving
 *
 * Restrictions:
 *   minCartValue  – coupon only applicable when cart total ≥ this value
 *   maxUsesTotal  – coupon expires after this many successful uses (null = unlimited)
 *   maxUsesPerUser– same user can redeem at most this many times (null = unlimited)
 *   expiresAt     – hard expiry datetime (null = never expires)
 *   allowedUserIds– if non-empty, only those user IDs may apply it (targeted coupon)
 *
 * When the coupon discount >= cart total, the purchase becomes FREE (no Razorpay).
 */
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    discountType: {
      type: String,
      enum: ['flat', 'percent'],
      required: true,
    },

    // INR amount (flat) or percentage (percent)
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    // Maximum INR discount when discountType === 'percent' (null = no cap)
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },

    // Minimum cart total (post platform-fee) required to use this coupon
    minCartValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Expiry
    expiresAt: {
      type: Date,
      default: null,
    },

    // Usage limits
    maxUsesTotal: {
      type: Number,
      default: null,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxUsesPerUser: {
      type: Number,
      default: null,
      min: 1,
    },

    // Per-user usage tracking
    userUsage: [
      {
        userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        useCount: { type: Number, default: 1 },
      },
    ],

    // Optional: restrict to specific users (empty = anyone can use)
    allowedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
)

couponSchema.index({ code: 1 })
couponSchema.index({ isActive: 1, expiresAt: 1 })

export default mongoose.model('Coupon', couponSchema)
