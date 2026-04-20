# Profit Pulse — Claude Code Project Memory

Profit Pulse is the MVP UI lab for Profix. Purpose: rapid-iteration React
frontend that hands off proven screens to `finops-platform-profix/web/`.

## Stack

- React 19 + Vite + TypeScript + Tailwind + shadcn/ui
- Bun for install/dev; Vitest for unit; Playwright for E2E
- Mock data backed by `fetchWithFallback<T>()` wrapping `VITE_API_BASE`
- Design: dark green `#0b2b27`, lavender accent `#b8a9e8`, DM Sans / DM Mono

## What's contract-locked

- `src/contracts/index.ts` — API types mirrored from `finops-platform-profix/backend/app/api/schemas.py`. **Do not drift.** If the backend contract changes, sync here in the same PR.
- The six MVP page routes: Overview, Dashboard, P&L, Insights, Data Vault, Settings. Anything else is gated behind `PlannedFeature`.

## Sibling repo

The production frontend lives at `yasharnaghdi/finops-platform-profix` under
`web/`. Components that graduate from here land there. See the README table
for the current handoff candidates.

## What Claude should NOT do without asking

- Add a new top-level route to navigation — MVP is locked at 6 routes.
- Edit `src/contracts/index.ts` — contract change must originate in the backend repo.
- Add a new heavy dependency (charting, state lib, animation). Prefer shadcn primitives.
- Ship a screen without Empty / Error / Loading states from `src/components/ui/states.tsx`.
- Touch the design tokens or swap fonts.

## Claude subagents here

See `.claude/agents/`:

- `ui-engineer` — feature UI, hooks, pages, contract-safe fetch wiring
- `design-qa` — a11y, visual consistency, empty/error/loading coverage, responsive checks

Heavier lanes (sales, onboarding, maintenance, product-backend) live in the
`finops-platform-profix` repo; this repo is UI-only.

## Checks before reporting done

```bash
bun run test
bun run build
npx tsc --noEmit
# If visual changes:
bun run dev    # and verify in browser
```
