import asyncHandler from '../utils/asyncHandler.js'
import Coupon from '../models/Coupon.js'
import ApiError from '../utils/ApiError.js'

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Calculate how much a coupon discounts a given cart total (in INR).
 * Returns the discount amount (capped so it never exceeds totalINR).
 */
export function calcCouponDiscount(coupon, totalINR) {
  let discount = 0
  if (coupon.discountType === 'flat') {
    discount = coupon.discountValue
  } else {
    // percent
    discount = (coupon.discountValue / 100) * totalINR
    if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }
  }
  return Math.min(discount, totalINR) // never negative
}

/**
 * Validate a coupon for a given user and cart total.
 * Throws ApiError on any failure, returns coupon doc on success.
 */
export async function validateCoupon(code, userId, totalINR) {
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() })
  if (!coupon) throw new ApiError(404, 'Coupon not found.')
  if (!coupon.isActive) throw new ApiError(400, 'This coupon is inactive.')

  // Expiry check
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new ApiError(400, 'This coupon has expired.')
  }

  // Total usage cap
  if (coupon.maxUsesTotal !== null && coupon.usedCount >= coupon.maxUsesTotal) {
    throw new ApiError(400, 'This coupon has reached its usage limit.')
  }

  // Per-user usage cap
  if (coupon.maxUsesPerUser !== null) {
    const userEntry = coupon.userUsage.find(u => u.userId.toString() === userId.toString())
    if (userEntry && userEntry.useCount >= coupon.maxUsesPerUser) {
      throw new ApiError(400, 'You have already used this coupon the maximum number of times.')
    }
  }

  // Targeted coupon
  if (coupon.allowedUserIds?.length) {
    const allowed = coupon.allowedUserIds.map(id => id.toString())
    if (!allowed.includes(userId.toString())) {
      throw new ApiError(403, 'This coupon is not valid for your account.')
    }
  }

  // Minimum cart value
  if (totalINR < coupon.minCartValue) {
    throw new ApiError(400, `This coupon requires a minimum cart value of ₹${coupon.minCartValue.toFixed(2)}.`)
  }

  return coupon
}

// ── Admin: CRUD ───────────────────────────────────────────────────────────

/** POST /api/coupons — admin creates a coupon */
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code, description, discountType, discountValue,
    maxDiscount, minCartValue, expiresAt,
    maxUsesTotal, maxUsesPerUser, allowedUserIds, isActive,
  } = req.body

  if (!code || !discountType || discountValue === undefined) {
    throw new ApiError(400, 'code, discountType and discountValue are required.')
  }

  const coupon = await Coupon.create({
    code,
    description,
    discountType,
    discountValue,
    maxDiscount:    maxDiscount    ?? null,
    minCartValue:   minCartValue   ?? 0,
    expiresAt:      expiresAt      ? new Date(expiresAt) : null,
    maxUsesTotal:   maxUsesTotal   ?? null,
    maxUsesPerUser: maxUsesPerUser ?? null,
    allowedUserIds: allowedUserIds ?? [],
    isActive:       isActive !== undefined ? isActive : true,
    createdBy:      req.user._id,
  })

  res.status(201).json({ success: true, data: coupon })
})

/** GET /api/coupons — admin lists all coupons */
export const listCoupons = asyncHandler(async (req, res) => {
  const page  = Math.max(parseInt(req.query.page  || '1'), 1)
  const limit = Math.min(parseInt(req.query.limit || '20'), 100)
  const skip  = (page - 1) * limit

  const filter = {}
  if (req.query.active !== undefined) filter.isActive = req.query.active === 'true'
  if (req.query.search) filter.code = { $regex: req.query.search.toUpperCase(), $options: 'i' }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ])

  res.status(200).json({ success: true, data: { coupons, total, page, limit } })
})

/** GET /api/coupons/:id — admin get one */
export const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
  if (!coupon) throw new ApiError(404, 'Coupon not found.')
  res.status(200).json({ success: true, data: coupon })
})

/** PATCH /api/coupons/:id — admin update */
export const updateCoupon = asyncHandler(async (req, res) => {
  const {
    description, discountType, discountValue,
    maxDiscount, minCartValue, expiresAt,
    maxUsesTotal, maxUsesPerUser, allowedUserIds, isActive,
  } = req.body

  const coupon = await Coupon.findById(req.params.id)
  if (!coupon) throw new ApiError(404, 'Coupon not found.')

  if (description  !== undefined) coupon.description  = description
  if (discountType !== undefined) coupon.discountType  = discountType
  if (discountValue!== undefined) coupon.discountValue = discountValue
  if (maxDiscount  !== undefined) coupon.maxDiscount   = maxDiscount
  if (minCartValue !== undefined) coupon.minCartValue  = minCartValue
  if (expiresAt    !== undefined) coupon.expiresAt     = expiresAt ? new Date(expiresAt) : null
  if (maxUsesTotal !== undefined) coupon.maxUsesTotal  = maxUsesTotal
  if (maxUsesPerUser!==undefined) coupon.maxUsesPerUser= maxUsesPerUser
  if (allowedUserIds!==undefined) coupon.allowedUserIds= allowedUserIds
  if (isActive     !== undefined) coupon.isActive      = isActive

  await coupon.save()
  res.status(200).json({ success: true, data: coupon })
})

/** DELETE /api/coupons/:id — admin delete */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id)
  if (!coupon) throw new ApiError(404, 'Coupon not found.')
  res.status(200).json({ success: true, message: 'Coupon deleted.' })
})

// ── User: validate / preview ──────────────────────────────────────────────

/**
 * POST /api/coupons/validate
 * Body: { code, videoIds }
 * Returns: { discount, finalTotal, isFree }
 * Used by Checkout page to preview what a coupon does BEFORE paying.
 */
export const previewCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body
  if (!code || cartTotal === undefined) {
    throw new ApiError(400, 'code and cartTotal are required.')
  }

  const userId   = req.user._id
  const totalINR = parseFloat(cartTotal)
  if (isNaN(totalINR) || totalINR < 0) throw new ApiError(400, 'Invalid cartTotal.')

  const coupon   = await validateCoupon(code, userId, totalINR)
  const discount = calcCouponDiscount(coupon, totalINR)
  const finalTotal = Math.max(totalINR - discount, 0)

  res.status(200).json({
    success: true,
    data: {
      code:        coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount:  coupon.maxDiscount,
      discount:     parseFloat(discount.toFixed(2)),
      finalTotal:   parseFloat(finalTotal.toFixed(2)),
      isFree:       finalTotal === 0,
    },
  })
})
