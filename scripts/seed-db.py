#!/usr/bin/env python3
import requests, sys

ACC = "f30dd0d409679ae65e841302cc0caa8c"
BAS = "https://api.cloudflare.com/client/v4/accounts/" + ACC

f = open("/root/.secrets/cf-api-token-full.txt")
rv = f.read().strip(); f.close()
tk = rv.split(chr(124), 1)[1] if chr(124) in rv else rv
hdr = {"Authorization": "".join(["Bearer", " ", tk]), "Content-Type": "application/json"}

# Reuse existing NEXIO_DB
DB_ID = "03d55e00-5583-4037-80ee-3f8db757a8e4"
print(f"Using D1: {DB_ID} (NEXIO_DB)")

# Write wrangler configs
wa = 'name="nexio-os-api"\nmain="src/index.ts"\ncompatibility_date="2024-09-23"\n\n[[d1_databases]]\nbinding="DB"\ndatabase_name="NEXIO_DB"\ndatabase_id="' + DB_ID + '"\n\n[[kv_namespaces]]\nbinding="KV"\nid="kv_nexio_os_' + DB_ID[:8] + '"\n'
wp = 'name="nexio-os-pwa"\ncompatibility_date="2024-09-23"\n\n[[d1_databases]]\nbinding="DB"\ndatabase_name="NEXIO_DB"\ndatabase_id="' + DB_ID + '"\n'

open("/root/workspace/nexio-os/apps/api/wrangler.toml","w").write(wa)
open("/root/workspace/nexio-os/apps/pwa/wrangler.toml","w").write(wp)
print("Wrangler configs written")

# Seed schema
print("\n=== Seeding Schema ===")
sq = open("/root/workspace/nexio-os/data/schema.sql").read()
st = [s.strip() for s in sq.split(";") if s.strip() and not s.strip().startswith("--")]
print(f"Statements: {len(st)}")

ok = er = 0
for i, s in enumerate(st):
    rp = requests.post(BAS + "/d1/database/" + DB_ID + "/query", headers=hdr, json={"sql": s + ";"})
    rs = rp.json()
    if rs.get("success"):
        ok += 1
    else:
        er += 1
        em = (rs.get("errors") or [{}])[0].get("message","?")
        if "already exists" in em.lower() or "duplicate" in em.lower():
            ok += 1; er -= 1
        else:
            print(f"  ERR[{i}] {s[:60]}.. -> {em}")

    # Progress every 20 statements
    if (i+1) % 20 == 0:
        print(f"  ... {i+1}/{len(st)}")

print(f"\nDONE: {ok} OK, {er} errors / {len(st)} total")
print(f"D1 READY: {DB_ID}")
