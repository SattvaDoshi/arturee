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

// PUT /api/admin/videos/featured
// Body: { featuredVideos: [{ videoId: '...', featuredOrder: 1 }, ...] }
export const updateFeaturedVideos = asyncHandler(async (req, res) => {
  const { featuredVideos } = req.body
  
  if (!Array.isArray(featuredVideos)) {
    throw new ApiError(400, 'featuredVideos must be an array')
  }

  // 1. Reset all videos to not featured
  await Video.updateMany({}, { $set: { featured: false, featuredOrder: 0 } })

  // 2. Set the featured flag and order for the selected ones
  const bulkOps = featuredVideos.map((item) => ({
    updateOne: {
      filter: { _id: item.videoId },
      update: { $set: { featured: true, featuredOrder: item.featuredOrder } }
    }
  }))

  if (bulkOps.length > 0) {
    await Video.bulkWrite(bulkOps)
  }

  res.status(200).json({ success: true, message: 'Featured videos updated.' })
})

// GET /api/admin/revenue
// Returns total revenue, monthly/daily trends, and per-video breakdown
export const getRevenueStats = asyncHandler(async (req, res) => {
  const now = new Date()
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const thirtyDaysAgo   = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 29)

  const [
    totalRevenue,
    totalPurchases,
    monthlyTrend,
    dailyTrend,
    topVideosByRevenue,
    topVideosByPurchases,
    recentPurchases,
  ] = await Promise.all([

    // Lifetime totals
    Purchase.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amountPaise' }, count: { $sum: 1 } } },
    ]),

    // Total purchases count
    Purchase.countDocuments({ status: 'completed' }),

    // Monthly revenue for the last 12 months
    Purchase.aggregate([
      { $match: { status: 'completed', completedAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$completedAt' }, month: { $month: '$completedAt' } },
          revenue: { $sum: '$amountPaise' },
          purchases: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Daily revenue for the last 30 days
    Purchase.aggregate([
      { $match: { status: 'completed', completedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { year: { $year: '$completedAt' }, month: { $month: '$completedAt' }, day: { $dayOfMonth: '$completedAt' } },
          revenue: { $sum: '$amountPaise' },
          purchases: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),

    // Top 15 videos by revenue
    Purchase.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$videoId',
          revenue: { $sum: '$amountPaise' },
          purchases: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 15 },
      {
        $lookup: {
          from: 'videos',
          localField: '_id',
          foreignField: '_id',
          as: 'video',
        },
      },
      { $unwind: '$video' },
      {
        $project: {
          _id: 0,
          videoId: '$_id',
          title: '$video.title',
          thumbnailUrl: '$video.thumbnailUrl',
          category: '$video.category',
          price: '$video.price',
          viewCount: '$video.viewCount',
          revenue: 1,
          purchases: 1,
        },
      },
    ]),

    // Top 10 by purchase count
    Purchase.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$videoId', purchases: { $sum: 1 }, revenue: { $sum: '$amountPaise' } } },
      { $sort: { purchases: -1 } },
      { $limit: 10 },
      {
        $lookup: { from: 'videos', localField: '_id', foreignField: '_id', as: 'video' },
      },
      { $unwind: '$video' },
      {
        $project: {
          _id: 0, videoId: '$_id',
          title: '$video.title',
          thumbnailUrl: '$video.thumbnailUrl',
          category: '$video.category',
          price: '$video.price',
          viewCount: '$video.viewCount',
          revenue: 1,
          purchases: 1,
        },
      },
    ]),

    // 10 most recent completed purchases
    Purchase.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .populate('videoId', 'title thumbnailUrl price'),
  ])

  const lifetimeRevenueInr = (totalRevenue[0]?.total || 0) / 100

  res.status(200).json({
    success: true,
    data: {
      lifetimeRevenueInr,
      totalPurchases,
      monthlyTrend,
      dailyTrend,
      topVideosByRevenue,
      topVideosByPurchases,
      recentPurchases,
    },
  })
})

// POST /api/admin/upload-image
// Uploads an image to Cloudinary and returns the URL
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded')
  }

  // The Cloudinary URL is available in req.file.path
  res.status(200).json({
    success: true,
    data: {
      url: req.file.path
    }
  })
})
