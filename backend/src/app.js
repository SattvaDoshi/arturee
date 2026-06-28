import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRouter from './routes/authRoutes.js'
import videoRouter from './routes/videoRoutes.js'
import playbackRouter from './routes/playbackRoutes.js'
import purchaseRouter from './routes/purchaseRoutes.js'
import progressRouter from './routes/progressRoutes.js'
import drmRouter from './routes/drmRoutes.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'
import { generalLimiter } from './middlewares/rateLimiter.js'
import { mediaConvertWebhookHandler } from './workers/mediaConvertWebhook.js'

const app = express()

// ── Security headers ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow HLS player to load CDN resources
  contentSecurityPolicy: false,     // Configure separately per environment
}))

// ── CORS ──────────────────────────────────────────────────────────────
app.use(cors())

// ── Body parsers ──────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' })
})

// ── SNS Webhook (no auth — SNS sends from AWS IPs) ───────────────────────
app.post('/api/internal/mediaconvert-webhook', express.text({ type: '*/*' }), mediaConvertWebhookHandler)

// ── Existing routes (untouched) ────────────────────────────────────────
app.use('/api/auth', authRouter)

// ── New streaming routes ─────────────────────────────────────────────────
app.use('/api/videos', generalLimiter, videoRouter)
app.use('/api/playback', playbackRouter)
app.use('/api/purchase', purchaseRouter)
app.use('/api/progress', progressRouter)
app.use('/api/drm', drmRouter)

// ── Error handlers ──────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app
