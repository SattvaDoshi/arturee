import express from 'express'
import {
  createSpecialty,
  getAllSpecialties,
  updateSpecialty,
  deleteSpecialty
} from '../controllers/SpecialtyController.js'
import protect from '../middlewares/authMiddleware.js'
import adminMiddleware from '../middlewares/adminMiddleware.js'

const router = express.Router()

router.route('/')
  .get(getAllSpecialties)
  .post(protect, adminMiddleware, createSpecialty)

router.route('/:id')
  .put(protect, adminMiddleware, updateSpecialty)
  .delete(protect, adminMiddleware, deleteSpecialty)

export default router
