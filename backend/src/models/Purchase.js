import mongoose from 'mongoose'

/**
 * Purchase — records a confirmed pay-per-video purchase.
 * The playback gate checks this collection before issuing a signed URL.
 */
const purchaseSchema = new mongoose.Schema(
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

    // Razorpay fields
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },

    amountPaise: {
      type: Number,
      required: true, // stored in smallest currency unit (paise for INR)
    },
    currency: {
      type: String,
      default: 'INR',
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Enforce one completed purchase per user per video
purchaseSchema.index({ userId: 1, videoId: 1 })
purchaseSchema.index({ razorpayOrderId: 1 }, { unique: true })
purchaseSchema.index({ status: 1 })

const Purchase = mongoose.model('Purchase', purchaseSchema)
export default Purchase
