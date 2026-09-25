import express from 'express'
import {
  createCategory,
  getAllCategorys,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import adminMiddleware from '../middlewares/adminMiddleware.js'

const router = express.Router()

router.get('/', getAllCategorys)

// Admin only routes
router.use(authMiddleware)
router.use(adminMiddleware)

router.post('/', createCategory)
router.patch('/:id', updateCategory)
router.delete('/:id', deleteCategory)

export default router
