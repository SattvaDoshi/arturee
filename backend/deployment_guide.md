# ART — Video Streaming Infrastructure: Deployment Guide

## Prerequisites

- AWS account with billing enabled
- AWS CLI configured on your dev machine (`aws configure`)
- Hostinger VPS with Node.js 20+ and a public HTTPS domain
- Razorpay test account

---

## Step 1 — S3 Bucket

### Create the bucket

```bash
aws s3api create-bucket \
  --bucket art-videos-private \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1
```

### Block all public access

```bash
aws s3api put-public-access-block \
  --bucket art-videos-private \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

### Enable server-side encryption

```bash
aws s3api put-bucket-encryption \
  --bucket art-videos-private \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"},
      "BucketKeyEnabled": true
    }]
  }'
```

### Enable versioning (optional but recommended)

```bash
aws s3api put-bucket-versioning \
  --bucket art-videos-private \
  --versioning-configuration Status=Enabled
```

---

## Step 2 — IAM Role & Policy

### Create the IAM policy

Save this as `art-backend-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3UploadOriginals",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts",
        "s3:CreateMultipartUpload"
      ],
      "Resource": "arn:aws:s3:::art-videos-private/uploads/*"
    },
    {
      "Sid": "S3ReadProcessed",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:HeadObject"],
      "Resource": "arn:aws:s3:::art-videos-private/processed/*"
    },
    {
      "Sid": "S3ListBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::art-videos-private",
      "Condition": {
        "StringLike": {"s3:prefix": ["uploads/*", "processed/*"]}
      }
    },
    {
      "Sid": "S3DeleteOriginals",
      "Effect": "Allow",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::art-videos-private/uploads/*"
    },
    {
      "Sid": "MediaConvert",
      "Effect": "Allow",
      "Action": [
        "mediaconvert:CreateJob",
        "mediaconvert:GetJob",
        "mediaconvert:ListJobs",
        "mediaconvert:DescribeEndpoints"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PassMediaConvertRole",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::YOUR_ACCOUNT:role/art-mediaconvert-role"
    },
    {
      "Sid": "CloudWatch",
      "Effect": "Allow",
      "Action": "cloudwatch:PutMetricData",
      "Resource": "*",
      "Condition": {
        "StringEquals": {"cloudwatch:namespace": "ART/VideoStreaming"}
      }
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "*"
    }
  ]
}
```

```bash
aws iam create-policy \
  --policy-name art-backend-policy \
  --policy-document file://art-backend-policy.json
```

### Create IAM user for the VPS

```bash
aws iam create-user --user-name art-backend-vps

aws iam attach-user-policy \
  --user-name art-backend-vps \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT:policy/art-backend-policy

aws iam create-access-key --user-name art-backend-vps
# Save the AccessKeyId and SecretAccessKey → AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
```

---

## Step 3 — MediaConvert Role

MediaConvert needs its own IAM role to read from S3 and write processed files.

```bash
# Trust policy
cat > mediaconvert-trust.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "mediaconvert.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role \
  --role-name art-mediaconvert-role \
  --assume-role-policy-document file://mediaconvert-trust.json

# Attach S3 full access scoped to your bucket
aws iam put-role-policy \
  --role-name art-mediaconvert-role \
  --policy-name art-mediaconvert-s3 \
  --policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Action":["s3:GetObject","s3:PutObject","s3:ListBucket","s3:DeleteObject"],
      "Resource":["arn:aws:s3:::art-videos-private","arn:aws:s3:::art-videos-private/*"]
    }]
  }'
```

### Get your MediaConvert endpoint

```bash
aws mediaconvert describe-endpoints --region ap-south-1
# Copy the endpoint URL → MEDIACONVERT_ENDPOINT
```

### Get the default queue ARN

```bash
aws mediaconvert list-queues --region ap-south-1
# Copy the Default queue ARN → MEDIACONVERT_QUEUE_ARN
```

---

## Step 4 — CloudFront Distribution

### Create Origin Access Control (OAC)

In AWS Console → CloudFront → Origin access → Create control setting:
- Name: `art-s3-oac`
- Origin type: S3
- Signing behavior: Sign requests (recommended)
- Signing protocol: SigV4

### Create Distribution

- **Origin domain**: `art-videos-private.s3.ap-south-1.amazonaws.com`
- **Origin access**: Use OAC you just created
- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Cache policy**: Use `CachingDisabled` for `*.m3u8` paths; `CachingOptimized` for `*.ts` segments
- **Response headers policy**: Add `Cache-Control: no-store` for manifest files
- **Price class**: Use only North America, Europe, and Asia (reduces cost)
- **Restrict viewer access**: YES → Trusted key groups

### Create CloudFront Key Pair

```bash
# AWS Console → CloudFront → Key management → Public keys → Create
# Generate RSA 2048 key locally:
openssl genrsa -out cloudfront-private-key.pem 2048
openssl rsa -in cloudfront-private-key.pem -pubout -out cloudfront-public-key.pem

# Upload cloudfront-public-key.pem to AWS Console
# Copy the Key Pair ID → CLOUDFRONT_KEY_PAIR_ID

# Set private key in .env (escape newlines):
# CLOUDFRONT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEo...\n-----END RSA PRIVATE KEY-----"
```

### Update S3 Bucket Policy for OAC

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontOAC",
    "Effect": "Allow",
    "Principal": {"Service": "cloudfront.amazonaws.com"},
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::art-videos-private/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT:distribution/YOUR_DIST_ID"
      }
    }
  }]
}
```

---

## Step 5 — SNS + EventBridge for MediaConvert

### Create SNS Topic

```bash
aws sns create-topic \
  --name art-mediaconvert-jobs \
  --region ap-south-1
# Copy TopicArn → SNS_MEDIACONVERT_TOPIC_ARN
```

### Create EventBridge Rule

```bash
aws events put-rule \
  --name art-mediaconvert-state-change \
  --event-pattern '{
    "source": ["aws.mediaconvert"],
    "detail-type": ["MediaConvert Job State Change"],
    "detail": {"status": ["COMPLETE","ERROR","CANCELED"]}
  }' \
  --state ENABLED \
  --region ap-south-1

aws events put-targets \
  --rule art-mediaconvert-state-change \
  --targets "Id=sns-target,Arn=arn:aws:sns:ap-south-1:YOUR_ACCOUNT:art-mediaconvert-jobs" \
  --region ap-south-1
```

### Subscribe your VPS to the SNS Topic

```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT:art-mediaconvert-jobs \
  --protocol https \
  --notification-endpoint https://your-domain.com/api/internal/mediaconvert-webhook \
  --region ap-south-1
```

> AWS will call your endpoint with a `SubscriptionConfirmation` message.
> The webhook handler **auto-confirms** it. Make sure your VPS is running before subscribing.

### Allow SNS to call EventBridge

```bash
aws sns set-topic-attributes \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT:art-mediaconvert-jobs \
  --attribute-name Policy \
  --attribute-value '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":{"Service":"events.amazonaws.com"},
      "Action":"SNS:Publish",
      "Resource":"arn:aws:sns:ap-south-1:YOUR_ACCOUNT:art-mediaconvert-jobs"
    }]
  }'
```

---

## Step 6 — CloudWatch Dashboard (Optional)

```bash
aws cloudwatch put-dashboard \
  --dashboard-name ART-VideoStreaming \
  --dashboard-body '{
    "widgets": [
      {"type":"metric","properties":{"title":"Upload Errors","namespace":"ART/VideoStreaming","metrics":[["ART/VideoStreaming","UploadError"]]}},
      {"type":"metric","properties":{"title":"MediaConvert Errors","namespace":"ART/VideoStreaming","metrics":[["ART/VideoStreaming","MediaConvertError"]]}},
      {"type":"metric","properties":{"title":"Playback Errors","namespace":"ART/VideoStreaming","metrics":[["ART/VideoStreaming","PlaybackError"]]}}
    ]
  }'
```

---

## Step 7 — VPS Deployment

### Install dependencies

```bash
cd /var/www/art/backend
npm install --production
```

### Set environment variables

Create `/var/www/art/backend/.env` from `.env.example` and fill in all values.

### Start with PM2

```bash
npm install -g pm2
pm2 start index.js --name art-backend --interpreter node
pm2 save
pm2 startup
```

### Nginx reverse proxy (HTTPS required for SNS)

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;

        # Increase limit for large presigned URL bodies
        client_max_body_size 50m;
    }
}
```

---

## Step 8 — Razorpay Test Setup

1. Sign up at [razorpay.com](https://razorpay.com) and go to **Test mode**
2. Dashboard → Settings → API Keys → Generate Test Key
3. Copy `Key ID` → `RAZORPAY_KEY_ID`
4. Copy `Key Secret` → `RAZORPAY_KEY_SECRET`
5. Use Razorpay's test card numbers in the checkout modal:
   - Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date

---

## Step 9 — Set Admin Role

After the first user registers, manually set them as admin via MongoDB:

```js
// In mongosh
db.users.updateOne(
  { email: "your-admin-email@example.com" },
  { $set: { role: "admin" } }
)
```

---

## Cost Optimization

| Service | Optimization |
|---------|-------------|
| S3 | Use S3 Intelligent-Tiering for processed files |
| MediaConvert | On-demand pricing — only charged when jobs run |
| CloudFront | Use `PriceClass_200` (exclude South America/Australia) |
| CloudWatch | Metrics are ~$0.30/metric/month — only the 6 custom ones used |
| Data Transfer | CloudFront data transfer is cheaper than direct S3 |

**Estimated cost for 100 videos (720p + 1080p):**
- S3 storage: ~$2–3/month
- MediaConvert: ~$0.015/min of output (one-time per video)
- CloudFront: ~$0.0085/GB data transfer
- CloudWatch: ~$1.80/month (6 metrics)

---

## Future Upgrade Path

| Feature | Change Required |
|---------|----------------|
| Monthly subscriptions | Add `Subscription` model + payment plan in Razorpay + middleware to check plan |
| React Native | Same APIs work — add push notification service |
| TV Apps | Same APIs — add `tv` to device detection, serve 1080p |
| Adaptive bitrate | Add 480p output to MediaConvert job spec in `mediaConvertService.js` |
| Offline downloads | Generate longer-TTL signed URLs + track download grants |
| Live streaming | Add AWS IVS or MediaLive — separate service module |
| Full DRM | Set `DRM_PROVIDER=pallycon` (or axinom/ezdrm) — everything else is already wired |

---

## API Reference Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Health check |
| GET | `/api/videos` | None | List published videos |
| GET | `/api/videos/:id` | None | Video details |
| POST | `/api/videos/upload/initiate` | Admin | Start presigned multipart upload |
| POST | `/api/videos/upload/complete` | Admin | Finish upload + start MediaConvert |
| POST | `/api/videos/upload/abort` | Admin | Abort upload |
| GET | `/api/videos/:id/job-status` | Admin | MediaConvert job status |
| PATCH | `/api/videos/:id` | Admin | Update metadata |
| DELETE | `/api/videos/:id` | Admin | Archive video |
| POST | `/api/playback/register-device` | User | Register device (call after login) |
| POST | `/api/playback/request` | User+Session | Get 5-min signed streaming URL |
| POST | `/api/playback/logout-device` | User | Terminate device session |
| POST | `/api/playback/terminate-session` | User | Force-remove previous device |
| POST | `/api/purchase/create-order` | User | Create Razorpay order |
| POST | `/api/purchase/verify` | User | Verify payment + unlock video |
| GET | `/api/purchase/my` | User | List user's purchases |
| GET | `/api/purchase/check/:id` | User | Check if video is purchased |
| POST | `/api/progress/save` | User | Save watch timestamp |
| POST | `/api/progress/complete` | User | Mark video as completed |
| GET | `/api/progress/history` | User | Full watch history |
| GET | `/api/progress/:videoId` | User | Progress for one video |
| POST | `/api/drm/license/widevine/:id` | User+Session | DRM license proxy |
| POST | `/api/drm/license/fairplay/:id` | User+Session | DRM license proxy |
| POST | `/api/drm/license/playready/:id` | User+Session | DRM license proxy |
| POST | `/api/internal/mediaconvert-webhook` | SNS | MediaConvert job events |
