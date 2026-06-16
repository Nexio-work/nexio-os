#!/bin/bash
set -e

# Read token from file
TOKEN=$(cat /root/.secrets/cf-api-token-full.txt | tr -d '\n')
ACCOUNT="f30dd0d409679ae65e841302cc0caa8c"
PROJECT_NAME="nexio-os"
BUILD_DIR="/root/workspace/nexio-os/apps/pwa/build"

echo "=== Step 1: Create deployment ==="
DEPLOY_RESP=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/pages/deployments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"branch\":\"main\",\"project_name\":\"$PROJECT_NAME\"}")

echo "$DEPLOY_RESP" | python3 -m json.tool 2>/dev/null || echo "$DEPLOY_RESP"

UPLOAD_URL=$(echo "$DEPLOY_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if d.get('success') and d.get('result'):
    print(d['result']['upload_url'])
else:
    print('')
    sys.exit(1)
")

if [ -z "$UPLOAD_URL" ]; then
  echo "ERROR: Could not get upload URL"
  exit 1
fi

echo ""
echo "=== Step 2: Upload files to Pages ==="
cd "$BUILD_DIR"

# Create a tar.gz of all files for upload
tar -czf /tmp/nexio-build.tar.gz .
echo "Created archive: $(ls -lh /tmp/nexio-build.tar.gz)"

# Upload using curl with multipart form data
echo "Uploading..."
UPLOAD_RESULT=$(curl -s -X PUT "$UPLOAD_URL" \
  -H "Authorization: Bearer $TOKEN" \
  --data-binary @/tmp/nexio-build.tar.gz)

echo "$UPLOAD_RESULT" | python3 -m json.tool 2>/dev/null || echo "$UPLOAD_RESULT"

echo ""
echo "=== Deployment complete ==="
echo "URL: https://nexio-os.pages.dev"
