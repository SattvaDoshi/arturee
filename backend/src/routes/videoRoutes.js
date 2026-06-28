import { Router } from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import adminMiddleware from '../middlewares/adminMiddleware.js'
import { uploadLimiter, generalLimiter } from '../middlewares/rateLimiter.js'
import {
  initiateUpload,
  completeUpload,
  abortUpload,
  getMediaConvertStatus,
  getVideo,
  listVideos,
  updateVideo,
  deleteVideo,
} from '../controllers/videoController.js'

const router = Router()

// ── Public routes ──────────────────────────────────────────────────────────
router.get('/', generalLimiter, listVideos)
router.get('/:videoId', generalLimiter, getVideo)

// ── Admin-only routes ──────────────────────────────────────────────────────
router.post('/upload/initiate', authMiddleware, adminMiddleware, uploadLimiter, initiateUpload)
router.post('/upload/complete', authMiddleware, adminMiddleware, uploadLimiter, completeUpload)
router.post('/upload/abort', authMiddleware, adminMiddleware, abortUpload)

router.get('/:videoId/job-status', authMiddleware, adminMiddleware, getMediaConvertStatus)

router.patch('/:videoId', authMiddleware, adminMiddleware, updateVideo)
router.delete('/:videoId', authMiddleware, adminMiddleware, deleteVideo)

export default router
