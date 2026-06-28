import asyncHandler from '../utils/asyncHandler.js'
import { createOrder, verifySignature } from '../services/razorpayService.js'
import { logPurchaseError } from '../services/cloudWatchService.js'
import Purchase from '../models/Purchase.js'
import Video from '../models/Video.js'
import ApiError from '../utils/ApiError.js'

// ── Create Razorpay order ─────────────────────────────────────────────────

/**
 * POST /api/purchase/create-order
 *
 * Body: { videoId }
 * Returns: { orderId, amount, currency, videoTitle }
 *
 * Creates a pending Purchase record and a Razorpay order.
 * The frontend uses the orderId to open the Razorpay checkout modal.
 */
export const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { videoId } = req.body
  if (!videoId) throw new ApiError(400, 'videoId is required.')

  const userId = req.user._id

  // Check if already purchased
  const existing = await Purchase.findOne({ userId, videoId, status: 'completed' })
  if (existing) {
    throw new ApiError(409, 'You have already purchased this video.')
  }

  // Fetch video price
  const video = await Video.findById(videoId).select('title price currency isPublished status')
  if (!video || !video.isPublished) throw new ApiError(404, 'Video not found.')
  if (video.status !== 'ready') throw new ApiError(409, 'Video is not yet available for purchase.')

  // Amount must be in paise (smallest unit)
  const amountPaise = Math.round(video.price * 100)

  // Create pending Purchase record first
  const purchase = await Purchase.create({
    userId,
    videoId,
    razorpayOrderId: 'pending_' + Date.now(), // temporary — updated after Razorpay call
    amountPaise,
    currency: video.currency || 'INR',
    status: 'pending',
  })

  try {
    const order = await createOrder(amountPaise, video.currency || 'INR', purchase._id.toString(), {
      userId: userId.toString(),
      videoId: videoId.toString(),
    })

    // Update with real Razorpay order ID
    purchase.razorpayOrderId = order.id
    await purchase.save()

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        purchaseId: purchase._id,
        videoTitle: video.title,
      },
    })
  } catch (err) {
    purchase.status = 'failed'
    await purchase.save()
    logPurchaseError(userId, videoId, err)
    throw err
  }
})

// ── Verify Razorpay payment ───────────────────────────────────────────────

/**
 * POST /api/purchase/verify
 *
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, purchaseId }
 * Returns: { success, purchaseId, videoId }
 *
 * Verifies HMAC signature and marks Purchase as completed.
 */
export const verifyPurchase = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, purchaseId } = req.body

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !purchaseId) {
    throw new ApiError(400, 'razorpayOrderId, razorpayPaymentId, razorpaySignature, and purchaseId are required.')
  }

  const purchase = await Purchase.findById(purchaseId)
  if (!purchase) throw new ApiError(404, 'Purchase record not found.')
  if (purchase.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Forbidden.')
  }
  if (purchase.status === 'completed') {
    return res.status(200).json({ success: true, data: { alreadyCompleted: true, purchaseId } })
  }

  // Verify HMAC
  const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  if (!isValid) {
    purchase.status = 'failed'
    await purchase.save()
    logPurchaseError(purchase.userId, purchase.videoId, new Error('Signature mismatch'))
    throw new ApiError(400, 'Payment verification failed: invalid signature.')
  }

  purchase.razorpayPaymentId = razorpayPaymentId
  purchase.razorpaySignature = razorpaySignature
  purchase.status = 'completed'
  purchase.completedAt = new Date()
  await purchase.save()

  // Increment purchase count on the video
  await Video.updateOne({ _id: purchase.videoId }, { $inc: { purchaseCount: 1 } })

  res.status(200).json({
    success: true,
    data: {
      purchaseId: purchase._id,
      videoId: purchase.videoId,
      message: 'Payment verified. You can now stream this video.',
    },
  })
})

// ── Get user purchases ────────────────────────────────────────────────────

/**
 * GET /api/purchase/my
 * Returns all completed purchases for the authenticated user.
 */
export const getMyPurchases = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const purchases = await Purchase.find({ userId, status: 'completed' })
    .populate('videoId', 'title thumbnailUrl price durationSeconds isPublished')
    .sort({ completedAt: -1 })

  res.status(200).json({ success: true, data: purchases })
})

// ── Check purchase status for a video ────────────────────────────────────

/**
 * GET /api/purchase/check/:videoId
 */
export const checkPurchase = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId = req.user._id

  const purchase = await Purchase.findOne({ userId, videoId, status: 'completed' })

  res.status(200).json({
    success: true,
    data: { purchased: !!purchase, purchaseId: purchase?._id || null },
  })
})
