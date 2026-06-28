/**
 * MediaConvert Job Poller (Fallback / Manual Trigger)
 * ───────────────────────────────────────────────────
 * This is a fallback poller for jobs that the SNS webhook may have missed
 * (e.g. during server restarts or transient failures).
 *
 * It is NOT a replacement for the SNS webhook — it runs as a background job
 * on a configurable interval and only processes videos stuck in 'processing'
 * state for more than 5 minutes.
 *
 * Usage:
 *   import { startPoller, stopPoller } from './jobs/mediaConvertPoller.js'
 *   startPoller()   // call in index.js after server starts
 *   stopPoller()    // call on graceful shutdown
 */

import { getJobStatus, deriveHlsKeys } from '../services/mediaConvertService.js'
import { logMediaConvertError } from '../services/cloudWatchService.js'
import Video from '../models/Video.js'
import VideoAsset from '../models/VideoAsset.js'

const POLL_INTERVAL_MS = 5 * 60 * 1000     // Check every 5 minutes
const STUCK_THRESHOLD_MS = 5 * 60 * 1000   // Only check jobs older than 5 min

let pollerInterval = null

const pollStuckJobs = async () => {
  const stuckBefore = new Date(Date.now() - STUCK_THRESHOLD_MS)

  const stuckVideos = await Video.find({
    status: 'processing',
    mediaConvertJobId: { $ne: null },
    updatedAt: { $lt: stuckBefore },
  }).limit(20) // Safety limit — process at most 20 at a time

  if (stuckVideos.length === 0) return

  console.log(`[Poller] Checking ${stuckVideos.length} stuck processing jobs...`)

  await Promise.allSettled(
    stuckVideos.map(async (video) => {
      try {
        const jobResult = await getJobStatus(video.mediaConvertJobId)
        const videoId = video._id.toString()

        video.mediaConvertJobStatus = jobResult.status

        if (jobResult.status === 'COMPLETE') {
          const hlsKeys = deriveHlsKeys(videoId)
          video.status = 'ready'

          await VideoAsset.findOneAndUpdate(
            { videoId: video._id },
            {
              $set: {
                ...hlsKeys,
                processingCompletedAt: new Date(),
              },
            },
            { upsert: true }
          )

          const asset = await VideoAsset.findOne({ videoId: video._id })
          if (asset && !video.asset) {
            video.asset = asset._id
          }

          console.log(`[Poller] Video ${videoId} marked ready.`)

        } else if (jobResult.status === 'ERROR' || jobResult.status === 'CANCELED') {
          video.status = 'failed'
          logMediaConvertError(video.mediaConvertJobId, new Error(jobResult.errorMessage || 'Job failed'))
          console.error(`[Poller] Video ${videoId} marked failed. Status: ${jobResult.status}`)
        }
        // PROGRESSING or SUBMITTED — leave as-is

        await video.save()
      } catch (err) {
        console.error(`[Poller] Error checking job for video ${video._id}:`, err.message)
      }
    })
  )
}

export const startPoller = () => {
  if (pollerInterval) return // already running

  console.log('[Poller] MediaConvert fallback poller started.')
  pollerInterval = setInterval(async () => {
    try {
      await pollStuckJobs()
    } catch (err) {
      console.error('[Poller] Unexpected error:', err.message)
    }
  }, POLL_INTERVAL_MS)
}

export const stopPoller = () => {
  if (pollerInterval) {
    clearInterval(pollerInterval)
    pollerInterval = null
    console.log('[Poller] MediaConvert fallback poller stopped.')
  }
}
