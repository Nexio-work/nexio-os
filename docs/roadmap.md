# Nexio OS — Roadmap

> Living document. The orchestrator updates this after every merge.
> Fefe approves any change to the perimeter of a phase.

## North star

> The day Fefe opens Nexio OS before he opens Slack.

That is the only success metric that matters for Phase 1.

---

## Phase 0 — Setup (1 week, in progress)

**Goal:** Repo, agents, CI, docs. Ready to onboard any AI agent to code.

- [x] Tag legacy monorepo (`v0.1.0-legacy`, branch `legacy-monorepo`).
- [x] Reset `main` clean.
- [x] Add `AGENTS.md` (anti-slop law).
- [x] Add `.agents/` prompts (orchestrator, backend, frontend, QA, reviewer, PR manager).
- [x] Add `.agents/PROJECT.md` (manifest).
- [x] Add CI/CD: 5 gates + preview deploy + release.
- [x] Add ADR-0001 (stack), ADR-0002 (license), ADR-0003 (mock Hermes).
- [x] Add changelog, roadmap, README, LICENSE (AGPL-3.0).
- [ ] Scaffold app via `npx @agent-native/core create` (after this PR merges).
- [ ] First green CI on `main`.

## Phase 1 — MVP (6–8 weeks)

**Goal:** Fefe can run his day from Nexio OS.

- [ ] **Shell OS** — sidebar, top bar, command palette (Cmd+K).
- [ ] **Newsfeed** — 4 card types: task, agent output, external signal, nudge.
- [ ] **Agent chat** — pi.dev SDK + 9Router + `defineAction` tools.
- [ ] **Tasks** — CRUD via unified actions.
- [ ] **Files (read-only)** — browse R2, preview, attach to tasks.
- [ ] **Hermes mock** — morning briefing, suggest next actions, learn events.
- [ ] **PWA** — installable, web push, offline shell.
- [ ] **Deploy** — Cloudflare Pages production.

### Phase 1 definition of done

1. Fefe can post a task and see it in the feed.
2. Fefe can ask the agent (via Cmd+K) to create a task; the agent calls
   the same `createTask` action and the task appears in the feed.
3. Fefe can browse R2 files from the Files module.
4. Every morning at 7:00 local, the mock Hermes pushes 3 briefing cards.
5. The app is installable as a PWA on iOS and macOS Safari.
6. The 5 CI gates are green on `main` for a full week.

## Phase 1.5 — Windows (3 weeks)

**Goal:** Real desktop metaphor with floating windows.

- [ ] Drag-resize windows on desktop ≥1024px.
- [ ] Mobile responsive "single view" mode.
- [ ] Snap layouts (left/right halves).
- [ ] Window state persisted across sessions.

## Phase 2 — Modules (8–12 weeks)

**Goal:** The OS becomes the only surface Fefe needs.

- [ ] **Mail** — unified inbox (Gmail, WhatsApp, Telegram, Instagram DM).
- [ ] **Office** — invoices, finance, basic accounting.
- [ ] **Files (full)** — upload, edit, version history.
- [ ] **Reels** — short-video feed aligned with Fefe's interests.

Each module ships independently, behind its own feature flag.

## Phase 3 — Scale

**Goal:** Nexio OS becomes a product, not just Fefe's tool.

- [ ] Multi-user (team FATAPLUS).
- [ ] Multi-tenant (commercial offering).
- [ ] Real Hermes integration (per ADR-0003 migration plan).
- [ ] Optional native mobile app (Expo) if PWA limits bind.

---

## Out of scope (will not build)

- A fake macOS mockup. The shell is real or it does not ship.
- A chatbot UI with no tools. The agent acts or it does not ship.
- Anything listed as "slop" in AGENTS.md. Ever.

## Glossary

- **Action:** A unified operation defined once and called by UI, agent,
  HTTP, MCP, and CLI. Lives in `src/actions/`.
- **Feed item:** A row in the newsfeed. Has a type (task, agent output,
  external signal, nudge) and a source.
- **9Router:** The OpenAI-compatible LLM gateway at
  `http://100.112.45.36:20128` on Tailscale.
- **Hermes:** The external self-learning agent service. Mocked for MVP.
- **Briefing:** A daily morning card set produced by Hermes (mock or real).
