# Sprint handoff — profit-pulse UI session (2026-04-20)

**Repo:** `yasharnaghdi/profit-pulse`
**Branch:** `claude/setup-claude-agents-fM7YD`
**Session scope:** frontend-only, mock-data, zero backend or token edits
**Outcome:** invoice approval UI at `/invoices/:id` + dashboard action-row widgets, merged to `main` for 2026-04-21 continuation.

---

## Commits landed on this branch

1. `c3463b7` — `feat(invoices): mock invoice approval UI (v0 design, no backend)` — +735 / 13 files
2. `1264fcc` — `feat(dashboard): Expected Invoices, Quick Actions, This Month widgets` — +262 / 5 files

## Files created

```
public/mock-invoice.svg
src/lib/mock-invoices.ts
src/pages/InvoiceDetail.tsx
src/components/invoices/
  ConfidencePill.tsx
  ExtractedDataCard.tsx
  InvoiceHeader.tsx
  InvoiceLayout.tsx
  InvoiceSidebar.tsx
  InvoiceStatusBadge.tsx
  InvoiceViewer.tsx
  LabeledFieldWithConfidence.tsx
  USALIClassificationSplits.tsx
src/components/dashboard/
  ExpectedInvoicesCard.tsx
  QuickActionsCard.tsx
  ThisMonthMetricsCard.tsx
docs/handoffs/2026-04-20-ui-session.md  (this file)
```

## Files modified

- `src/App.tsx` — added `/invoices` → `/invoices/INV-2024-001` redirect + `/invoices/:id` route, both behind `ProtectedRoute allowedRoles=["manager","direction"]`
- `src/pages/Dashboard.tsx` — inserted new widget row into `ManagerDashboard` between margin trend and cost breakdown; direction view untouched
- `src/lib/mock-data.ts` — appended `mockExpectedInvoices` + `mockThisMonthMetrics` exports

## Guardrails held (per `.claude/CLAUDE.md`)

- Zero edits to `src/index.css`, `tailwind.config.ts`, or any design token
- Zero font swaps
- Six MVP routes preserved; `/invoices/:id` reachable by URL only, not in main nav (approved by user during plan mode)
- `src/contracts/index.ts` untouched

## CI routine results (local, sandbox)

- `tsc --noEmit`: clean (0 errors)
- `eslint` on new files: clean (0 problems). Pre-existing lint errors in `Insights`, `ProfitLoss`, `MultiProperty`, `MaterialityMatrix`, `ui/command`, `ui/textarea`, `tailwind.config` — **not introduced by this session**.
- `vite build`: fails on pre-existing `framer-motion` import in `src/pages/DataVault.tsx`. Sandbox npm registry returns 403 on `framer-motion`, `@supabase/supabase-js`, `vitest`, `@playwright/test`. Not caused by this branch; reproduces on `main`.
- No `.github/workflows/` yet in repo.

## GitHub activity on sibling repo

Reviewer-context comments posted on `finops-platform-profix`:

- PR #26 (multi-tenant RLS) — comment `4284304511`
- PR #28 (invoice PDF → Data Vault) — comment `4284303164`

> **⚠ STALE note on #28 comment:** recommends merge order `#26 → #28 → main`. The inverted plan decided in the parallel session is `#28 → main` directly, with `#26` deferred to the 24–48h buffer. A follow-up addendum on #28 is needed (not posted yet).

## Contract coupling to finops PR #28

`src/lib/mock-invoices.ts` types are 1:1 with PR #28's Data Vault schema. Swap path when #28 lands on finops `main`:

1. Mirror `finops/backend/app/api/schemas.py` invoice types into `profit-pulse/src/contracts/index.ts`
2. Replace `getMockInvoice(id)` with a TanStack Query hook against `GET /upload/invoices/{job_id}`
3. Field names already match: `vendor`, `invoice_number`, `amount`, `invoice_date`, `due_date`, `gl_code` + per-field `confidence: number`; `status: "pending_approval" | "approved" | "rejected"`

> Splits model (`sat_invoice_line_splits`, one invoice line → N USALI buckets with `percent`) is **NOT in PR #28**. Needs a follow-up backend PR before the USALI splits UI becomes live.

## Open decisions (user unanswered at session end)

- 4-tab sidebar grouping: (a) `Dashboard · Invoices · Data · Settings`, (b) `Overview · Dashboard · Insights · Data`, (c) `Dashboard · Invoices · Insights · Settings`
- CI automation scope: `CONTRIBUTING.md` + `ci.yml` + `pr-title.yml` + `release.yml` + release-please config
- Stale #28 comment disposition: (a) addendum, (b) edit, (c) leave
- 100-hotel campaign cloud fork: AWS or GCP

## Safe for next agent to pick up

- Rebase `finops #28` onto `origin/main` (Hour 0–3 in the 48h plan)
- Post addendum on `#28` clarifying the inverted merge order — or edit the prior comment
- Start sidebar 4-tab refactor once the user picks the grouping
- Set up `.github/workflows/` on profit-pulse (none exist yet)
- Parallel agent's `.mcp.json` setup — status unknown at time of handoff, not yet on either branch

## Do NOT redo

- Do not rewrite `src/lib/mock-invoices.ts` or any `src/components/invoices/*`
- Do not touch the `ManagerDashboard` widget row (Expected Invoices / Quick Actions / This Month)
- Do not add design tokens or change fonts
- Do not duplicate reviewer comments on `finops #26` / `#28` (already posted)
- Do not re-open this UI work as a new PR — it's merged to `main`

## What's live at `main` after this merge

- `/invoices/:id` route rendering the mock approval UI
- Manager dashboard's new action row
- This handoff document at `docs/handoffs/2026-04-20-ui-session.md`

Next session picks up from a clean `main` with all three landed.
