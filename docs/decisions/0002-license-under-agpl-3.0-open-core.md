# ADR-0002: License under AGPL-3.0 (open-core model)

- **Status:** ACCEPTED
- **Date:** 2026-07-28
- **Decider:** Fefe (CEO, FATAPLUS)
- **Consulted:** ZCode agent (brainstorming partner)

## Context

Nexio OS may eventually be offered as a managed cloud product
("Nexio OS Cloud") alongside the self-hostable open-source version. We
need a license that:

1. Allows anyone to read, fork, and self-host the code.
2. **Blocks** a competitor from taking the code, hosting it as a SaaS,
   and selling it without contributing improvements back.
3. Lets FATAPLUS itself offer a paid managed version without violating
   its own license.

## Decision

License Nexio OS under **AGPL-3.0-or-later**, with a future
**Enterprise Edition** folder (`ee/`) reserved for paid-only features
(SSO, multi-tenant, audit log export, advanced analytics).

## Rationale

- AGPL-3.0's network-use clause (§13) closes the "SaaS loophole" that
  MIT and Apache leave open: anyone exposing a modified version over
  the network must publish their modifications.
- This is the proven model of Twenty, Midday, Plausible, Cal.com,
  GitLab Community Edition, and many others. The pattern is well
  understood by the community and by potential commercial users.
- It preserves FATAPLUS's ability to dual-license: offer AGPL for free,
  sell a commercial license to enterprises who cannot accept AGPL.
- The "open-core" structure (free core + paid `ee/`) keeps the
  community honest while funding development.

## Alternatives considered

- **MIT / Apache-2.0:** rejected. Anyone could rehost and compete.
- **BSL (Business Source License):** rejected for now. BSL is more
  protective but is not OSI-approved, which creates adoption friction.
  We revisit if AGPL proves insufficient.
- **All-rights-reserved (proprietary):** rejected. Loses the portfolio
  and community benefits of open source, and contradicts FATAPLUS's
  CURIOSITY value.

## Consequences

- **Positive:** Code is public on GitHub, showcasing FATAPLUS craft.
  Community contributions become possible after Phase 1 ships.
- **Positive:** Clear legal moat against SaaS copycats.
- **Negative:** Some enterprises refuse AGPL software on principle. The
  commercial license (sold separately) addresses this.
- **Negative:** Trademark "Nexio OS" and brand assets are NOT covered by
  AGPL. Must be documented clearly in README and CONTRIBUTING.

## Trademark notice

The AGPL-3.0 license covers source code only. The marks "Nexio OS",
"Nexio-work", the lime-on-eclipse visual identity, and any brand assets
in `docs/brand/` remain the property of Nexio-work / FATAPLUS. Use of
these marks in a derivative project requires written permission.

## References

- AGPL-3.0 full text: https://www.gnu.org/licenses/agpl-3.0.txt
- Twenty CRM license model: https://github.com/twentyhq/twenty
- Midday license model: https://github.com/midday-ai/midday
