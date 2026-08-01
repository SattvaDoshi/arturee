import {
  PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch'
import cloudWatchClient from '../aws/cloudWatchClient.js'
import awsConfig from '../config/awsConfig.js'

const NAMESPACE = awsConfig.cloudWatch.namespace

/**
 * Emit a custom CloudWatch metric.
 * All failures are swallowed so a CloudWatch outage never breaks the main flow.
 *
 * @param {string} metricName  e.g. 'UploadError'
 * @param {number} value       default 1
 * @param {Record<string,string>} dimensions  e.g. { VideoId: '...' }
 */
let warnedCloudWatchIAM = false

export const emitMetric = async (metricName, value = 1, dimensions = {}) => {
  try {
    const dimensionList = Object.entries(dimensions).map(([Name, Value]) => ({
      Name,
      Value: String(Value),
    }))

    await cloudWatchClient.send(
      new PutMetricDataCommand({
        Namespace: NAMESPACE,
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: 'Count',
            Dimensions: dimensionList,
            Timestamp: new Date(),
          },
        ],
      })
    )
  } catch (err) {
    // Non-fatal: log locally but never throw
    const isIAMError =
      err.name === 'AccessDenied' ||
      err.name === 'AccessDeniedException' ||
      err.message?.includes('not authorized') ||
      err.message?.includes('AccessDenied')

    if (isIAMError && !warnedCloudWatchIAM) {
      warnedCloudWatchIAM = true
      console.warn(
        '[CloudWatch] IAM permission missing for PutMetricData (suppressing further CloudWatch metric warnings):',
        err.message
      )
    } else if (!isIAMError) {
      console.error('[CloudWatch] Failed to emit metric', metricName, err.message)
    }
  }
}

// Convenience helpers
export const logUploadError = (videoId, err) =>
  emitMetric('UploadError', 1, { VideoId: videoId, Error: err?.message?.slice(0, 100) || 'unknown' })

export const logMediaConvertError = (jobId, err) =>
  emitMetric('MediaConvertError', 1, { JobId: jobId, Error: err?.message?.slice(0, 100) || 'unknown' })

export const logPlaybackError = (userId, videoId) =>
  emitMetric('PlaybackError', 1, { UserId: userId, VideoId: videoId })

export const logDrmError = (videoId, err) =>
  emitMetric('DRMError', 1, { VideoId: videoId, Error: err?.message?.slice(0, 100) || 'unknown' })

export const logPurchaseError = (userId, videoId, err) =>
  emitMetric('PurchaseError', 1, { UserId: userId, VideoId: videoId, Error: err?.message?.slice(0, 100) || 'unknown' })

export const logCloudFrontError = (userId, err) =>
  emitMetric('CloudFrontError', 1, { UserId: userId, Error: err?.message?.slice(0, 100) || 'unknown' })
