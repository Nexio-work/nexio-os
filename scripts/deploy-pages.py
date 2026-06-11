#!/usr/bin/env python3
"""Deploy Nexio OS PWA to Cloudflare Pages + DNS."""
import json, os, sys, requests, time

ACC = "f30dd0d409679ae65e841302cc0caa8c"
ACC_BAS = "https://api.cloudflare.com/client/v4/accounts/" + ACC
ZONE_BAS = "https://api.cloudflare.com/client/v4"

# Read CF token
with open("/root/.secrets/cf-api-token-full.txt") as f:
    rv = f.read().strip()
tk = rv.split(chr(124), 1)[1] if chr(124) in rv else rv
HDR = {"Authorization": "Bearer " + tk, "Content-Type": "application/json"}

def api(method, path, base=ACC_BAS, **kw):
    r = getattr(requests, method)(base + path, headers=HDR, **kw)
    j = r.json()
    if not j.get("success"):
        em = j.get("errors", [{}])[0].get("message", "?")
        print("  API ERR " + method + " " + path + ": " + em)
    return j

# Step 1: Find zone for nexio.work
print("=== 1. Finding zone ===")
zr = api("get", "/zones?name=nexio.work", base=ZONE_BAS)["result"]
if not zr:
    zr = api("get", "/zones?per_page=50", base=ZONE_BAS)["result"]
    for z in zr:
        print("  Zone: " + z["name"] + " (" + z["id"] + ")")
    sys.exit(1)
zone_id = zr[0]["id"]
zone_name = zr[0]["name"]
print("  Zone: " + zone_name + " (id=" + zone_id + ")")

# Step 2: Create Pages project
print("\n=== 2. Pages project ===")
proj_name = "nexio-os-pwa"
existing = api("get", "/pages/projects?project_name=" + proj_name)["result"]
if existing:
    proj = existing[0]
    print("  Exists: " + proj["name"] + " (id=" + proj["id"] + ")")
else:
    proj = api("post", "/pages/projects", json={"name": proj_name})["result"]
    print("  Created: " + proj["name"])
proj_id = proj["id"]

# Step 3: Deploy build output
print("\n=== 3. Deploying ===")
build_dir = "/root/workspace/nexio-os/apps/pwa/.svelte-kit/cloudflare"
if not os.path.exists(build_dir):
    build_dir = "/root/workspace/nexio-os/apps/pwa/.svelte-kit/output"
print("  Build dir: " + build_dir)

files = []
for root, dirs, filenames in os.walk(build_dir):
    for fn in filenames:
        fp = os.path.join(root, fn)
        rp = os.path.relpath(fp, build_dir)
        with open(fp, "rb") as fh:
            files.append((rp, fh.read()))
print("  Uploading " + str(len(files)) + " files...")

boundary = "----NexioDeploy" + str(int(time.time()))
body = b""
for rp, data in files:
    body += ("--" + boundary + "\r\n").encode()
    body += ('Content-Disposition: form-data; name="' + rp + '"; filename="' + rp + '"\r\n\r\n').encode()
    body += data + b"\r\n"
body += ("--" + boundary + "--\r\n").encode()

deploy_hdr = dict(HDR)
deploy_hdr["Content-Type"] = "multipart/form-data; boundary=" + boundary

r = requests.post(ACC_BAS + "/pages/projects/" + proj_id + "/deployments",
    headers=deploy_hdr, data=body, params={"branch": "main"})
dj = r.json()

if not dj.get("success"):
    print("  Deploy ERR: " + str(dj.get("errors", [])))
    sys.exit(1)

dep = dj["result"]
dep_url = dep.get("url", proj_name + ".pages.dev")
print("  Deploy ID: " + dep["id"])
print("  URL: https://" + dep_url)

# Step 4: Custom domain app.nexio.work
print("\n=== 4. Custom domain ===")
dom = api("put", "/pages/projects/" + proj_id + "/domains/app.nexio.work",
    json={"environment": "production"})
if dom.get("success"):
    d = dom["result"]
    print("  Domain: " + d.get("domain", "") + " status=" + d.get("status", ""))

# Step 5: DNS records
print("\n=== 5. DNS ===")
wc = api("put", "/zones/" + zone_id + "/dns_records", json={
    "type": "CNAME", "name": "*.nexio.work",
    "content": proj_name + ".pages.dev", "ttl": 3600, "proxied": True
}, base=ZONE_BAS)
if wc.get("success"):
    print("  *.nexio.work -> " + wc["result"]["content"] + " OK")

ad = api("put", "/zones/" + zone_id + "/dns_records", json={
    "type": "CNAME", "name": "app.nexio.work",
    "content": proj_name + ".pages.dev", "ttl": 300, "proxied": True
}, base=ZONE_BAS)
if ad.get("success"):
    print("  app.nexio.work -> " + ad["result"]["content"] + " OK")

print("\n" + "=" * 50)
print("NEXIO OS DEPLOYED")
print("  Preview: https://" + dep_url)
print("  Live:     https://app.nexio.work (~60s DNS)")
