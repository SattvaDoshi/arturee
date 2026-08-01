import { Router } from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import adminMiddleware from '../middlewares/adminMiddleware.js'
import {
  getLandingConfig,
  updateLandingConfig,
} from '../controllers/landingConfigController.js'

const router = Router()

// Public endpoint to fetch landing page config
router.get('/', getLandingConfig)

// Admin-only endpoint to update landing page config
router.put('/', authMiddleware, adminMiddleware, updateLandingConfig)

export default router
