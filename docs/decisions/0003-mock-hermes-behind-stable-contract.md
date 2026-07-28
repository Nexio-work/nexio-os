# ADR-0003: Mock Hermes behind a stable contract for MVP

- **Status:** ACCEPTED
- **Date:** 2026-07-28
- **Decider:** Fefe (CEO, FATAPLUS)
- **Consulted:** ZCode agent (brainstorming partner)

## Context

FATAPLUS already operates **Hermes**, a self-learning agent service that
observes Fefe's work patterns and proactively orients his day. Nexio OS
wants to consume Hermes for the morning briefing, proactive nudges, and
long-term learning.

Hermes is a separate, complex service with its own lifecycle and roadmap.
Embedding it directly into the Nexio OS core would:

- Couple UI failures to agent failures (Hermes crash = Nexio OS crash).
- Block Nexio OS shipping while Hermes exposes no stable API.
- Prevent Hermes from being reused by other FATAPLUS products (Kun,
  gbrain).

## Decision

For Phase 1 (MVP), Nexio OS will **mock Hermes behind a stable TypeScript
contract**. The real Hermes service will drop in later without changing
any Nexio OS code.

The contract lives in `src/lib/hermes.ts` and exposes a `HermesClient`
interface with three methods:

```typescript
interface HermesClient {
  morningBriefing(input: { userId: string; timezone: string }):
    Promise<Result<BriefingItem[]>>;
  suggestNextActions(input: { userId: string; context: TaskContext[] }):
    Promise<Result<Suggestion[]>>;
  learn(input: { userId: string; event: LearnEvent }):
    Promise<Result<void>>;
}
```

The mock implementation calls **9Router** with a system prompt that
approximates Hermes' behavior. The types are stable; only the
implementation file changes when the real Hermes ships.

## Rationale

- **Decoupling:** Hermes can crash, restart, or migrate without taking
  Nexio OS down. Nexio OS shows a "Briefing unavailable" state and keeps
  working.
- **Parallel roadmaps:** Nexio OS Phase 1 ships on its own schedule,
  unblocked from the Hermes team's API work.
- **Reusability:** Hermes stays a service, callable from Kun, gbrain,
  and other future products.
- **Migration path:** When the real Hermes is ready, we replace the
  implementation file. The contract does not change. All callers
  (UI, agent tools, tests) keep working.

## Alternatives considered

- **Embed Hermes in the Nexio OS core:** rejected for coupling reasons
  (see Context).
- **Block Nexio OS on a real Hermes API:** rejected. Adds months to the
  MVP for a dependency we control.
- **No Hermes at all in MVP:** rejected. The proactive nudges are core
  to the product signature. A mocked approximation is enough to ship
  the UX.

## Consequences

- **Positive:** Phase 1 ships in 6-8 weeks, unblocked.
- **Positive:** Clean migration to real Hermes later.
- **Negative:** Mocked nudges will be lower-quality than real Hermes
  output. Mitigation: the mock uses real 9Router calls with a tuned
  system prompt, so it degrades gracefully.
- **Negative:** We must discipline ourselves to never let business logic
  leak into the mock. If the mock starts growing real logic, the
  migration will hurt.

## Migration plan (when real Hermes is ready)

1. Hermes exposes `/v1/morning-briefing`, `/v1/suggest`, `/v1/learn`
   matching the TypeScript contract.
2. Replace `src/lib/hermes-mock.ts` with `src/lib/hermes-http.ts`.
3. Run the existing test suite — it must pass unchanged.
4. Flip a feature flag in `wrangler.toml` to switch implementations.
5. Observe for one week. Roll back via the flag if quality regresses.

## References

- 9Router (internal): http://100.112.45.36:20128/
- Pi.dev SDK: https://pi.dev/docs/latest/sdk
- ADR-0001: stack decision (9Router as LLM gateway)
