import asyncHandler from '../utils/asyncHandler.js'
import ArtistApplication from '../models/ArtistApplication.js'
import ApiError from '../utils/ApiError.js'

// ── Public: Submit Application ──────────────────────────────────────────────

export const submitApplication = asyncHandler(async (req, res) => {
  const { name, phone, whatsapp, email, videoLink } = req.body

  if (!name || !phone || !whatsapp || !email || !videoLink) {
    throw new ApiError(400, 'All fields are required.')
  }

  const application = await ArtistApplication.create({
    name,
    phone,
    whatsapp,
    email,
    videoLink,
  })

  res.status(201).json({
    success: true,
    data: application,
    message: 'Application submitted successfully',
  })
})

// ── Admin: List Applications ────────────────────────────────────────────────

export const getApplications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 10)
  const skip = (page - 1) * limit

  const filter = {}
  if (req.query.status) {
    filter.status = req.query.status
  }

  const [applications, total] = await Promise.all([
    ArtistApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ArtistApplication.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    data: {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
})

// ── Admin: Update Application Status ────────────────────────────────────────

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params
  const { status } = req.body

  if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status.')
  }

  const application = await ArtistApplication.findById(applicationId)
  if (!application) throw new ApiError(404, 'Application not found.')

  application.status = status
  await application.save()

  res.status(200).json({
    success: true,
    data: application,
    message: 'Status updated successfully',
  })
})

// ── Admin: Delete Application ───────────────────────────────────────────────

export const deleteApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params

  const application = await ArtistApplication.findByIdAndDelete(applicationId)
  if (!application) throw new ApiError(404, 'Application not found.')

  res.status(200).json({
    success: true,
    message: 'Application deleted successfully',
  })
})
