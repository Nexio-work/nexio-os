<!--
  Thank you for contributing to Nexio OS.
  This template is mandatory. Fill every section, or the PR will be closed.
  The reviewer agent will parse these sections to gate the merge.
-->

## Summary

<!-- One paragraph. What does this PR change, and why? -->

## Type

<!-- Check one. Conventional Commit prefix must match. -->

- [ ] `feat` — New feature
- [ ] `fix` — Bug fix
- [ ] `refactor` — No behavior change
- [ ] `perf` — Performance only
- [ ] `docs` — Documentation only
- [ ] `chore` — Tooling, deps, CI
- [ ] `test` — Tests only

## Scope check

<!-- A PR must address ONE concern. Tick every box. -->

- [ ] This PR addresses exactly one issue or feature.
- [ ] The diff stays under ~400 lines (excluding lockfile and generated code).
- [ ] No unrelated reformatting, no drive-by changes in other modules.

## Verification

<!-- What did you do to prove this works? -->

- [ ] `pnpm lint` passes locally.
- [ ] `pnpm typecheck` passes locally.
- [ ] `pnpm test` passes locally.
- [ ] `pnpm build` succeeds locally.
- [ ] I manually tested the change in the browser (describe below).

**Manual test:** <!-- What did you click, type, and see? -->

## Anti-slop check (per AGENTS.md)

<!-- The reviewer agent will reject the PR if any of these is unchecked. -->

- [ ] I read AGENTS.md before writing this code.
- [ ] No fake macOS / app-window mockup as decoration.
- [ ] No blue-purple gradient, glowy pill button, icon-in-a-tile, or floating-card stack.
- [ ] Content is visible by default. No opacity:0 entrance animations.
- [ ] All interactive controls actually work (no dead tabs, no fake buttons).
- [ ] Text clears its background by a real contrast gap.

## Risk & rollback

<!-- What could break? How do we revert? -->

- **Risk:** <!-- low / medium / high, and why -->
- **Rollback:** <!-- revert this PR / feature flag / migration down -->

## Linked issues

<!-- Closes #123, Refs #456. Leave empty if none. -->
