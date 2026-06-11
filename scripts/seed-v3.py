#!/usr/bin/env python3
"""Seed D1 database — robust SQL parser v3."""
import requests, re

ACC = "f30dd0d409679ae65e841302cc0caa8c"
BAS = "https://api.cloudflare.com/client/v4/accounts/" + ACC
DB_ID = "03d55e00-5583-4037-80ee-3f8db757a8e4"

f = open("/root/.secrets/cf-api-token-full.txt")
rv = f.read().strip(); f.close()
tk = rv.split(chr(124), 1)[1] if chr(124) in rv else rv
hdr = {"Authorization": "".join(["Bearer", " ", tk]), "Content-Type": "application/json"}

schema = open("/root/workspace/nexio-os/data/schema.sql").read()

def parse_sql(sql):
    stmts = []
    buf = []
    for raw_line in sql.split("\n"):
        line = raw_line.strip()
        # Skip: comments (-- ...), separators (|...), blank lines
        if not line or line.startswith("--") or line.startswith("|"):
            continue
        buf.append(raw_line)  # Keep original indentation
        if line.endswith(";"):
            stmts.append("\n".join(buf))
            buf = []
    if buf:
        stmts.append("\n".join(buf))
    return stmts

stmts = parse_sql(schema)
print(f"Parsed {len(stmts)} statements")

# Debug: print first 3
for i, s in enumerate(stmts[:3]):
    print(f"\n--- STMT[{i}] ---")
    print(s[:200])

ok = er = 0
for i, stmt in enumerate(stmts):
    rp = requests.post(BAS + "/d1/database/" + DB_ID + "/query", headers=hdr, json={"sql": stmt})
    rs = rp.json()
    first_word = stmt.split()[0] if stmt.split() else "?"
    tbl = ""
    if "CREATE TABLE" in stmt:
        # Extract table name
        m = re.search(r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)', stmt)
        tbl = m.group(1) if m else "?"
    
    if rs.get("success"):
        ok += 1
        tag = f"{first_word} {tbl}" if tbl else first_word
        if (i+1) % 5 == 0 or i < 5:
            print(f"  [{i}] {tag}")
    else:
        er += 1
        em = (rs.get("errors") or [{}])[0].get("message","?")
        if "already exists" in em.lower() or "duplicate" in em.lower():
            ok += 1; er -= 1
        else:
            print(f"  ERR[{i}] {first_word} {tbl} -> {em}")

print(f"\nDONE: {ok} OK, {er} err / {len(stmts)}")
