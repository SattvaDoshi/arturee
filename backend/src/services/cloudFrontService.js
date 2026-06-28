import { getSignedUrl } from '@aws-sdk/cloudfront-signer'
import { createHash, randomUUID } from 'crypto'
import awsConfig from '../config/awsConfig.js'
import { logCloudFrontError } from './cloudWatchService.js'

const { domain, keyPairId, privateKey, signedUrlTtlSeconds } = awsConfig.cloudFront

/**
 * Generate a CloudFront Signed URL for an HLS manifest.
 *
 * The URL expires in `signedUrlTtlSeconds` (5 minutes by default).
 * The private key is read from the environment — it should be the PEM content
 * of the CloudFront RSA key pair, with newlines escaped as \n in the .env file.
 *
 * @param {string} cloudFrontPath   e.g. /processed/videoId/720p/-720p.m3u8
 * @param {number} ttlSeconds       override default TTL (optional)
 * @returns {{ signedUrl: string, expiresAt: Date }}
 */
export const generateSignedUrl = (cloudFrontPath, ttlSeconds = signedUrlTtlSeconds) => {
  try {
    // Normalise line endings in private key (env vars often have \n as literal string)
    const pem = privateKey.replace(/\\n/g, '\n')

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000)

    const url = `https://${domain}${cloudFrontPath}`

    const signedUrl = getSignedUrl({
      url,
      keyPairId,
      dateLessThan: expiresAt.toISOString(),
      privateKey: pem,
    })

    return { signedUrl, expiresAt }
  } catch (err) {
    logCloudFrontError('system', err)
    throw err
  }
}

/**
 * Generate a CloudFront Signed URL for an HLS segment wildcard policy.
 * This allows the player to fetch any segment under the same path prefix
 * without requiring a separate signed URL per .ts file.
 *
 * Uses a custom policy to apply a wildcard on the prefix.
 *
 * @param {string} pathPrefix   e.g. /processed/videoId/720p/*
 * @param {number} ttlSeconds
 * @returns {{ signedUrl: string, expiresAt: Date }}
 */
export const generateSignedPolicy = (pathPrefix, ttlSeconds = signedUrlTtlSeconds) => {
  try {
    const pem = privateKey.replace(/\\n/g, '\n')
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000)
    const epoch = Math.floor(expiresAt.getTime() / 1000)

    const resourceUrl = `https://${domain}${pathPrefix}`

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

    const signedUrl = getSignedUrl({
      url: resourceUrl,
      keyPairId,
      dateLessThan: expiresAt.toISOString(),
      privateKey: pem,
      policy,
    })

    return { signedUrl, expiresAt }
  } catch (err) {
    logCloudFrontError('system', err)
    throw err
  }
}

/**
 * Derive the CloudFront base URL for a given HLS path.
 */
export const buildCdnUrl = (cloudFrontPath) => `https://${domain}${cloudFrontPath}`
