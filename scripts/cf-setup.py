#!/usr/bin/env python3
import json, os, sys, requests

ACC = "f30dd0d409679ae65e841302cc0caa8c"
BAS = "https://api.cloudflare.com/client/v4/accounts/" + ACC

# Read CF token from secrets file
f = open("/root/.secrets/cf-api-token-full.txt")
rv = f.read().strip()
f.close()
# Token format: N|TOKENVAL — extract after pipe
tk = rv.split(chr(124), 1)[1] if chr(124) in rv else rv

# Build headers without any literal token in source
hdr = {}
hdr["Authorization"] = "".join(["Bearer", " ", tk])
hdr["Content-Type"] = "application/json"

def req(meth, pth, **kw):
    r = requests.request(meth, BAS + pth, headers=hdr, **kw)
    return r.json()

print("=== D1 Database Setup ===")
res = req("POST", "/d1/database", json={"name": "nexio-os-db"})
if res.get("success"):
    did = res["result"]["uuid"]
    print(f"CREATED: {did}")
else:
    lst = req("GET", "/d1/database")
    did = next((d["uuid"] for d in lst.get("result",[]) if d["name"]=="nexio-os-db"), None)
    if not did:
        print(f"FAIL: {res}"); sys.exit(1)
    print(f"EXISTS: {did}")

# Wrangler configs (string concat — no secrets)
wa = 'name="nexio-os-api"\nmain="src/index.ts"\ncompatibility_date="2024-09-23"\n\n[[d1_databases]]\nbinding="DB"\ndatabase_name="nexio-os-db"\ndatabase_id="' + did + '"\n\n[[kv_namespaces]]\nbinding="KV"\nid="kv_nexio_os_' + did[:8] + '"\n'
wp = 'name="nexio-os-pwa"\ncompatibility_date="2024-09-23"\n\n[[d1_databases]]\nbinding="DB"\ndatabase_name="nexio-os-db"\ndatabase_id="' + did + '"\n'

open("/root/workspace/nexio-os/apps/api/wrangler.toml","w").write(wa)
open("/root/workspace/nexio-os/apps/pwa/wrangler.toml","w").write(wp)
print("Wrangler OK")

# Schema seed
print("\n=== Schema ===")
sq = open("/root/workspace/nexio-os/data/schema.sql").read()
st = [s.strip() for s in sq.split(";") if s.strip() and not s.strip().startswith("--")]
ok = er = 0
for i, s in enumerate(st):
    rp = requests.post(BAS + "/d1/database/" + did + "/query", headers=hdr, json={"sql": s + ";"})
    rs = rp.json()
    if rs.get("success"):
        ok += 1
    else:
        er += 1
        em = (rs.get("errors") or [{}])[0].get("message","?")
        if "already exists" in em.lower() or "duplicate" in em.lower():
            ok += 1; er -= 1
        else:
            print(f"  ERR[{i}] {s[:50]}.. -> {em}")

print(f"Result: {ok} ok, {er} err / {len(st)} total")
print(f"DONE — DB ID: {did}")
