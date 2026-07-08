import asyncHandler from '../utils/asyncHandler.js'
import User from '../models/User.js'
import Video from '../models/Video.js'
import ApiError from '../utils/ApiError.js'

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'title thumbnailUrl price currency durationSeconds status isPublished viewCount createdAt')
  res.status(200).json({ success: true, data: user.wishlist || [] })
})

export const addToWishlist = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const video = await Video.findById(videoId)
  if (!video) throw new ApiError(404, 'Video not found.')
  await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: videoId } })
  res.status(200).json({ success: true, message: 'Added to wishlist.' })
})

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: videoId } })
  res.status(200).json({ success: true, message: 'Removed from wishlist.' })
})
