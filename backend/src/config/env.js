import dotenv from 'dotenv'

dotenv.config()

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-env',
  jwtExpiry: process.env.JWT_EXPIRY || '30d',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'no-reply@art.local',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',

  // ── AWS Core ────────────────────────────────────────────────────────────
  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',

  // ── S3 ──────────────────────────────────────────────────────────────────
  s3BucketName: process.env.S3_BUCKET_NAME || '',

  // ── MediaConvert ────────────────────────────────────────────────────────
  mediaConvertEndpoint: process.env.MEDIACONVERT_ENDPOINT || null,
  mediaConvertRole: process.env.MEDIACONVERT_ROLE_ARN || '',
  mediaConvertQueue: process.env.MEDIACONVERT_QUEUE_ARN || '',

  // ── CloudFront ──────────────────────────────────────────────────────────
  cloudFrontDomain: process.env.CLOUDFRONT_DOMAIN || '',
  cloudFrontKeyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID || '',
  // Store the PEM private key with literal \n in the .env file
  cloudFrontPrivateKey: process.env.CLOUDFRONT_PRIVATE_KEY || '',

  // ── Razorpay ────────────────────────────────────────────────────────────
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',

  // ── SNS ─────────────────────────────────────────────────────────────────
  snsMediaConvertTopicArn: process.env.SNS_MEDIACONVERT_TOPIC_ARN || '',
  snsWebhookSecret: process.env.SNS_WEBHOOK_SECRET || '',

  // ── DRM ─────────────────────────────────────────────────────────────────
  // Set to 'none' for clear HLS (current). Set to 'pallycon'|'axinom'|'ezdrm' to enable.
  drmProvider: process.env.DRM_PROVIDER || 'none',
  drmSpekeUrl: process.env.DRM_SPEKE_URL || '',
  drmSpekeToken: process.env.DRM_SPEKE_TOKEN || '',
  drmWidevineLicenseUrl: process.env.DRM_WIDEVINE_LICENSE_URL || '',
  drmFairplayLicenseUrl: process.env.DRM_FAIRPLAY_LICENSE_URL || '',
  drmPlayreadyLicenseUrl: process.env.DRM_PLAYREADY_LICENSE_URL || '',
}

export default env
