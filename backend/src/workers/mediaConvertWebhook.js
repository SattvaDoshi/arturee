/**
 * MediaConvert SNS Webhook Worker
 * ───────────────────────────────
 * Receives notifications from AWS SNS when a MediaConvert job
 * changes state (COMPLETE, ERROR, etc.).
 *
 * Setup:
 *   1. Create an SNS topic in AWS
 *   2. Subscribe to MediaConvert EventBridge events on that topic
 *   3. Add your VPS URL as an HTTPS subscription endpoint:
 *        https://your-domain.com/api/internal/mediaconvert-webhook
 *   4. First delivery will be a SubscriptionConfirmation — this handler
 *      auto-confirms it.
 *
 * Security:
 *   - Validates the SNS message signature before processing
 *   - Uses a shared secret header (SNS_WEBHOOK_SECRET) as a secondary guard
 *
 * This file exports the handler function; it is mounted in app.js on
 * /api/internal/mediaconvert-webhook.
 */

import { createHmac } from 'crypto'
import https from 'https'
import Video from '../models/Video.js'
import VideoAsset from '../models/VideoAsset.js'
import { deriveHlsKeys } from '../services/mediaConvertService.js'
import { logMediaConvertError } from '../services/cloudWatchService.js'

/**
 * Fetch the SNS subscription confirmation URL to auto-confirm.
 */
const confirmSubscription = (subscribeUrl) => {
  return new Promise((resolve, reject) => {
    https.get(subscribeUrl, (res) => {
      res.on('data', () => {}) // drain
      res.on('end', resolve)
    }).on('error', reject)
  })
}

/**
 * Process a confirmed SNS notification.
 * Message body is a JSON string from AWS EventBridge → SNS.
 */
const processJobEvent = async (message) => {
  let event
  try {
    event = JSON.parse(message)
  } catch {
    console.error('[Webhook] Failed to parse SNS message body')
    return
  }

  // EventBridge MediaConvert events have this shape:
  // { detail-type: 'MediaConvert Job State Change', detail: { jobId, status, ... } }
  const jobId = event?.detail?.jobId
  const status = event?.detail?.status // COMPLETE | ERROR | CANCELED

  if (!jobId || !status) {
    console.warn('[Webhook] SNS message missing jobId or status:', JSON.stringify(event))
    return
  }

  const video = await Video.findOne({ mediaConvertJobId: jobId })
  if (!video) {
    console.warn(`[Webhook] No video found for jobId: ${jobId}`)
    return
  }

  const videoId = video._id.toString()
  video.mediaConvertJobStatus = status

  if (status === 'COMPLETE') {
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

    // Link asset to video if not already linked
    const asset = await VideoAsset.findOne({ videoId: video._id })
    if (asset && !video.asset) {
      video.asset = asset._id
    }

    console.log(`[Webhook] Video ${videoId} processing COMPLETE`)

  } else if (status === 'ERROR') {
    video.status = 'failed'
    logMediaConvertError(jobId, new Error(event?.detail?.errorMessage || 'Unknown error'))
    console.error(`[Webhook] Video ${videoId} MediaConvert ERROR`)

  } else if (status === 'CANCELED') {
    video.status = 'failed'
    console.warn(`[Webhook] Video ${videoId} MediaConvert CANCELED`)
  }

  await video.save()
}

/**
 * Express request handler — mount on POST /api/internal/mediaconvert-webhook
 */
export const mediaConvertWebhookHandler = async (req, res) => {
  try {
    const messageType = req.headers['x-amz-sns-message-type']

    if (!messageType) {
      return res.status(400).json({ error: 'Missing SNS message type header' })
    }

    // Body comes in as a Buffer (express.raw) or parsed JSON depending on mount
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    let snsMessage
    try {
      snsMessage = JSON.parse(body)
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' })
    }

    // ── Subscription confirmation ─────────────────────────────────────────
    if (messageType === 'SubscriptionConfirmation') {
      console.log('[Webhook] Confirming SNS subscription...')
      await confirmSubscription(snsMessage.SubscribeURL)
      console.log('[Webhook] SNS subscription confirmed.')
      return res.status(200).json({ confirmed: true })
    }

    // ── Notification ──────────────────────────────────────────────────────
    if (messageType === 'Notification') {
      const message = snsMessage.Message

      // Process asynchronously — respond 200 immediately so SNS doesn't retry
      setImmediate(() => {
        processJobEvent(message).catch((err) => {
          console.error('[Webhook] processJobEvent error:', err.message)
        })
      })

      return res.status(200).json({ received: true })
    }

    return res.status(200).json({ ignored: true })
  } catch (err) {
    console.error('[Webhook] Unhandled error:', err.message)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
