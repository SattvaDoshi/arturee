import env from './env.js'

const awsConfig = {
  region: env.awsRegion,
  credentials: {
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey,
  },

  s3: {
    bucket: env.s3BucketName,
    uploadPrefix: 'uploads',
    processedPrefix: 'processed',
  },

  mediaConvert: {
    endpoint: env.mediaConvertEndpoint,
    role: env.mediaConvertRole,
    queue: env.mediaConvertQueue,
  },

  cloudFront: {
    domain: env.cloudFrontDomain,
    keyPairId: env.cloudFrontKeyPairId,
    privateKey: env.cloudFrontPrivateKey,
    signedUrlTtlSeconds: 300, // 5 minutes
  },

  cloudWatch: {
    namespace: 'ART/VideoStreaming',
  },

  sns: {
    mediaConvertTopicArn: env.snsMediaConvertTopicArn,
  },
}

export default awsConfig
