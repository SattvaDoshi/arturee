import { UAParser } from 'ua-parser-js'

/**
 * Detect whether the incoming request is from a mobile device.
 * Returns 'mobile' or 'desktop'.
 * Used to decide which HLS quality to serve (720p vs 1080p).
 */
export const detectDeviceType = (userAgent = '') => {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()
  const deviceType = result.device?.type // 'mobile' | 'tablet' | 'console' | undefined

  // Treat tablets as desktop for higher-quality streaming
  if (deviceType === 'mobile') {
    return 'mobile'
  }
  return 'desktop'
}

/**
 * Maps device type to HLS quality identifier.
 * @param {'mobile'|'desktop'} deviceType
 * @returns {'720p'|'1080p'}
 */
export const resolveQuality = (deviceType) => {
  return deviceType === 'mobile' ? '720p' : '1080p'
}

/**
 * Build a short human-readable device label for audit/logging.
 */
export const buildDeviceLabel = (userAgent = '') => {
  const parser = new UAParser(userAgent)
  const r = parser.getResult()
  const browser = r.browser?.name || 'Unknown Browser'
  const os = r.os?.name || 'Unknown OS'
  return `${browser} on ${os}`
}
