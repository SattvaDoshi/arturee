import { getSignedUrl } from '@aws-sdk/cloudfront-signer'
import { createPrivateKey } from 'crypto'
import awsConfig from '../config/awsConfig.js'
import { logCloudFrontError } from './cloudWatchService.js'

const { domain, keyPairId, privateKey, signedUrlTtlSeconds } = awsConfig.cloudFront

/**
 * Get and normalise the private key PEM.
 *
 * @aws-sdk/cloudfront-signer requires PKCS#1 format ("BEGIN RSA PRIVATE KEY").
 * If the key in .env is PKCS#8 ("BEGIN PRIVATE KEY") — which is what Node's
 * generateKeyPairSync produces by default — we convert it automatically.
 */
const getPem = () => {
  const raw = privateKey.replace(/\\n/g, '\n')
  if (raw.includes('BEGIN PRIVATE KEY') && !raw.includes('BEGIN RSA PRIVATE KEY')) {
    // Convert PKCS#8 → PKCS#1 so cloudfront-signer can use it
    return createPrivateKey(raw).export({ type: 'pkcs1', format: 'pem' })
  }
  return raw
}

/**
 * Generate a CloudFront Signed URL using a CUSTOM WILDCARD POLICY.
 *
 * Why custom policy + wildcard?
 *  - A canned (simple) signed URL only covers the exact URL it signs.
 *    hls.js fetches the manifest (.m3u8) PLUS dozens of segment (.ts) files.
 *    Each segment is a different URL → all 403.
 *  - A custom policy with a wildcard resource (e.g. /processed/videoId/quality/*)
 *    signs ONE URL but the embedded policy covers EVERY file under that prefix.
 *  - The frontend's hls.js xhrSetup re-appends the same query params
 *    (?Policy=…&Signature=…&Key-Pair-Id=…) to every segment request,
 *    so CloudFront validates them all against the same policy.
 *
 * Why NOT cookies?
 *  - Signed cookies must be set BY the CloudFront domain or a shared parent domain.
 *    In development the API is on localhost — browsers refuse to store cookies
 *    set by localhost for cloudfront.net. This silently drops all cookies → 403.
 *
 * @param {string} cloudFrontPath  e.g. /processed/videoId/720p/original.m3u8
 * @param {number} ttlSeconds      override default TTL
 * @returns {{ signedUrl: string, signingParams: string, expiresAt: Date }}
 *   signedUrl    — the full signed manifest URL (ready to pass to hls.js)
 *   signingParams — the raw query-string "Policy=…&Signature=…&Key-Pair-Id=…"
 *                   that the frontend must append to every segment request
 */
export const generateSignedUrl = (cloudFrontPath, ttlSeconds = signedUrlTtlSeconds) => {
  try {
    const pem = getPem()
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000)
    const epoch = Math.floor(expiresAt.getTime() / 1000)

    // Wildcard prefix: strip the filename, keep the directory, append /*
    // e.g. /processed/abc123/1080p/original.m3u8 → /processed/abc123/1080p/*
    const pathPrefix = cloudFrontPath.replace(/\/[^/]+$/, '')
    const resourceUrl = `https://${domain}${pathPrefix}/*`

    // Custom policy that covers the entire folder
    const policy = JSON.stringify({
      Statement: [
        {
          Resource: resourceUrl,
          Condition: {
            DateLessThan: { 'AWS:EpochTime': epoch },
          },
        },
      ],
    })

    // getSignedUrl with a custom policy generates a URL like:
    // https://domain/path?Policy=<b64>&Signature=<b64>&Key-Pair-Id=<id>
    // We sign the MANIFEST url but with the wildcard policy embedded,
    // so the same params are valid for any URL under the prefix.
    const manifestUrl = `https://${domain}${cloudFrontPath}`
    const signedUrl = getSignedUrl({
      url: manifestUrl,
      keyPairId,
      dateLessThan: expiresAt.toISOString(),
      privateKey: pem,
      policy,
    })

    // Extract just the query params — the frontend appends these to EVERY request
    // (manifest + all segments) via hls.js xhrSetup.
    const signingParams = signedUrl.split('?')[1] || ''

    // Return the PLAIN manifest URL as streamUrl.
    // xhrSetup will add the signingParams to it (and to every segment) uniformly.
    // Do NOT return the signedUrl as streamUrl — xhrSetup would then double-append.
    const plainUrl = manifestUrl

    return { streamUrl: plainUrl, signingParams, expiresAt }
  } catch (err) {
    logCloudFrontError('system', err)
    throw err
  }
}

/**
 * Derive the plain (unsigned) CloudFront URL for a path.
 */
export const buildCdnUrl = (cloudFrontPath) => `https://${domain}${cloudFrontPath}`
