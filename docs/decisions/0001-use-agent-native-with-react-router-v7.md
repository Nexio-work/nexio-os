# ADR-0001: Use agent-native framework with React Router v7

- **Status:** ACCEPTED
- **Date:** 2026-07-28
- **Decider:** Fefe (CEO, FATAPLUS)
- **Consulted:** ZCode agent (brainstorming partner)

## Context

Nexio OS is a personal business OS where an AI agent and a UI must operate
on the same data through the same operations. We considered three stack
options for the MVP:

1. **Next.js 15** + custom agent layer. Familiar to FATAPLUS (used on
   MADACUP, Mochogo, JPM) but requires re-implementing the agent-native
   helpers for the Next.js runtime.
2. **React Router v7 + Vite + Nitro** (the native agent-native stack).
   Less familiar but zero-friction with the framework we chose to adopt.
3. **Tauri desktop + PWA web**. Native windows but double codebase and
   outside the Cloudflare stack FATAPLUS already operates.

## Decision

We adopt **option 2**: React Router v7 (framework mode) + Vite + Nitro +
Drizzle + Cloudflare, scaffolded via the agent-native CLI
(`npx @agent-native/core create nexio-os`).

## Rationale

- The agent-native framework's "define work once" principle (one action =
  UI + agent + HTTP + MCP + CLI) is exactly the architecture Nexio OS
  needs. The agent can do what the UI does because both call the same
  action.
- React Router v7 + Nitro deploys natively to Cloudflare Workers, with no
  `next-on-pages` workaround. We already run Wrangler 4.88 and D1/R2.
- Vite's HMR (~200ms) is significantly faster than Next.js dev (~3s),
  which matters for a daily-used PWA.
- The agent-native templates (chat, tasks, mail, files) give us a head
  start on Phase 2 modules without locking us in.

## Alternatives considered

- **Next.js 15**: rejected because re-implementing agent-native helpers
  for the Next.js runtime would be ongoing maintenance work and would
  diverge from upstream.
- **Tauri**: rejected for MVP because it doubles the codebase and breaks
  the "browser-first PWA" principle.
- **SvelteKit**: not compatible with agent-native (React-only).

## Consequences

- **Positive:** Faster dev cycle, native Cloudflare deploy, no framework
  fight with agent-native.
- **Negative:** React Router v7 framework mode is newer than Next.js;
  fewer community resources. Mitigation: it is the continuation of
  Remix, which has mature docs.
- **Negative:** We diverge from the rest of the FATAPLUS portfolio
  (Next.js). Mitigation: this divergence is intentional and documented
  here; we are not migrating existing sites.

## References

- agent-native framework: https://github.com/BuilderIO/agent-native
- React Router v7 framework mode: https://reactrouter.com/start/framework
- FATAPLUS brand foundations: `02-Organization/Fataplus/BRAND-FOUNDATIONS.md`
