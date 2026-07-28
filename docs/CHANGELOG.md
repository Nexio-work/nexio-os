# Changelog

All notable changes to Nexio OS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
once it reaches v1.0.0. Pre-1.0 versions may break between minor bumps.

Categories:
- **Added** — new features (`feat`)
- **Changed** — changes to existing functionality (`refactor`, `perf`)
- **Deprecated** — soon-to-be removed
- **Removed** — removed features
- **Fixed** — bug fixes (`fix`)
- **Security** — vulnerability fixes

---

## Unreleased

### Added
- Project scaffolding: AGENTS.md (anti-slop law), README, LICENSE (AGPL-3.0).
- Agent contracts: orchestrator, backend, frontend, QA, reviewer, PR manager.
- CI/CD: 5-gate pipeline (quality, security, tests, build, e2e).
- Preview deploy workflow for every PR (Cloudflare Pages).
- Release workflow with semantic versioning and changelog extraction.
- Architecture Decision Records: ADR-0001 (stack), ADR-0002 (license), ADR-0003 (mock Hermes).
