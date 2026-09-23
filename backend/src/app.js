import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import authRouter from './routes/authRoutes.js'
import videoRouter from './routes/videoRoutes.js'
import playbackRouter from './routes/playbackRoutes.js'
import purchaseRouter from './routes/purchaseRoutes.js'
import progressRouter from './routes/progressRoutes.js'
import drmRouter from './routes/drmRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import artistRouter from './routes/artistRoutes.js'
import wishlistRouter from './routes/wishlistRoutes.js'
import genreRouter from './routes/genreRoutes.js'
import landingConfigRouter from './routes/landingConfigRoutes.js'

import { errorHandler, notFound } from './middlewares/errorHandler.js'
import { generalLimiter } from './middlewares/rateLimiter.js'
import { mediaConvertWebhookHandler } from './workers/mediaConvertWebhook.js'

const app = express()

// Trust reverse proxy (Nginx / ALB) so express-rate-limit correctly resolves client IPs from X-Forwarded-For
app.set('trust proxy', 1)

// ── Request Logger (MUST be first) ───────────────────────────────────────
app.use(morgan('dev'))

// ── Security headers ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow HLS player to load CDN resources
  contentSecurityPolicy: false,     // Configure separately per environment
}))

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOriginPatterns = [
  /^https?:\/\/localhost(:\d+)?$/,                 // all localhost ports
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,             // all 127.0.0.1 ports
  /^https:\/\/(www\.)?arturee\.com$/,              // arturee.com and www
  /^https:\/\/[a-z0-9-]+\.arturee\.com$/,         // any subdomain (staging etc.)
]

// Also honour explicit CLIENT_URL if set in env (catches custom domains)
const clientUrl = process.env.CLIENT_URL
if (clientUrl) {
  try {
    const { origin } = new URL(clientUrl)
    if (origin && !allowedOriginPatterns.some(r => r.test(origin))) {
      allowedOriginPatterns.push(new RegExp(`^${origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
    }
  } catch { /* ignore malformed CLIENT_URL */ }
}

app.use(cors({
  origin: (origin, callback) => {
    // Non-browser requests (curl, server-to-server) have no origin — allow
    if (!origin) return callback(null, true)
    if (allowedOriginPatterns.some(r => r.test(origin))) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`))
    }
  },
  credentials: true,
  exposedHeaders: ['Set-Cookie'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id'],
  optionsSuccessStatus: 204,
}))
// Explicitly handle all OPTIONS preflight requests before any other middleware
app.options(/(.*)/, cors())

// ── Body parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' })
})

// ── SNS Webhook (no auth — SNS sends from AWS IPs) ────────────────────────
app.post('/api/internal/mediaconvert-webhook', express.text({ type: '*/*' }), mediaConvertWebhookHandler)

// ── Auth ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter)

// ── Streaming & content routes ────────────────────────────────────────────
app.use('/api/videos', generalLimiter, videoRouter)
app.use('/api/playback', playbackRouter)
app.use('/api/purchase', purchaseRouter)
app.use('/api/progress', progressRouter)
app.use('/api/drm', drmRouter)

// ── Admin & utility routes ────────────────────────────────────────────────
app.use('/api/admin', adminRouter)
app.use('/api/artists', artistRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/genres', genreRouter)
app.use('/api/landing-config', landingConfigRouter)

// ── 404 + Error handlers (MUST be last) ──────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app
