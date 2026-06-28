import { Router } from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { drmLimiter } from '../middlewares/rateLimiter.js'
import sessionMiddleware from '../middlewares/sessionMiddleware.js'
import {
  widevineLicenseProxy,
  fairplayLicenseProxy,
  playreadyLicenseProxy,
} from '../controllers/playbackController.js'
import express from 'express'

const router = Router()

// DRM license requests carry raw binary bodies — must parse as Buffer
const rawBodyParser = express.raw({ type: 'application/octet-stream', limit: '100kb' })

// All DRM routes require active session
router.post(
  '/license/widevine/:videoId',
  authMiddleware,
  sessionMiddleware,
  drmLimiter,
  rawBodyParser,
  widevineLicenseProxy
)

router.post(
  '/license/fairplay/:videoId',
  authMiddleware,
  sessionMiddleware,
  drmLimiter,
  rawBodyParser,
  fairplayLicenseProxy
)

router.post(
  '/license/playready/:videoId',
  authMiddleware,
  sessionMiddleware,
  drmLimiter,
  rawBodyParser,
  playreadyLicenseProxy
)

export default router
