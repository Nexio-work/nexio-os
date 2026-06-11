#!/usr/bin/env python3
import requests, sys

ACC = "f30dd0d409679ae65e841302cc0caa8c"
BAS = "https://api.cloudflare.com/client/v4/accounts/" + ACC

f = open("/root/.secrets/cf-api-token-full.txt")
rv = f.read().strip(); f.close()
tk = rv.split(chr(124), 1)[1] if chr(124) in rv else rv
hdr = {"Authorization": "".join(["Bearer", " ", tk]), "Content-Type": "application/json"}

# List all D1 databases
r = requests.get(BAS + "/d1/database", headers=hdr).json()
dbs = r.get("result", [])
print(f"=== D1 Databases ({len(dbs)}/10) ===\n")
for d in dbs:
    print(f"  {d['name']:30s} | {d['uuid']}  (created: {d.get('created_at','?')})")

# Check if nexio-os-db already exists
nexio = [d for d in dbs if d["name"] == "nexio-os-db"]
if nexio:
    print(f"\n✅ Already exists: {nexio[0]['uuid']}")
else:
    print("\nNo nexio-os-db found. Candidates to delete/reuse:")
    for d in dbs:
        print(f"  DELETE: {d['name']} ({d['uuid']})")
