import { Router } from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import adminMiddleware from '../middlewares/adminMiddleware.js'
import {
  createCoupon,
  listCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  previewCoupon,
} from '../controllers/couponController.js'

const router = Router()

// ── User route (authenticated only) ──────────────────────────────────────
router.post('/validate', authMiddleware, previewCoupon)

// ── Admin routes ──────────────────────────────────────────────────────────
router.use(authMiddleware, adminMiddleware)
router.get('/',          listCoupons)
router.post('/',         createCoupon)
router.get('/:id',       getCoupon)
router.patch('/:id',     updateCoupon)
router.delete('/:id',    deleteCoupon)

export default router
