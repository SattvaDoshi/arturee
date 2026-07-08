import asyncHandler from '../utils/asyncHandler.js'
import User from '../models/User.js'
import Video from '../models/Video.js'
import Purchase from '../models/Purchase.js'
import ApiError from '../utils/ApiError.js'

// GET /api/admin/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalVideos, publishedVideos, totalPurchases, revenueResult, recentUsers, recentVideos] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Video.countDocuments(),
    Video.countDocuments({ isPublished: true, status: 'ready' }),
    Purchase.countDocuments({ status: 'completed' }),
    Purchase.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amountPaise' } } }]),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    Video.find().sort({ createdAt: -1 }).limit(5).select('title status isPublished createdAt price viewCount'),
  ])

  const totalRevenueInr = revenueResult.length > 0 ? revenueResult[0].total / 100 : 0

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalVideos,
      publishedVideos,
      totalPurchases,
      totalRevenueInr,
      recentUsers,
      recentVideos,
    },
  })
})

// GET /api/admin/users?page=1&limit=20&search=
export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const skip = (page - 1) * limit
  const search = req.query.search || ''

  const filter = {}
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-password -otpHash -resetPasswordTokenHash').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    data: { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  })
})

// GET /api/admin/users/:userId
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password -otpHash -resetPasswordTokenHash')
  if (!user) throw new ApiError(404, 'User not found.')
  res.status(200).json({ success: true, data: user })
})

// PATCH /api/admin/users/:userId/role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  if (!['user', 'admin'].includes(role)) throw new ApiError(400, 'role must be user or admin.')
  const user = await User.findById(req.params.userId)
  if (!user) throw new ApiError(404, 'User not found.')
  if (user._id.toString() === req.user._id.toString()) throw new ApiError(400, 'Cannot change your own role.')
  user.role = role
  await user.save()
  res.status(200).json({ success: true, data: { _id: user._id, role: user.role } })
})

// DELETE /api/admin/users/:userId
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId)
  if (!user) throw new ApiError(404, 'User not found.')
  if (user._id.toString() === req.user._id.toString()) throw new ApiError(400, 'Cannot delete your own account.')
  await User.deleteOne({ _id: user._id })
  res.status(200).json({ success: true, message: 'User deleted.' })
})

// GET /api/admin/videos?page=1&limit=20
export const listAllVideos = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const skip = (page - 1) * limit

  const [videos, total] = await Promise.all([
    Video.find()
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Video.countDocuments(),
  ])

  res.status(200).json({
    success: true,
    data: { videos, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  })
})
