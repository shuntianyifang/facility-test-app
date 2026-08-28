# Taskroom engineering contract

- This is a disposable local test application, not a production service.
- Keep React/Vite + Fastify + TypeScript; state is in memory and resets on restart.
- Never add provider keys, personal data, login, billing, or live third-party dependencies.
- Provision with `pnpm install --frozen-lockfile` and `pnpm setup` (Linux CI also needs Playwright system dependencies).
- Validate with `pnpm verify`. Do not weaken checks, delete tests, or add skipped tests to pass CI.
- Add regression tests for behavior changes. Use unit tests, Fastify injection, and browser E2E tests.
- Use Conventional Commit subjects and matching PR titles. Work on a feature branch, never push directly to main or merge a PR.
- Human approval of the plan and final PR is required.
- Keyword search is intentionally absent in the baseline. Implement it only when assigned that Issue.
