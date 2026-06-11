#!/usr/bin/env python3
import requests

ACC = "f30dd0d409679ae65e841302cc0caa8c"
BAS = "https://api.cloudflare.com/client/v4/accounts/" + ACC
DB_ID = "03d55e00-5583-4037-80ee-3f8db757a8e4"

f = open("/root/.secrets/cf-api-token-full.txt")
rv = f.read().strip(); f.close()
tk = rv.split(chr(124), 1)[1] if chr(124) in rv else rv
hdr = {"Authorization": "".join(["Bearer", " ", tk]), "Content-Type": "application/json"}

# Test: create just ONE table
test_sql = """CREATE TABLE IF NOT EXISTS test_nexio (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);"""

r = requests.post(BAS + "/d1/database/" + DB_ID + "/query", headers=hdr, json={"sql": test_sql})
print("TEST TABLE:", r.json())

# Now test with the actual tenants table from schema
tenants_sql = open("/root/workspace/nexio-os/data/schema.sql").read()
# Get just the first CREATE TABLE
lines = tenants_sql.split("\n")
in_create = False
create_buf = ""
for line in lines:
    stripped = line.strip()
    if stripped.startswith("CREATE TABLE"):
        in_create = True
    if in_create:
        create_buf += line + "\n"
        if stripped.endswith(";"):
            break

print(f"\nExecuting:\n{create_buf[:200]}...")
r2 = requests.post(BAS + "/d1/database/" + DB_ID + "/query", headers=hdr, json={"sql": create_buf})
result = r2.json()
print("TENANTS TABLE:", result)

# Clean up test table
requests.post(BAS + "/d1/database/" + DB_ID + "/query", headers=hdr, json={"sql": "DROP TABLE IF EXISTS test_nexio;"})
