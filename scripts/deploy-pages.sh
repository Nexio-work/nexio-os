#!/bin/bash
# Deploy Nexio OS to Cloudflare Pages

TOKEN=$(cat /root/.secrets/cf-api-token-full.txt | tr -d '\n')
ACCOUNT="f30dd0d409679ae65e841302cc0caa8c"

echo "=== Creating Pages project ==="
CREATE_RESP=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/pages/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"nexio-os","production_branch":"main"}')

echo "$CREATE_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print('Success:', d.get('success')); print('Result:', json.dumps(d.get('result'), indent=2) if d.get('result') else 'Error:', d.get('errors'))"

# Extract subdomain if created
SUBDOMAIN=$(echo "$CREATE_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result']['subdomain'] if d.get('result') else '')" 2>/dev/null)
echo "Pages URL: https://$SUBDOMAIN.pages.dev"
