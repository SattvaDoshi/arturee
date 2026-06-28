import { Router } from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { purchaseLimiter, generalLimiter } from '../middlewares/rateLimiter.js'
import {
  createPurchaseOrder,
  verifyPurchase,
  getMyPurchases,
  checkPurchase,
} from '../controllers/purchaseController.js'

const router = Router()

// All purchase routes require authentication
router.use(authMiddleware)

router.post('/create-order', purchaseLimiter, createPurchaseOrder)
router.post('/verify', purchaseLimiter, verifyPurchase)
router.get('/my', generalLimiter, getMyPurchases)
router.get('/check/:videoId', generalLimiter, checkPurchase)

export default router
