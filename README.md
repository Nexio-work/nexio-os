# Nexio OS

> The personal business operating system for makers.
> One unified surface where an AI agent, your tasks, your signals and your
> files coexist in a single desktop metaphor.

<p>
  <strong>Status:</strong> Phase 0 — Setup<br>
  <strong>License:</strong> AGPL-3.0-or-later (open-core)<br>
  <strong>Stack:</strong> React Router v7 · Vite · Nitro · Drizzle · Cloudflare
</p>

---

## What this is

Nexio OS is not another chatbot app. It is a **real operating system for one
person's work** — a personal command center where:

- An **AI agent** can do everything the UI can do, because both speak to the
  same unified actions layer.
- A **newsfeed** aggregates tasks, agent outputs, external signals and
  proactive nudges into a single stream.
- A **desktop metaphor** (sidebar, windows, command palette) provides the
  spatial grammar of a real workspace, not a flat chat UI.

Self-host it for free. Or run it on **Nexio OS Cloud** (paid, managed,
future) when you don't want to operate infra.

## Why AGPL-3.0

The code is open. You can read it, fork it, run it, modify it. But you cannot
take it, host it as a competing SaaS, and keep your improvements closed. Any
network-facing derivative must share its source. This is the same model used
by Plausible, Cal.com, Twenty and Midday.

## Repository layout

```
nexio-os/
├── .agents/        # Agent prompts and contracts (orchestrator, backend, ...)
├── .github/        # CI/CD pipelines (5 gates: lint, types, tests, security, build)
├── docs/           # Architecture, ADRs, runbooks
├── src/            # Source code (after scaffolding)
├── tests/          # Unit, integration, e2e
├── AGENTS.md       # The slop design law (binding on every agent)
└── LICENSE         # AGPL-3.0
```

## Development

Requirements: Node 22+, pnpm 11+, Wrangler 4+.

```bash
pnpm install
pnpm dev          # local dev server (Vite + Nitro)
pnpm test         # Vitest
pnpm build        # production build
pnpm deploy       # wrangler deploy
```

See `docs/architecture/overview.md` for the full picture.

## Contributing

This is currently a single-operator project (Fefe, CEO @ FATAPLUS). External
contributions will be welcomed once Phase 1 ships. Until then, the
`.agents/` directory contains the prompts that govern how AI agents work on
this repo — read them before opening a PR.

## License

Copyright © 2026 Nexio-work / FATAPLUS. Released under AGPL-3.0-or-later.
See [LICENSE](./LICENSE) for the full text. The trademark "Nexio OS" and the
brand assets are not covered by the AGPL license; contact us for commercial
use beyond the AGPL terms.
