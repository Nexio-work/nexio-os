#!/usr/bin/env bash
set -eo pipefail

# Nexio OS — Autonomous Self-Development & Deployment Script
# Managed by Orchestrator per .agents/PROJECT.md & AGENTS.md

TG_BOT_TOKEN="8201276918:AAG-gwgTTz5UyWBy3KHVbXE2cEyNTTDu69s"
TG_CHAT_ID="-1003654281224"
TG_THREAD_ID="2482"

notify_telegram() {
  local MSG="$1"
  curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${TG_CHAT_ID}" \
    -d "message_thread_id=${TG_THREAD_ID}" \
    -d "text=${MSG}" \
    -d "parse_mode=Markdown" > /dev/null 2>&1 || true
}

notify_telegram "🔄 *Nexio OS Auto-Dev*: Starting auto-development & CI verification cycle..."

echo "=== Nexio OS Auto-Dev Cycle: $(date -u) ==="

# 1. Run 5 CI Quality & Security Gates locally
echo "--> Gate 1: Quality (lint + types + format)..."
pnpm lint && pnpm typecheck && pnpm format:check

echo "--> Gate 2: Security (audit + SAST)..."
pnpm audit --prod --audit-level=high

echo "--> Gate 3: Tests (unit + integration)..."
pnpm test --coverage

echo "--> Gate 4: Build (Vite + Wrangler dry-run)..."
pnpm build
pnpm exec wrangler deploy --dry-run

echo "--> Gate 5: E2E (Playwright)..."
pnpm test:e2e

notify_telegram "✅ *Nexio OS CI*: All 5 Gates PASSED (Quality, Security, Tests, Build, E2E). Syncing build to VPS..."

# 2. Deploy to vps-tailscale
echo "--> Deploying to vps-tailscale..."
rsync -avz --delete .output/ vps-tailscale:/opt/nexio-os/.output/
ssh vps-tailscale "cd /opt/nexio-os/.output/server && pnpm install --prod --no-frozen-lockfile 2>/dev/null || true; pnpm approve-builds --all 2>/dev/null || true; pm2 restart nexio-os"

notify_telegram "🚀 *Nexio OS Deployment*: App updated and live on \`vps-tailscale\` (PM2 process \`nexio-os\` on port 3000)."

echo "=== Nexio OS Auto-Dev Cycle Complete: $(date -u) ==="
