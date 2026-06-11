#!/bin/bash
set -e
CF_TOKEN=*** /root/.secrets/cf-api-token-full.txt | tr -d '\n')
ACCOUNT_ID="f30dd0d409679ae65e841302cc0caa8c"

echo "=== 1. Create D1 Database ==="
D1_RESULT=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database" \
  -H "Authorization: Bearer ***   -H "Content-Type: application/json" \
  -d '{"name":"nexio-os-db"}')

echo "$D1_RESULT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    uuid = data['result']['uuid']
    print(f'DB CREATED: {uuid}')
    # Write to .env for wrangler
    with open('/root/workspace/nexio-os/apps/api/.env', 'w') as f:
        f.write(f'D1_DATABASE_ID={uuid}\n')
    print('Wrote D1_DATABASE_ID to apps/api/.env')
else:
    print(f'ERROR: {data}')
    sys.exit(1)
"

D1_ID=$(python3 -c "import json; d=json.loads('''$D1_RESULT'''); print(d['result']['uuid'] if d.get('success') else '')")

if [ -z "$D1_ID" ]; then
  echo "Failed to get DB ID, trying to find existing..."
  D1_LIST=$(curl -s \
    "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database" \
    -H "Authorization: Bearer ***   echo "$D1_LIST"
fi

echo ""
echo "=== 2. Seed Schema ==="
SCHEMA=$(cat /root/workspace/nexio-os/data/schema.sql)

# Cloudflare API has body size limits, let's split schema into statements
# For now, just create the core tables
python3 << PYEOF
import requests, json, os

token = open("/root/.secrets/cf-api-token-full.txt").read().strip()
account = "f30dd0d409679ae65e841302cc0caa8c"

# Get or create D1 db
resp = requests.post(
    f"https://api.cloudflare.com/client/v4/accounts/{account}/d1/database",
    headers={"Authorization": f"Bearer ***     json={"name": "nexio-os-db"}
)
data = resp.json()
if not data.get("success"):
    # Maybe already exists, list them
    resp2 = requests.get(
        f"https://api.cloudflare.com/client/v4/accounts/{account}/d1/database",
        headers={"Authorization": f"Bearer ***     dbs = resp2.json().get("result", [])
    for db in dbs:
        if db["name"] == "nexio-os-db":
            db_id = db["uuid"]
            break
    else:
        print("ERROR: Could not create/find D1 database")
        print(data)
        exit(1)
else:
    db_id = data["result"]["uuid"]

print(f"D1 DB ID: {db_id}")

# Write config files
with open("/root/workspace/nexio-os/apps/api/wrangler.toml", "w") as f:
    f.write(f"""name = "nexio-os-api"
main = "src/index.ts"
compatibility_date = "2024-09-23"

[[d1_databases]]
binding = "DB"
database_name = "nexio-os-db"
database_id = "{db_id}"

[[kv_namespaces]]
binding = "KV"
id = "kv_nexio_os_{db_id[:8]}"
""")

with open("/root/workspace/nexio-os/apps/pwa/wrangler.toml", "w") as f:
    f.write(f"""name = "nexio-os-pwa"
compatibility_date = "2024-09-23"

[[d1_databases]]
binding = "DB"
database_name = "nexio-os-db"
database_id = "{db_id}"
""")

# Execute schema
schema_sql = open("/root/workspace/nexio-os/data/schema.sql").read()

# Split by semicolons (basic SQL statement splitter)
statements = [s.strip() for s in schema_sql.split(";") if s.strip() and not s.strip().startswith("--")]

# Batch statements (Cloudflare allows multiple statements per request)
batch_size = 5
for i in range(0, len(statements), batch_size):
    batch = statements[i:i+batch_size]
    sql = ";\n".join(batch) + ";"
    
    resp = requests.post(
        f"https://api.cloudflare.com/client/v4/accounts/{account}/d1/database/{db_id}/query",
        headers={
            "Authorization": f"Bearer "***         "Content-Type": "application/json"
        },
        json={"sql": sql}
    )
    result = resp.json()
    if result.get("success"):
        print(f"  Schema batch {i//batch_size + 1}: OK ({len(batch)} statements)")
    else:
        print(f"  Schema batch {i//batch_size + 1}: ERROR - {result.get('errors', [])}")
        # Try one by one
        for stmt in batch:
            resp2 = requests.post(
                f"https://api.cloudflare.com/client/v4/accounts/{account}/d1/database/{db_id}/query",
                headers={"Authorization": f"Bearer "***                 "Content-Type": "application/json"
            },
            json={"sql": stmt + ";"}
            )
            r2 = resp2.json()
            if r2.get("success"):
                print(f"    ✓ {stmt[:60]}...")
            else:
                print(f"    ✗ {stmt[:60]}... -> {r2.get('errors', [])}")

print("\n✅ D1 database ready!")
PYEOF
