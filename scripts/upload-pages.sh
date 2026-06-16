#!/bin/bash
# Deploy Nexio OS build to Cloudflare Pages

TOKEN=*** /root/.secrets/cf-api-token-full.txt | tr -d '\n')
ACCOUNT="f30dd0d409679ae65e841302cc0caa8c"
PROJECT="nexio-os"
BUILD_DIR="/root/workspace/nexio-os/apps/pwa/build"

echo "=== Creating deployment ==="

# Create a simple index.html for the upload
cd "$BUILD_DIR" || exit 1

# Upload using the direct upload API
UPLOAD_URL=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/pages/deployments" \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  --data "{\"branch\":\"main\",\"project_name\":\"$PROJECT\"}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result']['upload_url'] if d.get('success') and d.get('result') else '')")

echo "Upload URL obtained: ${UPLOAD_URL:0:50}..."

if [ -z "$UPLOAD_URL" ]; then
  echo "ERROR: Failed to get upload URL"
  exit 1
fi

# Upload files
echo "Uploading build directory..."
DEPLOY_RESP=$(curl -s -X PUT "$UPLOAD_URL" \
  --header "X-Auth-Key: *** \
  --header "X-Auth-Email: "" \
  --form "=@-;filename=manifest.json" <<< '{"files":{}}')

echo "$DEPLOY_RESP" | python3 -m json.tool 2>/dev/null || echo "$DEPLOY_RESP"
