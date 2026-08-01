import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'
import s3Client from '../aws/s3Client.js'
import awsConfig from '../config/awsConfig.js'
import { logUploadError } from './cloudWatchService.js'

const BUCKET = awsConfig.s3.bucket

// ── Presigned Multipart Upload ────────────────────────────────────────────────

/**
 * Step 1: Initiate a multipart upload and return the UploadId.
 * Called by the admin before the frontend starts sending parts.
 *
 * @param {string} s3Key          Full S3 key, e.g. uploads/creatorId/videoId/original.mp4
 * @param {string} contentType    MIME type, e.g. video/mp4
 */
export const initiateMultipartUpload = async (s3Key, contentType = 'video/mp4') => {
  const cmd = new CreateMultipartUploadCommand({
    Bucket: BUCKET,
    Key: s3Key,
    ContentType: contentType,
    // Prevent public access
    ACL: 'private',
    // Server-side encryption at rest
    ServerSideEncryption: 'AES256',
    // Prevent caching of private content
    CacheControl: 'no-cache, no-store',
    // Prevent browsers from sniffing MIME types
    ContentDisposition: 'attachment',
  })

  const response = await s3Client.send(cmd)
  return response.UploadId
}

/**
 * Step 2: Generate a presigned URL for a single part.
 * The frontend uses these URLs to PUT each part directly to S3.
 *
 * @param {string} s3Key
 * @param {string} uploadId
 * @param {number} partNumber   1-based
 * @param {number} expiresIn    seconds (default 1 hour)
 */
export const getPresignedPartUrl = async (s3Key, uploadId, partNumber, expiresIn = 3600) => {
  const cmd = new UploadPartCommand({
    Bucket: BUCKET,
    Key: s3Key,
    UploadId: uploadId,
    PartNumber: partNumber,
  })

  const url = await getSignedUrl(s3Client, cmd, { expiresIn })
  return url
}

/**
 * Generate presigned URLs for all parts at once (batch).
 * Frontend splits the file into chunks of chunkSizeMB and uploads in parallel.
 *
 * @param {string}  s3Key
 * @param {string}  uploadId
 * @param {number}  totalParts   Number of parts required
 * @param {number}  expiresIn    seconds
 */
export const getPresignedPartUrls = async (s3Key, uploadId, totalParts, expiresIn = 3600) => {
  const urls = await Promise.all(
    Array.from({ length: totalParts }, (_, i) =>
      getPresignedPartUrl(s3Key, uploadId, i + 1, expiresIn)
    )
  )
  return urls // index 0 = part 1
}

/**
 * Step 3: Complete the multipart upload.
 * Called by the backend after the frontend signals all parts are uploaded.
 *
 * @param {string} s3Key
 * @param {string} uploadId
 * @param {Array<{PartNumber: number, ETag: string}>} parts
 */
export const completeMultipartUpload = async (s3Key, uploadId, parts) => {
  const cmd = new CompleteMultipartUploadCommand({
    Bucket: BUCKET,
    Key: s3Key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
    },
  })

  const response = await s3Client.send(cmd)
  return response // contains Location, ETag, Key, Bucket
}

/**
 * Abort a multipart upload — cleans up incomplete parts to avoid storage charges.
 */
export const abortMultipartUpload = async (s3Key, uploadId) => {
  try {
    await s3Client.send(
      new AbortMultipartUploadCommand({
        Bucket: BUCKET,
        Key: s3Key,
        UploadId: uploadId,
      })
    )
  } catch (err) {
    logUploadError(s3Key, err)
    console.error('[S3] Failed to abort multipart upload', err.message)
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

/**
 * Build the canonical S3 key for an original video upload.
 */
export const buildOriginalKey = (creatorId, videoId) =>
  `${awsConfig.s3.uploadPrefix}/${creatorId}/${videoId}/original.mp4`

/**
 * Build the S3 key prefix for processed outputs.
 */
export const buildProcessedPrefix = (videoId) =>
  `${awsConfig.s3.processedPrefix}/${videoId}`

/**
 * Delete a single S3 object.
 */
export const deleteObject = async (s3Key) => {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: s3Key })
  )
}

/**
 * Check whether an S3 object exists (without downloading it).
 * Returns true / false.
 */
export const objectExists = async (s3Key) => {
  try {
    await s3Client.send(
      new HeadObjectCommand({ Bucket: BUCKET, Key: s3Key })
    )
    return true
  } catch {
    return false
  }
}

/**
 * Upload a file buffer directly to S3 from the backend.
 * Used by the proxy upload endpoint to bypass CORS.
 *
 * @param {string} s3Key
 * @param {Buffer} buffer
 * @param {string} contentType
 */
export const uploadFileBuffer = async (s3Key, buffer, contentType = 'video/mp4') => {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
      CacheControl: 'no-cache, no-store',
      ContentDisposition: 'attachment',
    },
    queueSize: 4, // Concurrent upload streams
    partSize: 5 * 1024 * 1024, // 5 MB chunk size to prevent ENOBUFS socket overflow
    leavePartsOnError: false,
  })

  const response = await upload.done()
  return response
}
