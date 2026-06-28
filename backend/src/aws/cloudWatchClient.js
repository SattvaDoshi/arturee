import { CloudWatchClient } from '@aws-sdk/client-cloudwatch'
import awsConfig from '../config/awsConfig.js'

const cloudWatchClient = new CloudWatchClient({
  region: awsConfig.region,
  credentials: awsConfig.credentials,
})

export default cloudWatchClient
