import mongoose from 'mongoose'

/**
 * VideoAsset — stores S3 keys and CloudFront paths for processed HLS outputs.
 * One document per video. Created/updated when MediaConvert job completes.
 */
const videoAssetSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      unique: true,
    },

    // Original upload
    originalS3Key: {
      type: String,
      required: true,
    },

    // Processed HLS outputs — S3 keys (never exposed publicly)
    hls720pS3Key: {
      type: String,
      default: null, // e.g. processed/{videoId}/720p/index.m3u8
    },
    hls1080pS3Key: {
      type: String,
      default: null, // e.g. processed/{videoId}/1080p/index.m3u8
    },

    // CloudFront base paths (used to build signed URLs)
    hls720pCloudFrontPath: {
      type: String,
      default: null, // e.g. /processed/{videoId}/720p/index.m3u8
    },
    hls1080pCloudFrontPath: {
      type: String,
      default: null, // e.g. /processed/{videoId}/1080p/index.m3u8
    },

    // DRM content key ID (future use — set when DRM provider is configured)
    drmContentId: {
      type: String,
      default: null,
    },
    drmKeyProvider: {
      type: String,
      default: null, // 'pallycon' | 'axinom' | 'ezdrm' | null
    },

    processingCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// NOTE: videoId index is created automatically by unique:true above

const VideoAsset = mongoose.model('VideoAsset', videoAssetSchema)
export default VideoAsset
