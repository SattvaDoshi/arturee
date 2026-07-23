$ErrorActionPreference = "Stop"

# =========================================================================
# CONFIG - edit these before running
# =========================================================================
$PREFIX = "arturee"
$AWS_REGION = "ap-south-1"

$BUCKET_NAME = "$PREFIX-videos-private"
$MEDIACONVERT_ROLE_NAME = "$PREFIX-mediaconvert-role"
$MEDIACONVERT_QUEUE_NAME = "$PREFIX-mediaconvert-queue"
$SNS_TOPIC_NAME = "$PREFIX-mediaconvert-jobs"
$EVENTBRIDGE_RULE_NAME = "$PREFIX-mediaconvert-job-state-change"
$APP_IAM_USER_NAME = "$PREFIX-app-user"
$CLOUDFRONT_KEYGROUP_NAME = "$PREFIX-cloudfront-keygroup"

$WORKDIR = "$PWD\aws-provision-output"
if (-not (Test-Path -Path $WORKDIR)) {
    New-Item -ItemType Directory -Path $WORKDIR | Out-Null
}
$ENV_OUT = "$WORKDIR\generated.env"
Set-Content -Path $ENV_OUT -Value ""

function Write-Log {
    param([string]$Message)
    Write-Host "==> $Message" -ForegroundColor Cyan
}

# FIX 4: fail loudly instead of silently continuing with empty/garbage values
function Assert-Success {
    param([string]$Msg)
    if ($LASTEXITCODE -ne 0) {
        throw "FAILED: $Msg (aws exited with code $LASTEXITCODE)"
    }
}

# Single epoch value computed once and reused everywhere a timestamp is needed
# (FIX 1: Get-Date -UFormat %s can return a decimal on Windows PowerShell,
# which breaks CloudFront resource names / CallerReference values)
$epoch = [int][double]::Parse((Get-Date (Get-Date).ToUniversalTime() -UFormat %s))
$CLOUDFRONT_PUBKEY_NAME = "$PREFIX-cloudfront-pubkey-$epoch"

$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text).Trim()
Assert-Success "get-caller-identity"
Write-Log "Using AWS account: $ACCOUNT_ID, region: $AWS_REGION"

# FIX 4: explicit confirmation this is the intended (client) account before
# creating/mutating anything
Write-Host "About to provision resources in AWS Account: $ACCOUNT_ID (region $AWS_REGION)" -ForegroundColor Yellow
$confirm = Read-Host "Type the account ID above to confirm you're in the right account"
if ($confirm -ne $ACCOUNT_ID) {
    throw "Account ID mismatch - aborting. Check your AWS_PROFILE / --profile before re-running."
}

# 1. S3 bucket
Write-Log "Checking if bucket $BUCKET_NAME exists..."
$bucketExists = $false
try {
    $null = aws s3api head-bucket --bucket $BUCKET_NAME 2>$null
    if ($LASTEXITCODE -eq 0) { $bucketExists = $true }
} catch {
    $bucketExists = $false
}

if ($bucketExists) {
    Write-Log "Bucket $BUCKET_NAME already exists - reusing it, skipping creation"
} else {
    Write-Log "Creating private S3 bucket: $BUCKET_NAME"
    aws s3api create-bucket --bucket $BUCKET_NAME --region $AWS_REGION --create-bucket-configuration LocationConstraint=$AWS_REGION
    Assert-Success "create-bucket $BUCKET_NAME"
}

aws s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
Assert-Success "put-public-access-block"

# For JSON args passed to aws cli directly, single quotes without internal escaping usually works in PS 7, but in Windows PS 5.1 we must pass as a file to be safe.
$ENCRYPTION_JSON = '{ "Rules": [ { "ApplyServerSideEncryptionByDefault": { "SSEAlgorithm": "AES256" } } ] }'
$ENCRYPTION_FILE = "$WORKDIR\encryption.json"
Set-Content -Path $ENCRYPTION_FILE -Value $ENCRYPTION_JSON
aws s3api put-bucket-encryption --bucket $BUCKET_NAME --server-side-encryption-configuration file://$ENCRYPTION_FILE
Assert-Success "put-bucket-encryption"

Write-Log "Adding lifecycle rule"
$LIFECYCLE_JSON = '{ "Rules": [ { "ID": "abort-incomplete-multipart-uploads", "Status": "Enabled", "Filter": {}, "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 1 } } ] }'
$LIFECYCLE_FILE = "$WORKDIR\lifecycle.json"
Set-Content -Path $LIFECYCLE_FILE -Value $LIFECYCLE_JSON
aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET_NAME --lifecycle-configuration file://$LIFECYCLE_FILE
Assert-Success "put-bucket-lifecycle-configuration"

Add-Content -Path $ENV_OUT -Value "S3_BUCKET_NAME=$BUCKET_NAME"

# 2. IAM role for MediaConvert
Write-Log "Creating IAM role for MediaConvert: $MEDIACONVERT_ROLE_NAME"

$TRUST_POLICY = '{ "Version": "2012-10-17", "Statement": [ { "Effect": "Allow", "Principal": { "Service": "mediaconvert.amazonaws.com" }, "Action": "sts:AssumeRole" } ] }'
$TRUST_POLICY_FILE = "$WORKDIR\trust-policy.json"
Set-Content -Path $TRUST_POLICY_FILE -Value $TRUST_POLICY

# FIX 2: .Trim() the "already exists" lookup ARN too, not just the "create" branch
$ROLE_ARN = $null
try {
    $ROLE_ARN = (aws iam get-role --role-name $MEDIACONVERT_ROLE_NAME --query "Role.Arn" --output text 2>$null)
} catch { }

if (-not $ROLE_ARN) {
    $ROLE_ARN = (aws iam create-role --role-name $MEDIACONVERT_ROLE_NAME --assume-role-policy-document file://$TRUST_POLICY_FILE --query "Role.Arn" --output text).Trim()
    Assert-Success "create-role $MEDIACONVERT_ROLE_NAME"
} else {
    $ROLE_ARN = $ROLE_ARN.Trim()
}

$MC_PERMISSIONS_POLICY = '{ "Version": "2012-10-17", "Statement": [ { "Effect": "Allow", "Action": ["s3:GetObject", "s3:PutObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::' + $BUCKET_NAME + '", "arn:aws:s3:::' + $BUCKET_NAME + '/*"] }, { "Effect": "Allow", "Action": ["sns:Publish"], "Resource": "arn:aws:sns:' + $AWS_REGION + ':' + $ACCOUNT_ID + ':' + $SNS_TOPIC_NAME + '" } ] }'
$MC_POLICY_FILE = "$WORKDIR\mc-permissions.json"
Set-Content -Path $MC_POLICY_FILE -Value $MC_PERMISSIONS_POLICY

aws iam put-role-policy --role-name $MEDIACONVERT_ROLE_NAME --policy-name "${MEDIACONVERT_ROLE_NAME}-permissions" --policy-document file://$MC_POLICY_FILE
Assert-Success "put-role-policy $MEDIACONVERT_ROLE_NAME"

Add-Content -Path $ENV_OUT -Value "MEDIACONVERT_ROLE_ARN=$ROLE_ARN"

# 3. SNS topic
Write-Log "Creating SNS topic: $SNS_TOPIC_NAME"
$TOPIC_ARN = (aws sns create-topic --name $SNS_TOPIC_NAME --region $AWS_REGION --query "TopicArn" --output text).Trim()
Assert-Success "create-topic $SNS_TOPIC_NAME"
Add-Content -Path $ENV_OUT -Value "SNS_MEDIACONVERT_TOPIC_ARN=$TOPIC_ARN"

$bytes = New-Object Byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
$WEBHOOK_SECRET = -join ($bytes | ForEach-Object { "{0:x2}" -f $_ })
Add-Content -Path $ENV_OUT -Value "SNS_WEBHOOK_SECRET=$WEBHOOK_SECRET"
Write-Log "Generated SNS_WEBHOOK_SECRET"

# 4. MediaConvert endpoint + queue
Write-Log "Looking up MediaConvert account endpoint"
$MC_ENDPOINT = (aws mediaconvert describe-endpoints --region $AWS_REGION --query "Endpoints[0].Url" --output text)
Assert-Success "describe-endpoints"
$MC_ENDPOINT = $MC_ENDPOINT.Trim()
Add-Content -Path $ENV_OUT -Value "MEDIACONVERT_ENDPOINT=$MC_ENDPOINT"

Write-Log "Creating MediaConvert queue: $MEDIACONVERT_QUEUE_NAME"
# FIX 2: .Trim() here as well
$QUEUE_ARN = $null
try {
    $QUEUE_ARN = (aws mediaconvert get-queue --endpoint-url $MC_ENDPOINT --name $MEDIACONVERT_QUEUE_NAME --region $AWS_REGION --query "Queue.Arn" --output text 2>$null)
} catch { }

if (-not $QUEUE_ARN) {
    $QUEUE_ARN = (aws mediaconvert create-queue --endpoint-url $MC_ENDPOINT --name $MEDIACONVERT_QUEUE_NAME --region $AWS_REGION --query "Queue.Arn" --output text).Trim()
    Assert-Success "create-queue $MEDIACONVERT_QUEUE_NAME"
} else {
    $QUEUE_ARN = $QUEUE_ARN.Trim()
}
Add-Content -Path $ENV_OUT -Value "MEDIACONVERT_QUEUE_ARN=$QUEUE_ARN"

# 4b. EventBridge rule
Write-Log "Creating EventBridge rule: $EVENTBRIDGE_RULE_NAME"

$EVENT_PATTERN = '{ "source": ["aws.mediaconvert"], "detail-type": ["MediaConvert Job State Change"], "detail": { "queue": ["' + $QUEUE_ARN + '"] } }'
$EVENT_PATTERN_FILE = "$WORKDIR\event-pattern.json"
Set-Content -Path $EVENT_PATTERN_FILE -Value $EVENT_PATTERN

aws events put-rule --name $EVENTBRIDGE_RULE_NAME --event-pattern file://$EVENT_PATTERN_FILE --state ENABLED --region $AWS_REGION | Out-Null
Assert-Success "put-rule $EVENTBRIDGE_RULE_NAME"

$SNS_EVENTBRIDGE_POLICY = '{ "Version": "2012-10-17", "Statement": [ { "Sid": "AllowEventBridgePublish", "Effect": "Allow", "Principal": { "Service": "events.amazonaws.com" }, "Action": "sns:Publish", "Resource": "' + $TOPIC_ARN + '" } ] }'
$SNS_POLICY_FILE = "$WORKDIR\sns-policy.json"
Set-Content -Path $SNS_POLICY_FILE -Value $SNS_EVENTBRIDGE_POLICY

aws sns set-topic-attributes --topic-arn $TOPIC_ARN --attribute-name Policy --attribute-value file://$SNS_POLICY_FILE
Assert-Success "set-topic-attributes"

$TARGETS = '[ { "Id": "mediaconvert-to-sns", "Arn": "' + $TOPIC_ARN + '" } ]'
$TARGETS_FILE = "$WORKDIR\targets.json"
Set-Content -Path $TARGETS_FILE -Value $TARGETS

aws events put-targets --rule $EVENTBRIDGE_RULE_NAME --region $AWS_REGION --targets file://$TARGETS_FILE | Out-Null
Assert-Success "put-targets"
Write-Log "EventBridge rule wired"

# 5. CloudFront signing key pair + key group
Write-Log "Generating RSA key pair for CloudFront signed URLs"

$oldErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"
try {
    openssl genrsa -out "$WORKDIR\cf_private_key.pem" 2048 2>$null
    openssl rsa -pubout -in "$WORKDIR\cf_private_key.pem" -out "$WORKDIR\cf_public_key.pem" 2>$null
} finally {
    $ErrorActionPreference = $oldErrorAction
}

Write-Log "Uploading public key to CloudFront"
$cfPubKey = (Get-Content -Raw -Path "$WORKDIR\cf_public_key.pem").TrimEnd()

# FIX 1: reuse the single, guarded $epoch value instead of recomputing / using
# the unguarded Get-Date -UFormat %s call
$PUBKEY_CONFIG_OBJ = @{ CallerReference = $epoch.ToString(); Name = $CLOUDFRONT_PUBKEY_NAME; EncodedKey = $cfPubKey; Comment = "Signing key" }
$PUBKEY_CONFIG_JSON = $PUBKEY_CONFIG_OBJ | ConvertTo-Json -Depth 5 -Compress
$PUBKEY_CONFIG_FILE = "$WORKDIR\pubkey-config.json"
Set-Content -Path $PUBKEY_CONFIG_FILE -Value $PUBKEY_CONFIG_JSON

$PUBKEY_ID = (aws cloudfront create-public-key --public-key-config file://$PUBKEY_CONFIG_FILE --query "PublicKey.Id" --output text).Trim()
Assert-Success "create-public-key"

Write-Log "Creating CloudFront key group"
$KEYGROUP_CONFIG_OBJ = @{ Name = $CLOUDFRONT_KEYGROUP_NAME; Items = @($PUBKEY_ID); Comment = "Signing key group" }
$KEYGROUP_CONFIG_JSON = $KEYGROUP_CONFIG_OBJ | ConvertTo-Json -Depth 5 -Compress
$KEYGROUP_CONFIG_FILE = "$WORKDIR\keygroup-config.json"
Set-Content -Path $KEYGROUP_CONFIG_FILE -Value $KEYGROUP_CONFIG_JSON

$KEYGROUP_OUTPUT = aws cloudfront create-key-group --key-group-config file://$KEYGROUP_CONFIG_FILE | ConvertFrom-Json
Assert-Success "create-key-group"
$KEYGROUP_ID = $KEYGROUP_OUTPUT.KeyGroup.Id

Add-Content -Path $ENV_OUT -Value "CLOUDFRONT_KEY_PAIR_ID=$PUBKEY_ID"
$PRIVATE_KEY_ONE_LINE = (Get-Content "$WORKDIR\cf_private_key.pem") -join "\n"
Add-Content -Path $ENV_OUT -Value ('CLOUDFRONT_PRIVATE_KEY="' + $PRIVATE_KEY_ONE_LINE + '"')
Write-Log "CloudFront key group created: $KEYGROUP_ID"

# 6. Scoped IAM user
Write-Log "Creating scoped IAM user for the app: $APP_IAM_USER_NAME"
$APP_POLICY = '{ "Version": "2012-10-17", "Statement": [ { "Effect": "Allow", "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::' + $BUCKET_NAME + '", "arn:aws:s3:::' + $BUCKET_NAME + '/*"] }, { "Effect": "Allow", "Action": ["mediaconvert:CreateJob", "mediaconvert:GetJob", "mediaconvert:ListJobs"], "Resource": "*" }, { "Effect": "Allow", "Action": "iam:PassRole", "Resource": "' + $ROLE_ARN + '" }, { "Effect": "Allow", "Action": ["sns:Publish"], "Resource": "' + $TOPIC_ARN + '" } ] }'
$APP_POLICY_FILE = "$WORKDIR\app-policy.json"
Set-Content -Path $APP_POLICY_FILE -Value $APP_POLICY

try { aws iam create-user --user-name $APP_IAM_USER_NAME 2>$null } catch { }
aws iam put-user-policy --user-name $APP_IAM_USER_NAME --policy-name "${APP_IAM_USER_NAME}-policy" --policy-document file://$APP_POLICY_FILE
Assert-Success "put-user-policy $APP_IAM_USER_NAME"

$EXISTING_KEYS_JSON = aws iam list-access-keys --user-name $APP_IAM_USER_NAME --query "AccessKeyMetadata" --output json
$EXISTING_KEYS = $EXISTING_KEYS_JSON | ConvertFrom-Json

if ($EXISTING_KEYS -and @($EXISTING_KEYS).Count -gt 0) {
    Write-Log "$APP_IAM_USER_NAME already has keys - skipping creation"
    Write-Host "  If you need fresh credentials, delete the old key first:"
    Write-Host "    aws iam delete-access-key --user-name $APP_IAM_USER_NAME --access-key-id YOUR_ID"
    Add-Content -Path $ENV_OUT -Value "AWS_REGION=$AWS_REGION"
    Add-Content -Path $ENV_OUT -Value "# AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY not generated - key(s) already exist"
} else {
    Write-Log "Creating access key for $APP_IAM_USER_NAME"
    $KEY_JSON = aws iam create-access-key --user-name $APP_IAM_USER_NAME | ConvertFrom-Json
    Assert-Success "create-access-key $APP_IAM_USER_NAME"
    Add-Content -Path $ENV_OUT -Value "AWS_REGION=$AWS_REGION"
    Add-Content -Path $ENV_OUT -Value "AWS_ACCESS_KEY_ID=$($KEY_JSON.AccessKey.AccessKeyId)"
    Add-Content -Path $ENV_OUT -Value "AWS_SECRET_ACCESS_KEY=$($KEY_JSON.AccessKey.SecretAccessKey)"
}

Write-Log "Done. Generated env values written to: $ENV_OUT"
Write-Host "Remaining manual steps:"
Write-Host "  1. Create the CloudFront distribution with origin = your S3 bucket"
Write-Host "  2. Attach key group $CLOUDFRONT_KEYGROUP_NAME to the distribution"
Write-Host "  3. Copy the distribution domain name into CLOUDFRONT_DOMAIN in your .env."
Write-Host "  4. Merge $ENV_OUT into your real .env file."