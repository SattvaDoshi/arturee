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
  let videoIds = []
  
  if (req.body.videoIds && Array.isArray(req.body.videoIds)) {
    videoIds = req.body.videoIds
  } else if (req.body.videoId) {
    videoIds = [req.body.videoId]
  }

  if (!videoIds.length) throw new ApiError(400, 'videoId or videoIds is required.')

  const userId = req.user._id

  // Filter out already purchased
  const existingPurchases = await Purchase.find({ userId, videoId: { $in: videoIds }, status: 'completed' })
  const existingVideoIds = existingPurchases.map(p => p.videoId.toString())
  
  const videoIdsToBuy = videoIds.filter(id => !existingVideoIds.includes(id.toString()))
  if (!videoIdsToBuy.length) {
    throw new ApiError(409, 'You have already purchased all selected videos.')
  }

  // Fetch video prices
  const videos = await Video.find({ _id: { $in: videoIdsToBuy }, isPublished: true, status: 'ready' }).select('title price currency isPublished status')
  if (!videos.length) throw new ApiError(404, 'Videos not found or not available for purchase.')

  let subtotal = 0
  videos.forEach(v => subtotal += (v.price || 0))
  
  let discountPercentage = 0
  if (videos.length >= 5) discountPercentage = 0.15
  else if (videos.length >= 3) discountPercentage = 0.10

  const total = subtotal * (1 - discountPercentage)
  const amountPaise = Math.round(total * 100)

  const tempOrderId = 'pending_' + Date.now()

  // Create pending Purchase records
  await Promise.all(videos.map(video => {
    const itemDiscount = (video.price || 0) * discountPercentage
    const itemTotal = (video.price || 0) - itemDiscount
    return Purchase.create({
      userId,
      videoId: video._id,
      razorpayOrderId: tempOrderId,
      amountPaise: Math.round(itemTotal * 100),
      currency: video.currency || 'INR',
      status: 'pending',
    })
  }))

  try {
    const order = await createOrder(amountPaise, 'INR', 'cart_checkout', {
      userId: userId.toString(),
      videoCount: videos.length.toString(),
    })

    // Update with real Razorpay order ID
    await Purchase.updateMany(
      { razorpayOrderId: tempOrderId },
      { $set: { razorpayOrderId: order.id } }
    )

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        videoTitle: videos.length === 1 ? videos[0].title : `${videos.length} videos`,
      },
    })
  } catch (err) {
    await Purchase.updateMany(
      { razorpayOrderId: tempOrderId },
      { $set: { status: 'failed' } }
    )
    logPurchaseError(userId, 'cart_checkout', err)
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
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, 'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required.')
  }

  const purchases = await Purchase.find({ razorpayOrderId })
  if (!purchases.length) throw new ApiError(404, 'Purchase records not found.')
  if (purchases[0].userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Forbidden.')
  }
  
  const allCompleted = purchases.every(p => p.status === 'completed')
  if (allCompleted) {
    return res.status(200).json({ success: true, data: { alreadyCompleted: true } })
  }

  // Verify HMAC
  const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  if (!isValid) {
    await Purchase.updateMany(
      { razorpayOrderId },
      { $set: { status: 'failed' } }
    )
    logPurchaseError(purchases[0].userId, 'cart_verify', new Error('Signature mismatch'))
    throw new ApiError(400, 'Payment verification failed: invalid signature.')
  }

  await Purchase.updateMany(
    { razorpayOrderId },
    { $set: { 
      razorpayPaymentId, 
      razorpaySignature, 
      status: 'completed', 
      completedAt: new Date() 
    } }
  )

  // Increment purchase count on the videos
  const videoIds = purchases.map(p => p.videoId)
  await Video.updateMany({ _id: { $in: videoIds } }, { $inc: { purchaseCount: 1 } })

  res.status(200).json({
    success: true,
    data: {
      message: 'Payment verified. You can now stream your videos.',
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
    .populate({
      path: 'videoId',
      select: 'title thumbnailUrl price durationSeconds isPublished genre',
      populate: { path: 'genre', select: 'name' },
    })
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
