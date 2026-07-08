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
} from '../controllers/adminController.js'

const router = Router()
router.use(authMiddleware, adminMiddleware)

router.get('/stats', getDashboardStats)
router.get('/users', listUsers)
router.get('/users/:userId', getUserById)
router.patch('/users/:userId/role', updateUserRole)
router.delete('/users/:userId', deleteUser)
router.get('/videos', listAllVideos)

export default router
