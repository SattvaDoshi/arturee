import { S3Client } from '@aws-sdk/client-s3'
import awsConfig from '../config/awsConfig.js'

const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: awsConfig.credentials,
})

export default s3Client
