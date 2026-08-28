# Taskroom test standard

This is an in-memory React/Vite, Fastify and TypeScript test application, not a production service.
Data resets on server restart. Keep login, payments, billing and external databases out of scope.

## Local Facility execution

- `.facility.json` selects local Facility execution for planning and implementation.
- Use the Codex engine with `deepseek-v4-flash` through the Facility gateway only.
- Keep the real provider key in Facility's encrypted local provider settings, never in this repository,
  a sandbox, a browser bundle or GitHub Actions. The sandbox receives a revocable run-scoped key.
- The run-scoped model allowlist must contain only `deepseek-v4-flash`.
- Do not add a Facility price table or amount budget. Zero recorded cost is not free usage;
  actual charges are shown by DeepSeek.
- Do not enable scheduled agents, automatic repair loops, automatic model workflows or automatic merges.
- Before enabling a development agent, a human must merge the governance configuration; the operator
  must then verify default-branch fingerprints and enable Facility's required Builder plan gate.
- A human approves the Architect plan before implementation, then reviews and merges the resulting PR.
  Agents must never approve their own plans, approve reviews, merge PRs or bypass branch protection.

## Reproducible checks

1. Install dependencies: `pnpm install --frozen-lockfile`.
2. Prepare the browser: `pnpm setup` (Linux CI also installs Playwright system dependencies).
3. Run `pnpm verify`: lint, type checking, unit/API tests and Playwright E2E, including the production build.
4. Add regression tests for changed behavior. Do not delete, skip or weaken checks to pass.

CI uses deterministic local test data and does not call a model or require provider credentials.
Keep Conventional Commit subjects and matching PR titles. Preserve the repository's existing
`AGENTS.md` contract. Keyword search remains absent until its dedicated Issue is assigned.
