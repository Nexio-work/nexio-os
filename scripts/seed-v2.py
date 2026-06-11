#!/usr/bin/env python3
"""Seed D1 database with proper SQL statement parsing."""
import requests, re

ACC = "f30dd0d409679ae65e841302cc0caa8c"
BAS = "https://api.cloudflare.com/client/v4/accounts/" + ACC
DB_ID = "03d55e00-5583-4037-80ee-3f8db757a8e4"

f = open("/root/.secrets/cf-api-token-full.txt")
rv = f.read().strip(); f.close()
tk = rv.split(chr(124), 1)[1] if chr(124) in rv else rv
hdr = {"Authorization": "".join(["Bearer", " ", tk]), "Content-Type": "application/json"}

schema = open("/root/workspace/nexio-os/data/schema.sql").read()

# Proper SQL parser: split on ; but only at statement level
# Handle CREATE TABLE (multi-line), comments, etc.
def parse_sql_statements(sql):
    stmts = []
    current = []
    for line in sql.split("\n"):
        stripped = line.strip()
        # Skip pure comment lines
        if stripped.startswith("--") and not stripped.startswith("-- "):
            if stripped == "--":
                continue  # separator lines like |-- ...
            # Keep inline comments as part of statement? No, skip
            continue
        current.append(line)
        # Check if line ends a statement
        if stripped.endswith(";"):
            full = "\n".join(current).strip()
            if full and not full.startswith("--"):
                stmts.append(full)
            current = []
    # Catch any remaining without trailing ;
    if current:
        full = "\n".join(current).strip()
        if full and not full.startswith("--"):
            stmts.append(full)
    return stmts

stmts = parse_sql_statements(schema)
print(f"Parsed {len(stmts)} SQL statements")

ok = er = 0
for i, stmt in enumerate(stmts):
    # Show first word of statement for logging
    first_line = stmt.split("\n")[0][:60]
    
    rp = requests.post(BAS + "/d1/database/" + DB_ID + "/query", headers=hdr, json={"sql": stmt})
    rs = rp.json()
    if rs.get("success"):
        ok += 1
        if (i+1) % 10 == 0:
            print(f"  {ok}/{len(stmts)} done...")
    else:
        er += 1
        em = (rs.get("errors") or [{}])[0].get("message","?")
        if "already exists" in em.lower() or "duplicate" in em.lower():
            ok += 1; er -= 1
        else:
            print(f"  ERR[{i}] {first_line}.. -> {em}")

print(f"\nDONE: {ok} OK, {er} errors / {len(stmts)} total")
