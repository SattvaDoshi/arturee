import asyncHandler from '../utils/asyncHandler.js'
import Artist from '../models/Artist.js'
import ApiError from '../utils/ApiError.js'

export const listArtists = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 12)
  const skip = (page - 1) * limit
  const [artists, total] = await Promise.all([
    Artist.find({ isActive: true }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Artist.countDocuments({ isActive: true }),
  ])
  res.status(200).json({ success: true, data: { artists, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } })
})

export const getArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.params.artistId)
  if (!artist || !artist.isActive) throw new ApiError(404, 'Artist not found.')
  res.status(200).json({ success: true, data: artist })
})

export const createArtist = asyncHandler(async (req, res) => {
  const { name, bio, avatarUrl, genre, socialLinks, isVerified } = req.body
  if (!name) throw new ApiError(400, 'name is required.')
  const artist = await Artist.create({ name, bio, avatarUrl, genre, socialLinks, isVerified })
  res.status(201).json({ success: true, data: artist })
})

export const updateArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.params.artistId)
  if (!artist) throw new ApiError(404, 'Artist not found.')
  const allowed = ['name', 'bio', 'avatarUrl', 'genre', 'socialLinks', 'isVerified', 'isActive']
  allowed.forEach(f => { if (req.body[f] !== undefined) artist[f] = req.body[f] })
  await artist.save()
  res.status(200).json({ success: true, data: artist })
})

export const deleteArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.params.artistId)
  if (!artist) throw new ApiError(404, 'Artist not found.')
  artist.isActive = false
  await artist.save()
  res.status(200).json({ success: true, message: 'Artist deactivated.' })
})
