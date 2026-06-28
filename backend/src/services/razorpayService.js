import Razorpay from 'razorpay'
import { createHmac } from 'crypto'
import env from '../config/env.js'
import { logPurchaseError } from './cloudWatchService.js'

const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret,
})

/**
 * Create a Razorpay order for a video purchase.
 *
 * @param {number}  amountPaise   Price in smallest currency unit (paise for INR)
 * @param {string}  currency      'INR'
 * @param {string}  receiptId     Unique receipt ID (use Purchase._id or videoId+userId)
 * @param {object}  notes         Additional metadata stored on the order
 * @returns Razorpay order object
 */
export const createOrder = async (amountPaise, currency = 'INR', receiptId, notes = {}) => {
  try {
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt: receiptId.toString().slice(0, 40), // max 40 chars
      notes,
    })
    return order
  } catch (err) {
    logPurchaseError(notes.userId || '', notes.videoId || '', err)
    throw err
  }
}

/**
 * Verify Razorpay payment signature.
 * Must be called before marking a Purchase as completed.
 *
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} razorpaySignature   Signature sent by Razorpay checkout
 * @returns {boolean}
 */
export const verifySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`
  const expectedSig = createHmac('sha256', env.razorpayKeySecret)
    .update(body)
    .digest('hex')
  return expectedSig === razorpaySignature
}

/**
 * Fetch an existing Razorpay order (useful for status checks).
 */
export const fetchOrder = async (orderId) => {
  return razorpay.orders.fetch(orderId)
}
