#!/usr/bin/env bash
#
# provision_aws.sh
#
# Provisions the AWS-side infrastructure for the video pipeline described
# in your .env file:
#   - S3 bucket (private)
#   - IAM role that MediaConvert assumes to read/write S3 + publish to SNS
#   - MediaConvert queue
#   - SNS topic for MediaConvert job-completion notifications
#   - RSA key pair + CloudFront public key + key group for signed URLs
#
# It does NOT create the CloudFront distribution itself (that involves origin
# access control, cache behaviors, etc. that are usually app-specific) —
# it prepares the signing key material and prints what to attach where.
#
# Requirements: aws CLI v2, configured with an identity that has admin or
# near-admin rights (IAM, S3, MediaConvert, SNS, CloudFront) to run this
# ONE TIME setup. The narrower app-runtime IAM user should be created
# separately and used for day-to-day access (see step 6).
#
# Usage:
#   chmod +x provision_aws.sh
#   ./provision_aws.sh
#
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────
# CONFIG — edit these before running
# ─────────────────────────────────────────────────────────────────────────
AWS_REGION="ap-south-1"
BUCKET_NAME="art-videos-private"                 # must be globally unique — edit to something only you would pick, then leave it fixed
MEDIACONVERT_ROLE_NAME="art-mediaconvert-role"
MEDIACONVERT_QUEUE_NAME="art-mediaconvert-queue"
SNS_TOPIC_NAME="art-mediaconvert-jobs"
EVENTBRIDGE_RULE_NAME="art-mediaconvert-job-state-change"
APP_IAM_USER_NAME="art-app-user"                 # runtime user for your backend
CLOUDFRONT_PUBKEY_NAME="art-cloudfront-pubkey-$(date +%s)"
CLOUDFRONT_KEYGROUP_NAME="art-cloudfront-keygroup"
WORKDIR="$(pwd)/aws-provision-output"

mkdir -p "$WORKDIR"
ENV_OUT="$WORKDIR/generated.env"
: > "$ENV_OUT"

log() { echo -e "\n\033[1;34m==>\033[0m $1"; }
require() { command -v "$1" >/dev/null 2>&1 || { echo "Missing required tool: $1"; exit 1; }; }

require aws
require openssl
require jq

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
log "Using AWS account: $ACCOUNT_ID, region: $AWS_REGION"

# ─────────────────────────────────────────────────────────────────────────
# 1. S3 bucket
# ─────────────────────────────────────────────────────────────────────────
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  log "Bucket $BUCKET_NAME already exists — reusing it, skipping creation"
else
  log "Creating private S3 bucket: $BUCKET_NAME"
  aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$AWS_REGION" \
    --create-bucket-configuration LocationConstraint="$AWS_REGION"
fi

aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws s3api put-bucket-encryption \
  --bucket "$BUCKET_NAME" \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

log "Adding lifecycle rule to abort incomplete multipart uploads after 1 day"
aws s3api put-bucket-lifecycle-configuration \
  --bucket "$BUCKET_NAME" \
  --lifecycle-configuration '{
    "Rules": [
      {
        "ID": "abort-incomplete-multipart-uploads",
        "Status": "Enabled",
        "Filter": {},
        "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 1 }
      }
    ]
  }'

echo "S3_BUCKET_NAME=$BUCKET_NAME" >> "$ENV_OUT"

# ─────────────────────────────────────────────────────────────────────────
# 2. IAM role for MediaConvert (service role, not a user)
# ─────────────────────────────────────────────────────────────────────────
log "Creating IAM role for MediaConvert: $MEDIACONVERT_ROLE_NAME"

TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "mediaconvert.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
)

ROLE_ARN=$(aws iam create-role \
  --role-name "$MEDIACONVERT_ROLE_NAME" \
  --assume-role-policy-document "$TRUST_POLICY" \
  --query 'Role.Arn' --output text 2>/dev/null || \
  aws iam get-role --role-name "$MEDIACONVERT_ROLE_NAME" --query 'Role.Arn' --output text)

MC_PERMISSIONS_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::$BUCKET_NAME", "arn:aws:s3:::$BUCKET_NAME/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["sns:Publish"],
      "Resource": "arn:aws:sns:$AWS_REGION:$ACCOUNT_ID:$SNS_TOPIC_NAME"
    }
  ]
}
EOF
)

aws iam put-role-policy \
  --role-name "$MEDIACONVERT_ROLE_NAME" \
  --policy-name "${MEDIACONVERT_ROLE_NAME}-permissions" \
  --policy-document "$MC_PERMISSIONS_POLICY"

echo "MEDIACONVERT_ROLE_ARN=$ROLE_ARN" >> "$ENV_OUT"

# ─────────────────────────────────────────────────────────────────────────
# 3. SNS topic
# ─────────────────────────────────────────────────────────────────────────
log "Creating SNS topic: $SNS_TOPIC_NAME"
TOPIC_ARN=$(aws sns create-topic --name "$SNS_TOPIC_NAME" --region "$AWS_REGION" --query 'TopicArn' --output text)
echo "SNS_MEDIACONVERT_TOPIC_ARN=$TOPIC_ARN" >> "$ENV_OUT"

WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "SNS_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> "$ENV_OUT"
log "Generated SNS_WEBHOOK_SECRET (save this, it won't be regenerated for you)"

# ─────────────────────────────────────────────────────────────────────────
# 4. MediaConvert endpoint + queue
# ─────────────────────────────────────────────────────────────────────────
log "Looking up MediaConvert account endpoint"
MC_ENDPOINT=$(aws mediaconvert describe-endpoints --region "$AWS_REGION" --query 'Endpoints[0].Url' --output text)
echo "MEDIACONVERT_ENDPOINT=$MC_ENDPOINT" >> "$ENV_OUT"

log "Creating MediaConvert queue: $MEDIACONVERT_QUEUE_NAME"
QUEUE_ARN=$(aws mediaconvert create-queue \
  --endpoint-url "$MC_ENDPOINT" \
  --name "$MEDIACONVERT_QUEUE_NAME" \
  --region "$AWS_REGION" \
  --query 'Queue.Arn' --output text 2>/dev/null || \
  aws mediaconvert get-queue --endpoint-url "$MC_ENDPOINT" --name "$MEDIACONVERT_QUEUE_NAME" \
  --region "$AWS_REGION" --query 'Queue.Arn' --output text)
echo "MEDIACONVERT_QUEUE_ARN=$QUEUE_ARN" >> "$ENV_OUT"

# ─────────────────────────────────────────────────────────────────────────
# 4b. EventBridge rule: MediaConvert job state change -> SNS
#     Without this, MediaConvert job completion/error events never reach
#     your SNS topic, and your webhook will never fire.
# ─────────────────────────────────────────────────────────────────────────
log "Creating EventBridge rule: $EVENTBRIDGE_RULE_NAME"

EVENT_PATTERN=$(cat <<EOF
{
  "source": ["aws.mediaconvert"],
  "detail-type": ["MediaConvert Job State Change"],
  "detail": {
    "queue": ["$QUEUE_ARN"]
  }
}
EOF
)

aws events put-rule \
  --name "$EVENTBRIDGE_RULE_NAME" \
  --event-pattern "$EVENT_PATTERN" \
  --state ENABLED \
  --region "$AWS_REGION" >/dev/null

# Allow EventBridge to publish to the SNS topic
SNS_EVENTBRIDGE_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowEventBridgePublish",
      "Effect": "Allow",
      "Principal": { "Service": "events.amazonaws.com" },
      "Action": "sns:Publish",
      "Resource": "$TOPIC_ARN"
    }
  ]
}
EOF
)
aws sns set-topic-attributes \
  --topic-arn "$TOPIC_ARN" \
  --attribute-name Policy \
  --attribute-value "$SNS_EVENTBRIDGE_POLICY"

aws events put-targets \
  --rule "$EVENTBRIDGE_RULE_NAME" \
  --region "$AWS_REGION" \
  --targets "[{\"Id\": \"mediaconvert-to-sns\", \"Arn\": \"$TOPIC_ARN\"}]" >/dev/null

log "EventBridge rule wired: MediaConvert job state change -> SNS topic"

# ─────────────────────────────────────────────────────────────────────────
# 5. CloudFront signing key pair + key group
# ─────────────────────────────────────────────────────────────────────────
log "Generating RSA key pair for CloudFront signed URLs"
openssl genrsa -out "$WORKDIR/cf_private_key.pem" 2048 2>/dev/null
openssl rsa -pubout -in "$WORKDIR/cf_private_key.pem" -out "$WORKDIR/cf_public_key.pem" 2>/dev/null

log "Uploading public key to CloudFront"
PUBKEY_CONFIG=$(jq -n \
  --arg name "$CLOUDFRONT_PUBKEY_NAME" \
  --arg encodedkey "$(cat "$WORKDIR/cf_public_key.pem")" \
  --arg caller "$(date +%s)" \
  '{CallerReference: $caller, Name: $name, EncodedKey: $encodedkey, Comment: "Signing key for private video delivery"}')

PUBKEY_ID=$(aws cloudfront create-public-key \
  --public-key-config "$PUBKEY_CONFIG" \
  --query 'PublicKey.Id' --output text)

log "Creating CloudFront key group containing that public key"
KEYGROUP_CONFIG=$(jq -n \
  --arg name "$CLOUDFRONT_KEYGROUP_NAME" \
  --arg pubkeyid "$PUBKEY_ID" \
  --arg caller "$(date +%s)" \
  '{CallerReference: $caller, Name: $name, Items: [$pubkeyid]}')

aws cloudfront create-key-group --key-group-config "$KEYGROUP_CONFIG" > "$WORKDIR/keygroup_result.json"
KEYGROUP_ID=$(jq -r '.KeyGroup.Id' "$WORKDIR/keygroup_result.json")

echo "CLOUDFRONT_KEY_PAIR_ID=$PUBKEY_ID" >> "$ENV_OUT"
# store private key with literal \n so it drops straight into .env
PRIVATE_KEY_ONE_LINE=$(awk 'BEGIN{ORS="\\n"} {print}' "$WORKDIR/cf_private_key.pem" | sed 's/\\n$//')
echo "CLOUDFRONT_PRIVATE_KEY=\"$PRIVATE_KEY_ONE_LINE\"" >> "$ENV_OUT"

log "CloudFront key group created: $KEYGROUP_ID"
echo "  -> Manually attach this key group to your distribution's cache behavior"
echo "     (Distribution -> Behaviors -> Edit -> Restrict Viewer Access -> Trusted key groups)"
echo "  -> CLOUDFRONT_DOMAIN is only known once the distribution exists;"
echo "     copy it from the distribution's General tab and add it to your .env manually."

# ─────────────────────────────────────────────────────────────────────────
# 6. Scoped IAM user for the running application (least privilege)
# ─────────────────────────────────────────────────────────────────────────
log "Creating scoped IAM user for the app: $APP_IAM_USER_NAME"

APP_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::$BUCKET_NAME", "arn:aws:s3:::$BUCKET_NAME/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["mediaconvert:CreateJob", "mediaconvert:GetJob", "mediaconvert:ListJobs"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "$ROLE_ARN"
    },
    {
      "Effect": "Allow",
      "Action": ["sns:Publish"],
      "Resource": "$TOPIC_ARN"
    }
  ]
}
EOF
)

aws iam create-user --user-name "$APP_IAM_USER_NAME" >/dev/null 2>&1 || true
aws iam put-user-policy \
  --user-name "$APP_IAM_USER_NAME" \
  --policy-name "${APP_IAM_USER_NAME}-policy" \
  --policy-document "$APP_POLICY"

EXISTING_KEYS=$(aws iam list-access-keys --user-name "$APP_IAM_USER_NAME" --query 'AccessKeyMetadata' --output json)
EXISTING_KEY_COUNT=$(echo "$EXISTING_KEYS" | jq 'length')

if [ "$EXISTING_KEY_COUNT" -gt 0 ]; then
  log "$APP_IAM_USER_NAME already has $EXISTING_KEY_COUNT access key(s) — skipping creation"
  echo "  Existing key IDs:"
  echo "$EXISTING_KEYS" | jq -r '.[] | "    " + .AccessKeyId + " (created " + .CreateDate + ")"'
  echo "  If you need fresh credentials, delete the old key first:"
  echo "    aws iam delete-access-key --user-name $APP_IAM_USER_NAME --access-key-id <ID>"
  echo "  then re-run this script. Not auto-rotating so you don't silently break a running app."
  echo "AWS_REGION=$AWS_REGION" >> "$ENV_OUT"
  echo "# AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY not generated — key(s) already exist, see above" >> "$ENV_OUT"
else
  log "Creating access key for $APP_IAM_USER_NAME (written only to output file, not printed)"
  KEY_JSON=$(aws iam create-access-key --user-name "$APP_IAM_USER_NAME")
  ACCESS_KEY=$(echo "$KEY_JSON" | jq -r '.AccessKey.AccessKeyId')
  SECRET_KEY=$(echo "$KEY_JSON" | jq -r '.AccessKey.SecretAccessKey')

  echo "AWS_REGION=$AWS_REGION" >> "$ENV_OUT"
  echo "AWS_ACCESS_KEY_ID=$ACCESS_KEY" >> "$ENV_OUT"
  echo "AWS_SECRET_ACCESS_KEY=$SECRET_KEY" >> "$ENV_OUT"
  unset KEY_JSON ACCESS_KEY SECRET_KEY
fi

# ─────────────────────────────────────────────────────────────────────────
# Done
# ─────────────────────────────────────────────────────────────────────────
log "Done. Generated env values written to: $ENV_OUT"
echo "  (contents not printed to the terminal — open the file directly when you're"
echo "   ready to merge it into your real .env, then move/delete this folder)"
echo
echo "Keys written: $(grep -c '=' "$ENV_OUT") lines -> $(grep -o '^[A-Z_]*=' "$ENV_OUT" | tr -d '=' | tr '\n' ' ')"
echo
echo "Remaining manual steps:"
echo "  1. Create the CloudFront distribution with origin = your S3 bucket"
echo "     (use an Origin Access Control, not a public bucket policy)."
echo "  2. Attach key group '$CLOUDFRONT_KEYGROUP_NAME' ($KEYGROUP_ID) to the"
echo "     distribution's cache behavior under 'Restrict viewer access'."
echo "  3. Copy the distribution's domain name into CLOUDFRONT_DOMAIN in your .env."
echo "  4. Merge $ENV_OUT into your real .env file, then delete this output dir"
echo "     or move it somewhere private — it contains live secrets."
echo "  5. RAZORPAY_KEY_ID / SECRET still need to come from the Razorpay dashboard"
echo "     (not AWS) — see previous message for that step."