import {
  CreateJobCommand,
  GetJobCommand,
} from '@aws-sdk/client-mediaconvert'
import mediaConvertClient from '../aws/mediaConvertClient.js'
import awsConfig from '../config/awsConfig.js'
import { buildSpekeConfig } from '../drm/drmProvider.js'
import { logMediaConvertError } from './cloudWatchService.js'

const { role, queue } = awsConfig.mediaConvert
const BUCKET = awsConfig.s3.bucket

/**
 * Build the MediaConvert job specification for a video.
 *
 * Outputs:
 *   - 720p  HLS (H.264 / AAC)
 *   - 1080p HLS (H.264 / AAC)
 *
 * Encryption: populated if DRM_PROVIDER != 'none' (via drmProvider abstraction)
 *
 * @param {string} inputS3Key      e.g. uploads/creatorId/videoId/original.mp4
 * @param {string} outputPrefix    e.g. processed/videoId
 * @param {string} videoId         Used as DRM content ID
 */
const buildJobSpec = (inputS3Key, outputPrefix, videoId) => {
  const inputUri = `s3://${BUCKET}/${inputS3Key}`
  const outputBase = `s3://${BUCKET}/${outputPrefix}/`

  // Optional DRM encryption — returns null when DRM_PROVIDER=none
  const speke = buildSpekeConfig(videoId)

  const encryptionBlock = speke
    ? {
        Type: 'SPEKE',
        SpekeKeyProvider: speke,
      }
    : undefined

  const hlsGroupSettings = (subdirectory) => ({
    Destination: `${outputBase}${subdirectory}/`,
    SegmentLength: 6,          // 6-second segments
    MinSegmentLength: 0,
    SegmentControl: 'SEGMENTED_FILES',
    HlsCdnSettings: {
      HlsBasicPutSettings: {
        NumRetries: 3,
        ConnectionRetryInterval: 1,
      },
    },
    ...(encryptionBlock ? { Encryption: encryptionBlock } : {}),
  })

  const videoOutputSettings = (height, bitrateMbps) => ({
    VideoDescription: {
      Width: height === 720 ? 1280 : 1920,
      Height: height,
      CodecSettings: {
        Codec: 'H_264',
        H264Settings: {
          RateControlMode: 'QVBR',
          MaxBitrate: bitrateMbps * 1_000_000,
          QvbrSettings: { QvbrQualityLevel: 7 },
          CodecProfile: 'HIGH',
          CodecLevel: height === 720 ? 'LEVEL_3_1' : 'LEVEL_4',
          FramerateControl: 'INITIALIZE_FROM_SOURCE',
          ParControl: 'INITIALIZE_FROM_SOURCE',
          SceneChangeDetect: 'TRANSITION_DETECTION',
          AdaptiveQuantization: 'HIGH',
          EntropyEncoding: 'CABAC',
          FlickerAdaptiveQuantization: 'ENABLED',
          SpatialAdaptiveQuantization: 'ENABLED',
          TemporalAdaptiveQuantization: 'ENABLED',
        },
      },
    },
    AudioDescriptions: [
      {
        AudioSourceName: 'Audio Selector 1',
        CodecSettings: {
          Codec: 'AAC',
          AacSettings: {
            Bitrate: 96000,
            CodingMode: 'CODING_MODE_2_0',
            SampleRate: 48000,
          },
        },
      },
    ],
  })

  return {
    Role: role,
    Queue: queue,
    Settings: {
      Inputs: [
        {
          FileInput: inputUri,
          AudioSelectors: {
            'Audio Selector 1': { DefaultSelection: 'DEFAULT' },
          },
          VideoSelector: { ColorSpace: 'FOLLOW' },
          TimecodeSource: 'ZEROBASED',
        },
      ],
      OutputGroups: [
        // ── 720p HLS ──────────────────────────────────────────────────────
        {
          Name: '720p-HLS',
          OutputGroupSettings: {
            Type: 'HLS_GROUP_SETTINGS',
            HlsGroupSettings: hlsGroupSettings('720p'),
          },
          Outputs: [
            {
              ...videoOutputSettings(720, 2.5),
              ContainerSettings: { Container: 'M3U8' },
              NameModifier: '-720p',
            },
          ],
        },
        // ── 1080p HLS ─────────────────────────────────────────────────────
        {
          Name: '1080p-HLS',
          OutputGroupSettings: {
            Type: 'HLS_GROUP_SETTINGS',
            HlsGroupSettings: hlsGroupSettings('1080p'),
          },
          Outputs: [
            {
              ...videoOutputSettings(1080, 5),
              ContainerSettings: { Container: 'M3U8' },
              NameModifier: '-1080p',
            },
          ],
        },
      ],
      TimecodeConfig: { Source: 'ZEROBASED' },
    },
    UserMetadata: {
      videoId,
      environment: process.env.NODE_ENV || 'development',
    },
    StatusUpdateInterval: 'SECONDS_60',
    AccelerationSettings: { Mode: 'DISABLED' },
    Priority: 0,
  }
}

/**
 * Create a MediaConvert transcoding job for a video.
 *
 * @param {string} inputS3Key
 * @param {string} outputPrefix   Relative path inside the bucket (no leading slash)
 * @param {string} videoId
 * @returns {{ jobId: string, jobArn: string }}
 */
export const createTranscodeJob = async (inputS3Key, outputPrefix, videoId) => {
  try {
    const spec = buildJobSpec(inputS3Key, outputPrefix, videoId)
    const response = await mediaConvertClient.send(new CreateJobCommand(spec))
    return {
      jobId: response.Job.Id,
      jobArn: response.Job.Arn,
    }
  } catch (err) {
    logMediaConvertError('create-job', err)
    throw err
  }
}

/**
 * Fetch the current status of a MediaConvert job.
 *
 * @param {string} jobId
 * @returns {{ status: string, jobId: string, errorMessage?: string }}
 */
export const getJobStatus = async (jobId) => {
  try {
    const response = await mediaConvertClient.send(
      new GetJobCommand({ Id: jobId })
    )
    return {
      status: response.Job.Status,           // SUBMITTED | PROGRESSING | COMPLETE | ERROR | CANCELED
      jobId: response.Job.Id,
      errorMessage: response.Job.ErrorMessage || null,
    }
  } catch (err) {
    logMediaConvertError(jobId, err)
    throw err
  }
}

/**
 * Derive the HLS manifest S3 keys from the output prefix.
 * These match the destinations configured in buildJobSpec().
 *
 * @param {string} videoId
 */
export const deriveHlsKeys = (videoId) => {
  const prefix = `processed/${videoId}`
  return {
    hls720pS3Key: `${prefix}/720p/-720p.m3u8`,
    hls1080pS3Key: `${prefix}/1080p/-1080p.m3u8`,
    hls720pCloudFrontPath: `/processed/${videoId}/720p/-720p.m3u8`,
    hls1080pCloudFrontPath: `/processed/${videoId}/1080p/-1080p.m3u8`,
  }
}
