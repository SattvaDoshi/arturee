import asyncHandler from '../utils/asyncHandler.js'
import { createOrder, verifySignature } from '../services/razorpayService.js'
import { logPurchaseError } from '../services/cloudWatchService.js'
import Purchase from '../models/Purchase.js'
import Video from '../models/Video.js'
import Coupon from '../models/Coupon.js'
import ApiError from '../utils/ApiError.js'
import { validateCoupon, calcCouponDiscount } from './couponController.js'

// ── Create Razorpay order ─────────────────────────────────────────────────

/**
 * POST /api/purchase/create-order
 *
 * Body: { videoId?, videoIds?, couponCode? }
 * Returns:
 *   - Normal: { orderId, amount, currency, videoTitle }
 *   - Free (coupon covers full amount): { isFree: true, message }
 *
 * Pricing chain:
 *   1. effectivePrice = discountedPrice ?? price   (per video)
 *   2. subtotal = sum of effective prices
 *   3. bulkDiscount (0% / 10% / 15% for 1 / 3+ / 5+ items)
 *   4. platformFee = 3% of discounted subtotal
 *   5. total = discountedSubtotal + platformFee
 *   6. couponDiscount applied to total → finalTotal
 *   7. If finalTotal <= 0 → FREE, mark purchases completed immediately
 */
export const createPurchaseOrder = asyncHandler(async (req, res) => {
  let videoIds = []
  if (req.body.videoIds && Array.isArray(req.body.videoIds)) {
    videoIds = req.body.videoIds
  } else if (req.body.videoId) {
    videoIds = [req.body.videoId]
  }

  if (!videoIds.length) throw new ApiError(400, 'videoId or videoIds is required.')

  const userId     = req.user._id
  const couponCode = req.body.couponCode?.trim().toUpperCase() || null

  // Filter out already purchased
  const existingPurchases = await Purchase.find({ userId, videoId: { $in: videoIds }, status: 'completed' })
  const existingVideoIds  = existingPurchases.map(p => p.videoId.toString())
  const videoIdsToBuy     = videoIds.filter(id => !existingVideoIds.includes(id.toString()))
  if (!videoIdsToBuy.length) throw new ApiError(409, 'You have already purchased all selected videos.')

  // Fetch video prices from DB (source of truth)
  const videos = await Video.find({ _id: { $in: videoIdsToBuy }, isPublished: true, status: 'ready' })
    .select('title price costPrice discountedPrice currency isPublished status')
  if (!videos.length) throw new ApiError(404, 'Videos not found or not available for purchase.')

  // ── Pricing calculation ─────────────────────────────────────────────────
  let subtotal = 0
  videos.forEach(v => { subtotal += (v.discountedPrice ?? v.price ?? 0) })

  let bulkDiscountPct = 0
  if (videos.length >= 5) bulkDiscountPct = 0.15
  else if (videos.length >= 3) bulkDiscountPct = 0.10

  const discountedSubtotal = subtotal * (1 - bulkDiscountPct)
  const platformFee        = discountedSubtotal * 0.03
  let   total              = discountedSubtotal + platformFee      // INR

  // ── Coupon ─────────────────────────────────────────────────────────────
  let coupon         = null
  let couponDiscount = 0

  if (couponCode) {
    coupon         = await validateCoupon(couponCode, userId, total)
    couponDiscount = calcCouponDiscount(coupon, total)
    total          = Math.max(total - couponDiscount, 0)
  }

  const finalAmountPaise = Math.round(total * 100)

  // ── Calculate proportional per-item amounts for DB records ──────────────
  const itemAmounts = videos.map(video => {
    const ep          = video.discountedPrice ?? video.price ?? 0
    const afterBulk   = ep * (1 - bulkDiscountPct)
    const afterFee    = afterBulk * 1.03
    // Apply coupon proportionally
    const ratio       = total > 0 ? (afterFee / (discountedSubtotal * 1.03)) : 0
    const itemFinal   = total > 0 ? afterFee - (couponDiscount * ratio) : 0
    return Math.round(Math.max(itemFinal, 0) * 100)
  })

  const tempOrderId = 'pending_' + Date.now()

  // Create pending Purchase records
  await Promise.all(videos.map((video, idx) =>
    Purchase.create({
      userId,
      videoId:         video._id,
      razorpayOrderId: tempOrderId,
      amountPaise:     itemAmounts[idx],
      currency:        video.currency || 'INR',
      status:          'pending',
      couponCode:      couponCode || undefined,
    })
  ))

  // ── FREE purchase path ──────────────────────────────────────────────────
  if (finalAmountPaise === 0) {
    // Mark all as completed immediately — no Razorpay needed
    await Purchase.updateMany(
      { razorpayOrderId: tempOrderId },
      { $set: { status: 'completed', completedAt: new Date(), razorpayOrderId: `free_${tempOrderId}` } }
    )
    // Increment video purchase counts
    await Video.updateMany({ _id: { $in: videos.map(v => v._id) } }, { $inc: { purchaseCount: 1 } })

    // Burn coupon usage
    if (coupon) await burnCoupon(coupon, userId)

    return res.status(200).json({
      success: true,
      data: {
        isFree: true,
        message: 'Your coupon covers the full amount. Videos unlocked for free!',
        videoTitle: videos.length === 1 ? videos[0].title : `${videos.length} videos`,
      },
    })
  }

  // ── Paid purchase path ──────────────────────────────────────────────────
  try {
    const order = await createOrder(finalAmountPaise, 'INR', 'cart_checkout', {
      userId:     userId.toString(),
      videoCount: videos.length.toString(),
      coupon:     couponCode || 'none',
    })

    await Purchase.updateMany(
      { razorpayOrderId: tempOrderId },
      { $set: { razorpayOrderId: order.id } }
    )

    res.status(200).json({
      success: true,
      data: {
        isFree:    false,
        orderId:   order.id,
        amount:    order.amount,
        currency:  order.currency,
        videoTitle: videos.length === 1 ? videos[0].title : `${videos.length} videos`,
        couponApplied: couponCode || null,
        couponDiscount: parseFloat(couponDiscount.toFixed(2)),
      },
    })
  } catch (err) {
    await Purchase.updateMany({ razorpayOrderId: tempOrderId }, { $set: { status: 'failed' } })
    logPurchaseError(userId, 'cart_checkout', err)
    throw err
  }
})

// ── Helper: burn a coupon use ─────────────────────────────────────────────
async function burnCoupon(coupon, userId) {
  const entry = coupon.userUsage.find(u => u.userId.toString() === userId.toString())
  if (entry) {
    entry.useCount += 1
  } else {
    coupon.userUsage.push({ userId, useCount: 1 })
  }
  coupon.usedCount += 1
  await coupon.save()
}

// ── Verify Razorpay payment ───────────────────────────────────────────────

/**
 * POST /api/purchase/verify
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
export const verifyPurchase = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, 'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required.')
  }

  const purchases = await Purchase.find({ razorpayOrderId })
  if (!purchases.length) throw new ApiError(404, 'Purchase records not found.')
  if (purchases[0].userId.toString() !== req.user._id.toString()) throw new ApiError(403, 'Forbidden.')

  const allCompleted = purchases.every(p => p.status === 'completed')
  if (allCompleted) return res.status(200).json({ success: true, data: { alreadyCompleted: true } })

  const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  if (!isValid) {
    await Purchase.updateMany({ razorpayOrderId }, { $set: { status: 'failed' } })
    logPurchaseError(purchases[0].userId, 'cart_verify', new Error('Signature mismatch'))
    throw new ApiError(400, 'Payment verification failed: invalid signature.')
  }

  await Purchase.updateMany(
    { razorpayOrderId },
    { $set: { razorpayPaymentId, razorpaySignature, status: 'completed', completedAt: new Date() } }
  )

  // Burn coupon usage if any
  const couponCode = purchases[0]?.couponCode
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode })
    if (coupon) await burnCoupon(coupon, purchases[0].userId)
  }

  const videoIds = purchases.map(p => p.videoId)
  await Video.updateMany({ _id: { $in: videoIds } }, { $inc: { purchaseCount: 1 } })

  res.status(200).json({ success: true, data: { message: 'Payment verified. You can now stream your videos.' } })
})

// ── Get user purchases ────────────────────────────────────────────────────

export const getMyPurchases = asyncHandler(async (req, res) => {
  const userId   = req.user._id
  const purchases = await Purchase.find({ userId, status: 'completed' })
    .populate({ path: 'videoId', select: 'title thumbnailUrl price durationSeconds isPublished genre', populate: { path: 'genre', select: 'name' } })
    .sort({ completedAt: -1 })
    .select('+viewsUsed')   // ensure viewsUsed is always included
  res.status(200).json({ success: true, data: purchases })
})

// ── Check purchase status for a video ────────────────────────────────────

export const checkPurchase = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId      = req.user._id
  const purchase    = await Purchase.findOne({ userId, videoId, status: 'completed' })
  res.status(200).json({ success: true, data: { purchased: !!purchase, purchaseId: purchase?._id || null } })
})
