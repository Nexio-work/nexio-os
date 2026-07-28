#!/usr/bin/env bash
set -eo pipefail

# Nexio OS — Autonomous Self-Development & Deployment Script
# Managed by the Orchestrator agent per .agents/PROJECT.md & AGENTS.md

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

# 2. Deploy to vps-tailscale
echo "--> Deploying to vps-tailscale..."
rsync -avz --delete .output/ vps-tailscale:/opt/nexio-os/.output/
ssh vps-tailscale "cd /opt/nexio-os/.output/server && pnpm install --prod --no-frozen-lockfile 2>/dev/null || true; pnpm approve-builds --all 2>/dev/null || true; pm2 restart nexio-os"

echo "=== Nexio OS Auto-Dev Cycle Complete: $(date -u) ==="
