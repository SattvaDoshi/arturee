import env from '../config/env.js'

/**
 * DRM Provider Abstraction Layer
 * ─────────────────────────────
 * Reads DRM_PROVIDER env var and returns the correct configuration
 * for MediaConvert SPEKE encryption.
 *
 * Supported values:
 *   none     — No DRM, clear HLS (development / current default)
 *   pallycon — PallyCon SPEKE endpoint
 *   axinom   — Axinom SPEKE endpoint
 *   ezdrm    — EZDRM SPEKE endpoint
 *
 * To add a new provider in the future:
 *   1. Add a new case to buildSpekeConfig()
 *   2. Add the required env vars to env.js and .env.example
 *   3. No other code changes required — MediaConvert service reads from this module
 */

const SUPPORTED_PROVIDERS = ['none', 'pallycon', 'axinom', 'ezdrm']

/**
 * Returns true if DRM is active (provider !== 'none').
 */
export const isDrmEnabled = () => {
  return env.drmProvider !== 'none'
}

/**
 * Build the SPEKE configuration block for a MediaConvert job.
 * Returns null when DRM_PROVIDER=none (clear HLS).
 *
 * @param {string} contentId — unique ID for the content (typically videoId)
 * @returns {object|null}
 */
export const buildSpekeConfig = (contentId) => {
  const provider = env.drmProvider || 'none'

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    throw new Error(`Unsupported DRM provider: ${provider}`)
  }

  if (provider === 'none') {
    return null // MediaConvert job will produce clear HLS
  }

  // ── PallyCon ─────────────────────────────────────────────────────────────
  if (provider === 'pallycon') {
    return {
      SpekeKeyProviderId: contentId,
      Url: env.drmSpekeUrl,         // PALLYCON_SPEKE_URL
      Headers: [
        { Name: 'x-pallycon-customdata', Value: env.drmSpekeToken },
      ],
      SystemIds: [
        '81376844-f976-481e-a84e-cc25d39b0b33', // Widevine
        '9a04f079-9840-4286-ab92-e65be0885f95', // PlayReady
        '94ce86fb-07ff-4f43-adb8-93d2fa968ca2', // FairPlay
      ],
    }
  }

  // ── Axinom ───────────────────────────────────────────────────────────────
  if (provider === 'axinom') {
    return {
      SpekeKeyProviderId: contentId,
      Url: env.drmSpekeUrl,         // AXINOM_SPEKE_URL
      Headers: [
        { Name: 'X-Axinom-Authorization', Value: env.drmSpekeToken },
      ],
      SystemIds: [
        '81376844-f976-481e-a84e-cc25d39b0b33',
        '9a04f079-9840-4286-ab92-e65be0885f95',
        '94ce86fb-07ff-4f43-adb8-93d2fa968ca2',
      ],
    }
  }

  // ── EZDRM ────────────────────────────────────────────────────────────────
  if (provider === 'ezdrm') {
    return {
      SpekeKeyProviderId: contentId,
      Url: env.drmSpekeUrl,         // EZDRM_SPEKE_URL
      Headers: [
        { Name: 'authorization', Value: `Basic ${env.drmSpekeToken}` },
      ],
      SystemIds: [
        '81376844-f976-481e-a84e-cc25d39b0b33',
        '9a04f079-9840-4286-ab92-e65be0885f95',
        '94ce86fb-07ff-4f43-adb8-93d2fa968ca2',
      ],
    }
  }

  return null
}

/**
 * Build the DRM license proxy URL that the player should use to acquire keys.
 * When DRM_PROVIDER=none this returns null.
 *
 * In production the player sends license requests to /api/drm/license,
 * which this backend proxies to the DRM provider so credentials stay server-side.
 *
 * @param {string} videoId
 * @param {'widevine'|'fairplay'|'playready'} drmType
 */
export const buildLicenseProxyUrl = (videoId, drmType) => {
  if (!isDrmEnabled()) return null
  // The proxy endpoint is on your own backend — never expose the provider URL to clients
  return `/api/drm/license/${drmType}/${videoId}`
}

export default {
  isDrmEnabled,
  buildSpekeConfig,
  buildLicenseProxyUrl,
}
