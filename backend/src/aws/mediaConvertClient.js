import { MediaConvertClient } from '@aws-sdk/client-mediaconvert'
import awsConfig from '../config/awsConfig.js'

// MediaConvert requires a per-account endpoint, not the regional default
// If endpoint is not configured, export a null client (upload will work but transcoding will be skipped)
let mediaConvertClient = null

if (awsConfig.mediaConvert.endpoint) {
  mediaConvertClient = new MediaConvertClient({
    region: awsConfig.region,
    credentials: awsConfig.credentials,
    endpoint: awsConfig.mediaConvert.endpoint,
  })
}

export default mediaConvertClient
