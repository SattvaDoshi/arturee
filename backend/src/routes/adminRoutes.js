import { Router } from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import adminMiddleware from '../middlewares/adminMiddleware.js'
import {
  getDashboardStats,
  listUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  listAllVideos,
  updateFeaturedVideos,
  getRevenueStats,
  uploadImage,
} from '../controllers/adminController.js'
import {
  getApplications,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/artistApplicationController.js'
import upload, { processImage } from '../middlewares/uploadMiddleware.js'

const router = Router()
router.use(authMiddleware, adminMiddleware)

router.put('/videos/featured', updateFeaturedVideos)

router.get('/stats', getDashboardStats)
router.get('/users', listUsers)
router.get('/users/:userId', getUserById)
router.patch('/users/:userId/role', updateUserRole)
router.delete('/users/:userId', deleteUser)
router.get('/videos', listAllVideos)
router.get('/revenue', getRevenueStats)

router.get('/applications', getApplications)
router.patch('/applications/:applicationId/status', updateApplicationStatus)
router.delete('/applications/:applicationId', deleteApplication)

router.post('/upload-image', upload.single('image'), processImage, uploadImage)

export default router
