import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const run = async () => {
  try {
    const command = new PutBucketCorsCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["PUT", "POST", "GET", "HEAD", "DELETE"],
            AllowedOrigins: ["http://localhost:5173", "http://localhost:4173"],
            ExposeHeaders: ["ETag"]
          }
        ]
      }
    });
    
    await s3Client.send(command);
    console.log("Successfully updated S3 bucket CORS configuration.");
  } catch (err) {
    console.error("Error setting CORS:", err);
  }
};

run();
