# Nexio OS — Project Manifest

> **READ THIS FIRST.** Every agent working on this repo — orchestrator,
> backend, frontend, QA, reviewer, PR manager, or any external agent
> invoked from Hermes, Kun, gbrain, ZCode, or elsewhere — must read this
> file in full before touching anything. If you skip it, you will ship
> slop and break the contract.

---

## 1. What is Nexio OS?

Nexio OS is the **personal business operating system** of Fefe, CEO of
FATAPLUS. It is not an app. It is a workspace OS — a unified surface where
an AI agent, a newsfeed of tasks and signals, and a file browser coexist
in a desktop metaphor.

**One sentence pitch:** *The OS for one person's work, where the agent can
do everything the UI can do because both speak to the same actions layer.*

## 2. The product signature

A Nexio OS screen must always show **at least one** of these signatures:

1. **A real desktop shell** — sidebar + top bar + command palette. Not a
   flat chat UI, not a single column of cards. A workspace with spatial
   grammar.
2. **A unified feed** — mixing tasks, agent outputs, external signals and
   nudges in one stream, with a clear visual distinction per source.
3. **An agent that acts** — not a chatbot. When the agent proposes a task,
   you can see the underlying `defineAction` call. The agent's work is
   observable, not magic.

If a screen shows none of these, it is not Nexio OS.

## 3. The non-negotiable laws

These three documents bind every agent. Read them before writing a line:

| Document | Authority | Why |
|---|---|---|
| `AGENTS.md` (root) | **The slop design law.** Read it before AND after every UI change. | Nexio OS is a designed product, not a template. |
| `.agents/<role>.md` | Role-specific prompt and checklist. | Each agent has a strict perimeter. |
| `docs/decisions/` | ADRs (Architecture Decision Records). | Decisions are dated, justified, reversible-on-purpose. |

**Never override these with "I know better" instinct.** Fefe's explicit
word overrides defaults. Nothing else does.

## 4. The stack (do not improvise)

| Layer | Technology | Why |
|---|---|---|
| Frontend framework | **React Router v7** (framework mode) | Native to the agent-native framework. |
| Build tool | **Vite** | Native to RR7 + agent-native. |
| Server engine | **Nitro** | Native to agent-native, deploys to Cloudflare. |
| ORM | **Drizzle** | Native to agent-native, type-safe, works with D1. |
| Database | **Cloudflare D1** | Edge-native, already in the FATAPLUS stack. |
| Object storage | **Cloudflare R2** | Same. |
| Hosting | **Cloudflare Pages + Workers** | Same. |
| Agent runtime | **Pi.dev SDK** (`@earendil-works/pi-coding-agent`) | Lifecycle, branching, tool calling. |
| LLM gateway | **9Router** (OpenAI-compatible, Tailscale `100.112.45.36:20128`) | Routes to Claude/GPT/Mistral without code changes. |
| Framework | **agent-native** (`@agent-native/core`) | Define work once: UI + agent + HTTP + MCP + CLI. |
| Package manager | **pnpm 11+** | Required by agent-native. |
| Node | **22 LTS** | Current LTS, required by Wrangler 4. |

Do not introduce Next.js, Tailwind global, Jest, Express, or any framework
that conflicts with the above without an ADR.

## 5. The MVP perimeter (Phase 1)

**IN** (6–8 weeks):

- Shell OS: sidebar, top bar, command palette (Cmd+K).
- Newsfeed: 4 card types (task, agent output, external signal, nudge).
- Agent chat: pi.dev SDK + 9Router, with `defineAction` tools.
- Tasks: CRUD via unified actions.
- Files: browse R2, preview, attach.
- Hermes API contract: mocked implementation behind the real contract.

**OUT** (do not implement):

- Floating drag-resize windows (Phase 1.5).
- Multi-user, roles, collaboration.
- Mail, Office, Reels modules (Phase 2+).
- Native push notifications (web only for now).
- Mobile-first layout (desktop ≥768px first).

If a PR adds scope from OUT, the reviewer must reject it.

## 6. The agents (perimeters)

```
Fefe (CEO, only human)
   │
   ▼
Orchestrator — plans, assigns, validates coherence, keeps roadmap
   │
   ├──▶ Backend specialist — Drizzle, Nitro routes, 9Router, pi.dev SDK
   ├──▶ Frontend expert     — RR7 components, design system FATAPLUS V3
   ├──▶ QA engineer         — test cases, e2e, edge cases, a11y
   ├──▶ Reviewer            — code quality, security, anti-slop enforcement
   └──▶ PR manager          — squash, merge, link issues, changelog
```

The full prompts live in `.agents/<role>.md`. Every agent must read its
own prompt and the orchestrator's prompt before starting work.

## 7. Workflow (GitHub Flow, strict)

- `main` is protected. No direct push, even by Fefe.
- One PR = one concern. Max ~400 lines diff (excl. lockfile, generated).
- Branches: `feat/<module>-<topic>` · `fix/<module>-<topic>` ·
  `docs/<topic>` · `chore/<topic>` · `hotfix/<topic>`.
- Conventional commits: `feat(tasks): add create action`.
- PR title = first commit (will be the squash title).
- The CI has 5 gates: lint + typecheck + tests + security + build.
  All 5 must be green before merge.
- Auto-merge ON when CI is green + review approved.

## 8. Where things live

```
src/
├── actions/    Unified actions (UI + agent + HTTP + MCP). One file per domain.
├── components/ React components. shell/, feed/, agent/, tasks/.
├── db/         Drizzle schema + migrations.
├── lib/        Infrastructure clients (9router, hermes, pi-dev).
├── routes/     React Router v7 file-based routes.

docs/
├── architecture/   How the system is wired.
├── decisions/      ADRs. One decision per file, numbered.
├── runbooks/       Ops procedures (deploy, rollback, restore).
└── agents/         Notes on agent behavior, eval results.

.agents/        Prompts and contracts. Source of truth for agent identity.
.github/        CI/CD, CODEOWNERS, PR template.
tests/          Unit (Vitest), integration, e2e (Playwright).
```

## 9. Secrets

- **Never commit secrets.** `.dev.vars`, `.env*`, `*.pem`, `*.key` are gitignored.
- Dev secrets go in `.dev.vars` (gitignored). Template: `.dev.vars.example`.
- Prod secrets live in Cloudflare Workers secrets (`wrangler secret put`).
- CI secrets live in GitHub Actions secrets.

## 10. When in doubt

1. Read `AGENTS.md` again.
2. Read your role prompt in `.agents/<role>.md`.
3. Open or read the relevant ADR in `docs/decisions/`.
4. If still unclear, write a draft ADR proposing a decision and ask Fefe.
5. Never ship code that "felt right" without one of the above backing it.

---

*Last updated: 2026-07-28 · Phase 0 — Setup.*
