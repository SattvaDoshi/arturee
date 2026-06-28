import ApiError from '../utils/ApiError.js'

/**
 * DRM License Proxy Service
 * ─────────────────────────
 * When DRM is enabled, this service proxies license acquisition requests
 * from the player to the DRM provider. This keeps provider credentials
 * server-side and allows you to enforce access control on license requests.
 *
 * Currently returns a 501 stub because DRM_PROVIDER=none.
 * When you configure a real provider, replace the provider-specific sections below.
 */

/**
 * Proxy a Widevine license request to the configured DRM provider.
 *
 * @param {string}  videoId
 * @param {Buffer}  licenseRequest   Raw bytes from the EME API
 * @param {string}  userId           For access control / audit
 * @returns {Buffer}  Raw license response bytes
 */
export const proxyWidevineLicense = async (videoId, licenseRequest, userId) => {
  const provider = process.env.DRM_PROVIDER || 'none'

  if (provider === 'none') {
    throw new ApiError(501, 'DRM is not enabled on this server.')
  }

  // ── PallyCon ─────────────────────────────────────────────────────────────
  if (provider === 'pallycon') {
    const { default: fetch } = await import('node-fetch')
    const res = await fetch(process.env.DRM_WIDEVINE_LICENSE_URL, {
      method: 'POST',
      headers: {
        'x-pallycon-customdata': process.env.DRM_SPEKE_TOKEN,
        'Content-Type': 'application/octet-stream',
      },
      body: licenseRequest,
    })
    if (!res.ok) throw new ApiError(502, 'License server error')
    return Buffer.from(await res.arrayBuffer())
  }

  // ── Axinom ───────────────────────────────────────────────────────────────
  if (provider === 'axinom') {
    const { default: fetch } = await import('node-fetch')
    const res = await fetch(process.env.DRM_WIDEVINE_LICENSE_URL, {
      method: 'POST',
      headers: {
        'X-Axinom-Authorization': process.env.DRM_SPEKE_TOKEN,
        'Content-Type': 'application/octet-stream',
      },
      body: licenseRequest,
    })
    if (!res.ok) throw new ApiError(502, 'License server error')
    return Buffer.from(await res.arrayBuffer())
  }

  // ── EZDRM ────────────────────────────────────────────────────────────────
  if (provider === 'ezdrm') {
    const { default: fetch } = await import('node-fetch')
    const res = await fetch(process.env.DRM_WIDEVINE_LICENSE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${process.env.DRM_SPEKE_TOKEN}`,
        'Content-Type': 'application/octet-stream',
      },
      body: licenseRequest,
    })
    if (!res.ok) throw new ApiError(502, 'License server error')
    return Buffer.from(await res.arrayBuffer())
  }

  throw new ApiError(500, `Unsupported DRM provider: ${provider}`)
}

/**
 * Proxy a FairPlay license request.
 * Structure mirrors Widevine — adjust headers per provider documentation.
 */
export const proxyFairPlayLicense = async (videoId, licenseRequest, userId) => {
  const provider = process.env.DRM_PROVIDER || 'none'
  if (provider === 'none') {
    throw new ApiError(501, 'DRM is not enabled on this server.')
  }
  // FairPlay-specific proxy logic goes here — same pattern as Widevine above
  throw new ApiError(501, 'FairPlay proxy not yet implemented.')
}

/**
 * Proxy a PlayReady license request.
 */
export const proxyPlayReadyLicense = async (videoId, licenseRequest, userId) => {
  const provider = process.env.DRM_PROVIDER || 'none'
  if (provider === 'none') {
    throw new ApiError(501, 'DRM is not enabled on this server.')
  }
  throw new ApiError(501, 'PlayReady proxy not yet implemented.')
}
