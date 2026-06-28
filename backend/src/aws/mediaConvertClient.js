import { MediaConvertClient } from '@aws-sdk/client-mediaconvert'
import awsConfig from '../config/awsConfig.js'

// MediaConvert requires a per-account endpoint, not the regional default
const mediaConvertClient = new MediaConvertClient({
  region: awsConfig.region,
  credentials: awsConfig.credentials,
  endpoint: awsConfig.mediaConvert.endpoint,
})

export default mediaConvertClient
