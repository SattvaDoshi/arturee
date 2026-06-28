import mongoose from 'mongoose'

/**
 * Video — master record created by admin when uploading a video.
 * VideoAsset holds the actual S3/CloudFront paths; this model holds metadata.
 */
const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    durationSeconds: {
      type: Number,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'draft',         // created but no upload started
        'uploading',     // presigned upload in progress
        'processing',    // MediaConvert job submitted
        'ready',         // processing complete, available for playback
        'failed',        // MediaConvert job failed
        'archived',
      ],
      default: 'draft',
    },
    mediaConvertJobId: {
      type: String,
      default: null,
    },
    mediaConvertJobStatus: {
      type: String,
      default: null,
    },
    // Reference to the processed asset paths
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoAsset',
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    purchaseCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

videoSchema.index({ creatorId: 1 })
videoSchema.index({ status: 1 })
videoSchema.index({ isPublished: 1 })
videoSchema.index({ tags: 1 })

const Video = mongoose.model('Video', videoSchema)
export default Video
