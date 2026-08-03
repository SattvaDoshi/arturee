import { Router } from 'express'
import multer from 'multer'
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
  manuallyPublishVideo,
  proxyUpload,
  reactToVideo,
} from '../controllers/videoController.js'

// Multer: keep the file in memory (buffer), unlimited file size
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Infinity }, // Unlimited file size
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true)
    else cb(new Error('Only video files are allowed'))
  },
})

const router = Router()

// ── Public routes ──────────────────────────────────────────────────────────
router.get('/', generalLimiter, listVideos)
router.get('/:videoId', generalLimiter, getVideo)
router.post('/:videoId/react', authMiddleware, generalLimiter, reactToVideo)

// ── Admin-only routes ──────────────────────────────────────────────────────
router.post('/upload/initiate', authMiddleware, adminMiddleware, uploadLimiter, initiateUpload)
router.post('/upload/complete', authMiddleware, adminMiddleware, uploadLimiter, completeUpload)
router.post('/upload/abort', authMiddleware, adminMiddleware, abortUpload)

// Proxy upload — file goes through backend to S3 (bypasses CORS)
router.post('/upload/proxy', authMiddleware, adminMiddleware, upload.single('file'), proxyUpload)

router.get('/:videoId/job-status', authMiddleware, adminMiddleware, getMediaConvertStatus)

router.patch('/:videoId/publish', authMiddleware, adminMiddleware, manuallyPublishVideo)
router.patch('/:videoId', authMiddleware, adminMiddleware, updateVideo)
router.delete('/:videoId', authMiddleware, adminMiddleware, deleteVideo)

export default router
