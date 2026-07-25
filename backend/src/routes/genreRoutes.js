import express from 'express'
import {
  createGenre,
  getAllGenres,
  updateGenre,
  deleteGenre,
} from '../controllers/genreController.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import adminMiddleware from '../middlewares/adminMiddleware.js'

const router = express.Router()

router.get('/', getAllGenres)

// Admin only routes
router.use(authMiddleware)
router.use(adminMiddleware)

router.post('/', createGenre)
router.patch('/:id', updateGenre)
router.delete('/:id', deleteGenre)

export default router
