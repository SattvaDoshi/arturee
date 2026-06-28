import { Router } from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { generalLimiter } from '../middlewares/rateLimiter.js'
import {
  saveWatchProgress,
  getWatchProgress,
  completeVideo,
  getWatchHistory,
} from '../controllers/progressController.js'

const router = Router()

// All progress routes require authentication
router.use(authMiddleware)

router.post('/save', generalLimiter, saveWatchProgress)
router.post('/complete', generalLimiter, completeVideo)
router.get('/history', generalLimiter, getWatchHistory)
router.get('/:videoId', generalLimiter, getWatchProgress)

export default router
