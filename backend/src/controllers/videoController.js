import asyncHandler from '../utils/asyncHandler.js'
import {
  initiateMultipartUpload,
  getPresignedPartUrls,
  completeMultipartUpload,
  abortMultipartUpload,
  buildOriginalKey,
  buildProcessedPrefix,
} from '../services/s3Service.js'
import { createTranscodeJob, getJobStatus, deriveHlsKeys } from '../services/mediaConvertService.js'
import { logUploadError, logMediaConvertError } from '../services/cloudWatchService.js'
import Video from '../models/Video.js'
import VideoAsset from '../models/VideoAsset.js'
import ApiError from '../utils/ApiError.js'
import mongoose from 'mongoose'

// ── Admin: Create video record + initiate multipart upload ────────────────────

/**
 * POST /api/videos/upload/initiate
 *
 * Body: { title, description, price, currency, totalParts, fileSize, contentType, tags, category }
 *
 * Returns: { videoId, uploadId, presignedUrls[], s3Key }
 *
 * The frontend uses the presignedUrls to PUT each part directly to S3.
 * After all parts are uploaded, call /upload/complete.
 */
export const initiateUpload = asyncHandler(async (req, res) => {
  const {
    title,
    description = '',
    price,
    currency = 'INR',
    totalParts,
    contentType = 'video/mp4',
    tags = [],
    category = null,
  } = req.body

  if (!title || price === undefined || !totalParts) {
    throw new ApiError(400, 'title, price, and totalParts are required.')
  }

  if (totalParts < 1 || totalParts > 10000) {
    throw new ApiError(400, 'totalParts must be between 1 and 10000.')
  }

  const creatorId = req.user._id

  // Create the video record in draft state
  const video = await Video.create({
    title,
    description,
    price,
    currency,
    creatorId,
    tags,
    category,
    status: 'uploading',
  })

  const videoId = video._id.toString()
  const s3Key = buildOriginalKey(creatorId.toString(), videoId)

  try {
    // Initiate multipart upload on S3
    const uploadId = await initiateMultipartUpload(s3Key, contentType)

    // Generate presigned URLs for all parts (each expires in 2 hours)
    const presignedUrls = await getPresignedPartUrls(s3Key, uploadId, totalParts, 7200)

    // Create VideoAsset record with the original key
    await VideoAsset.create({
      videoId: video._id,
      originalS3Key: s3Key,
    })

    res.status(200).json({
      success: true,
      data: {
        videoId,
        uploadId,
        s3Key,
        presignedUrls, // array indexed 0..totalParts-1, each corresponds to part number i+1
      },
    })
  } catch (err) {
    // Clean up the draft video record on failure
    await Video.deleteOne({ _id: video._id })
    logUploadError(videoId, err)
    throw err
  }
})

// ── Admin: Complete multipart upload + trigger MediaConvert ───────────────────

/**
 * POST /api/videos/upload/complete
 *
 * Body: { videoId, uploadId, s3Key, parts: [{PartNumber, ETag}], durationSeconds }
 *
 * Returns: { videoId, mediaConvertJobId, status }
 */
export const completeUpload = asyncHandler(async (req, res) => {
  const { videoId, uploadId, s3Key, parts, durationSeconds } = req.body

  if (!videoId || !uploadId || !s3Key || !parts?.length) {
    throw new ApiError(400, 'videoId, uploadId, s3Key, and parts are required.')
  }

  const video = await Video.findById(videoId)
  if (!video) throw new ApiError(404, 'Video not found.')
  if (video.creatorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorised to complete this upload.')
  }

  // Complete the multipart upload on S3
  await completeMultipartUpload(s3Key, uploadId, parts)

  // Update video duration if provided
  if (durationSeconds) {
    video.durationSeconds = durationSeconds
  }

  // Build output prefix for MediaConvert
  const outputPrefix = buildProcessedPrefix(videoId)

  // Try to trigger transcoding — skip if MediaConvert is not configured
  try {
    const { jobId } = await createTranscodeJob(s3Key, outputPrefix, videoId)
    video.mediaConvertJobId = jobId
    video.status = 'processing'
  } catch (transcodeErr) {
    console.warn('[MediaConvert] Skipped transcoding (not configured or error):', transcodeErr.message)
    // Leave status as 'uploading' — admin can manually publish
  }
  await video.save()

  res.status(200).json({
    success: true,
    data: {
      videoId,
      mediaConvertJobId: video.mediaConvertJobId ?? null,
      status: video.status,
      message: 'Video uploaded. Transcoding job created if MediaConvert is configured.',
    },
  })
})

// ── Admin: Abort multipart upload ─────────────────────────────────────────────

/**
 * POST /api/videos/upload/abort
 * Body: { videoId, uploadId, s3Key }
 */
export const abortUpload = asyncHandler(async (req, res) => {
  const { videoId, uploadId, s3Key } = req.body

  if (!videoId || !uploadId || !s3Key) {
    throw new ApiError(400, 'videoId, uploadId, and s3Key are required.')
  }

  await abortMultipartUpload(s3Key, uploadId)
  await Video.findByIdAndDelete(videoId)
  await VideoAsset.deleteOne({ videoId })

  res.status(200).json({ success: true, message: 'Upload aborted and records cleaned up.' })
})

// ── Admin: Get MediaConvert job status ────────────────────────────────────────

/**
 * GET /api/videos/:videoId/job-status
 */
export const getMediaConvertStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  const video = await Video.findById(videoId).select('mediaConvertJobId status mediaConvertJobStatus')
  if (!video) throw new ApiError(404, 'Video not found.')

  if (!video.mediaConvertJobId) {
    return res.status(200).json({
      success: true,
      data: { status: video.status, mediaConvertJobId: null },
    })
  }

  const job = await getJobStatus(video.mediaConvertJobId)

  res.status(200).json({
    success: true,
    data: {
      videoId,
      mediaConvertJobId: job.jobId,
      status: job.status,
      errorMessage: job.errorMessage,
    },
  })
})

// ── Admin: Update video metadata ──────────────────────────────────────────────

/**
 * PATCH /api/videos/:videoId
 * Body: { title, description, price, isPublished, tags, category, thumbnailUrl }
 */
export const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const video = await Video.findById(videoId)
  if (!video) throw new ApiError(404, 'Video not found.')

  const allowedFields = ['title', 'description', 'price', 'isPublished', 'tags', 'category', 'thumbnailUrl']
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      video[field] = req.body[field]
    }
  })

  await video.save()
  res.status(200).json({ success: true, data: video })
})

// ── Public: Get video details ─────────────────────────────────────────────────

/**
 * GET /api/videos/:videoId
 * Returns public metadata — no S3 keys or signed URLs.
 */
export const getVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  const video = await Video.findById(videoId)
    .select('-mediaConvertJobId -mediaConvertJobStatus -asset')
    .populate('creatorId', 'name email')

  if (!video || !video.isPublished) {
    throw new ApiError(404, 'Video not found.')
  }

  res.status(200).json({ success: true, data: video })
})

// ── Public: List all published videos ────────────────────────────────────────

/**
 * GET /api/videos
 * Query: page, limit, category, tags
 */
export const listVideos = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 12)
  const skip = (page - 1) * limit

  const filter = { isPublished: true, status: 'ready' }
  if (req.query.category) filter.category = req.query.category
  if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') }
  if (req.query.featured === 'true') filter.featured = true
  if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' }

  const sortBy = req.query.sort === 'popular'
    ? { viewCount: -1 }
    : { createdAt: -1 }

  const [videos, total] = await Promise.all([
    Video.find(filter)
      .select('title description thumbnailUrl price currency durationSeconds tags category viewCount createdAt featured artistId')
      .populate('artistId', 'name avatarUrl')
      .sort(sortBy)
      .skip(skip)
      .limit(limit),
    Video.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    data: {
      videos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  })
})

// ── Admin: Delete video ───────────────────────────────────────────────────────

/**
 * DELETE /api/videos/:videoId
 */
export const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const video = await Video.findById(videoId)
  if (!video) throw new ApiError(404, 'Video not found.')

  video.status = 'archived'
  video.isPublished = false
  await video.save()

  res.status(200).json({ success: true, message: 'Video archived successfully.' })
})

// ── Admin: Manually publish a video (bypass MediaConvert) ─────────────────────
/**
 * PATCH /api/videos/:videoId/publish
 * Body: { thumbnailUrl? }
 * Marks video as ready + published (for when MediaConvert is not configured)
 */
export const manuallyPublishVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const video = await Video.findById(videoId)
  if (!video) throw new ApiError(404, 'Video not found.')

  video.status = 'ready'
  video.isPublished = true
  if (req.body.thumbnailUrl) video.thumbnailUrl = req.body.thumbnailUrl
  if (req.body.featured !== undefined) video.featured = req.body.featured
  if (req.body.artistId !== undefined) video.artistId = req.body.artistId

  await video.save()
  res.status(200).json({ success: true, data: video })
})

