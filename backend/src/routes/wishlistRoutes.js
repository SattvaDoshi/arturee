import { Router } from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js'

const router = Router()
router.use(authMiddleware)

router.get('/', getWishlist)
router.post('/:videoId', addToWishlist)
router.delete('/:videoId', removeFromWishlist)

export default router
