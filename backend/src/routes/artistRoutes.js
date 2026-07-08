import { Router } from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import adminMiddleware from '../middlewares/adminMiddleware.js'
import { listArtists, getArtist, createArtist, updateArtist, deleteArtist } from '../controllers/artistController.js'

const router = Router()

router.get('/', listArtists)
router.get('/:artistId', getArtist)
router.post('/', authMiddleware, adminMiddleware, createArtist)
router.patch('/:artistId', authMiddleware, adminMiddleware, updateArtist)
router.delete('/:artistId', authMiddleware, adminMiddleware, deleteArtist)

export default router
