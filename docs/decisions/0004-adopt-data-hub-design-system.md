# ADR-0004: Adopt the data.nexio.work design system for Nexio OS

- **Status:** ACCEPTED
- **Date:** 2026-07-28
- **Decider:** Fefe (CEO, FATAPLUS)
- **Consulted:** ZCode agent (brainstorming partner)

## Context

Three design systems were on the table for Nexio OS:

1. **FATAPLUS V3** (documented in `02-Organization/Fataplus/DESIGN-SYSTEM-V3.md`):
   eclipse `#0C0F0C`, forest `#1B3300`, lime `#9FE870` accent, Inter + JetBrains Mono.
2. **data.nexio.work** (the live design at `data.nexio.work`, code in
   `Nexio-work/nexio-data-dashboard`): cream `#f5f1ea` substrate, warm
   charcoal `#1a1816` ink, terracotta `#b8451e` accent, forest `#2d5f3f`
   secondary, Instrument Serif + JetBrains Mono + system-ui body, square
   corners everywhere.
3. A from-scratch third option.

FATAPLUS V3 was the initial assumption. On review against `AGENTS.md`,
FATAPLUS V3 has two issues:

- Eclipse `#0C0F0C` is a cool blue-charcoal — the very "dark slop default
  palette" the AGENTS.md warns against.
- Lime `#9FE870` is a saturated accent — the "saturated accent color" tell
  when sprayed on dots, pills and buttons across a daily-used OS.

The data.nexio.work design was built later, with the AGENTS.md law in mind,
and has already shipped in production. It scores better on every line of
the slop law: cream substrate (not slop gray, not oat-milk beige default),
warm charcoal ink (not blue-charcoal), terracotta accent (no blue-purple
gradient anywhere), square corners (the inverse of rounded-everywhere),
Instrument Serif (not the Inter / Space Grotesk / Sora Google rotation).

## Decision

Nexio OS adopts the **data.nexio.work design system wholesale**. The tokens
below are the single source of truth for every Nexio OS surface.

```css
:root {
  /* Palette */
  --bg: #f5f1ea; /* cream substrate */
  --surface: #ffffff; /* cards on cream */
  --ink: #1a1816; /* warm charcoal text + fills */
  --ink-2: #5c574f; /* secondary text */
  --ink-3: #8a847a; /* tertiary, meta labels */
  --line: #d9d3c7; /* warm beige borders (NOT slop gray) */
  --line-2: #ebe6dc; /* lighter divider */
  --accent: #b8451e; /* terracotta — primary accent */
  --accent-soft: #f4e3dc; /* terracotta tint backgrounds */
  --accent-2: #2d5f3f; /* forest green — secondary accent */
  --accent-2-soft: #dce8df; /* forest tint backgrounds */
  --warn: #8a6d1b; /* amber for signals */
  --warn-soft: #f0e8d0; /* amber tint backgrounds */

  /* Type */
  --mono: "JetBrains Mono", ui-monospace, monospace;
  --serif: "Instrument Serif", Georgia, serif;
  --body: system-ui, -apple-system, sans-serif;
}
```

## Type roles

| Role    | Family                       | Where                                                                                                        |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Display | `--serif` (Instrument Serif) | Page titles, card titles, KPI values. Italic for signature accents (agent card).                             |
| Body    | `--body` (system-ui)         | Paragraphs, descriptions, default text.                                                                      |
| Data    | `--mono` (JetBrains Mono)    | Labels, codes, timestamps, amounts, meta tags. Uppercase + tracking only on real labels (file paths, codes). |

## Shape system

| Element         | Border-radius | Why                                         |
| --------------- | ------------- | ------------------------------------------- |
| Cards           | `0`           | Square, intentional, brutalist.             |
| Buttons         | `0`           | No pill, no rounded.                        |
| Inputs          | `0`           | Square.                                     |
| Chat bubbles    | `0`           | Square both sides.                          |
| KPI tiles       | `0`           | Square.                                     |
| Brand mark `NX` | `0`           | Strict square.                              |
| Live dot        | `50%`         | The one exception: a real status indicator. |

No `border-radius` on any container. This is the deliberate counter-slop
signature of Nexio OS.

## How the 4 FeedCards differentiate (without accent-bar tell)

The AGENTS.md law forbids the "accent-bar card" (a colored bar on the edge
of a card). The 4 card types differentiate through:

| Type       | Differentiation                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Nudge**  | `URGENT` mono badge + source label in terracotta.                                                                      |
| **Task**   | Neutral. Subtasks with forest-green checkmarks.                                                                        |
| **Agent**  | Title in italic Instrument Serif, forest color. Dark code preview of the `defineAction` call (the signature artifact). |
| **Signal** | Card background in `--warn-soft`. Stat in Instrument Serif.                                                            |

No edge bars. No glow. No hover-lift — hover is a border tonal shift
(`--line` → `--ink-3`).

## Alternatives considered

- **Keep FATAPLUS V3 (eclipse/lime).** Rejected: blue-charcoal ink and
  saturated lime violate the AGENTS.md law on a daily-used OS surface.
  FATAPLUS V3 stays valid for the FATAPLUS marketing site (different
  context, different use), but not for the OS.
- **Hybrid (Data Hub substrate + lime accent).** Rejected: lime on cream
  is a saturated accent on a warm substrate — reads as "AI startup
  landing". The terracotta is the considered alternative.
- **From-scratch third system.** Rejected: we already have a working,
  validated, production design system. Inventing a third is design for
  ego, not for the product.

## Consequences

- **Positive:** Nexio OS shares its design language with data.nexio.work.
  Users moving between the two feel continuity. Code patterns (CSS
  variables, component shapes) can be reused.
- **Positive:** Every AGENTS.md rule is satisfied by construction. The
  design was built under that law.
- **Negative:** Diverges from the FATAPLUS marketing site (which keeps
  FATAPLUS V3). Mitigation: forest `#2d5f3f` is the bridge token between
  the two systems.
- **Negative:** Instrument Serif is a free Google font. Per AGENTS.md
  "Type without the Google slop shelf", this is a risk. Mitigation:
  Instrument Serif is uncommon, used for editorial effect (italic
  signature) rather than as the house body voice, and the body voice is
  system-ui (genuinely neutral). Revisit if it starts reading as default.

## Migration plan

1. Update `.agents/frontend.md` to reference this ADR and the tokens above.
2. Update `.agents/PROJECT.md` §4 (the stack table) to reference this ADR
   for design tokens.
3. The Phase 1 implementation uses these tokens verbatim. No FATAPLUS V3
   token (`--eclipse`, `--lime`, `--mint`) appears in Nexio OS source.

## References

- Source design: `github.com/Nexio-work/nexio-data-dashboard/public/styles.css`
- AGENTS.md: sections on "Self-colored borders", "Bespoke geometry",
  "Say less", "Saturated accent color", "Cool blue-charcoal".
- Supersedes implicit assumption in ADR-0001 that FATAPLUS V3 would be used.
