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
    signedUrlTtlSeconds: 14400, // 4 hours — must cover the full playback session
  },

  cloudWatch: {
    namespace: 'ART/VideoStreaming',
  },

  sns: {
    mediaConvertTopicArn: env.snsMediaConvertTopicArn,
  },
}

export default awsConfig
