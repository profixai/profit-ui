# Profix — AI-Driven Cost Clarity for Hotel Finance Teams

> MVP UI lab for the Profix platform. This repo is the converged frontend
> that will hand off to `finops-platform-profix/web`.

## Quick Start

```bash
bun install
bun run dev
```

Login with demo credentials:
- `inventory` / `inv2026` → Operator role
- `manager` / `mgr2026` → Manager role
- `direction` / `dir2026` → Admin role

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | FastAPI backend URL (default port 8100). Leave empty for mock data. |
| `VITE_TENANT_ID` | Local-dev fallback tenant id when JWT claim is unavailable. |

## Production-readiness layer (Tasks 1–5)

- **Backend status** — `/health` is polled every 60s by `BackendStatusContext`. The Context Bar shows a Live / Degraded / Offline · Mock dot on every page.
- **Contracts** — `src/contracts/index.ts` and `src/services/api.ts` are marked `CONTRACT — must mirror backend finops-platform-profix exactly`. All calls go through `fetchWithFallback<T>()`, returning the canonical `APIResponse<T>` envelope and falling back to mock silently on failure.
- **JWT + tenant** — `getAuthHeaders()` injects `Authorization: Bearer <supabase-jwt>` on every authenticated call and resolves `tenant_id` from JWT claims (with `VITE_TENANT_ID` fallback). Missing tenant → console warn + mock fallback, never a UI break.
- **Tier gating** — `useTier()` + `<TierGate requires="team|enterprise">` gate AI Insights and Telegram notifications. Free tier still sees the full MVP shell with an in-place upgrade card.
- **Value-selling layer** — `<ValueMetricBar />` and `<CompetitivePositionTable />` appear only for the Admin (`direction`) role: on Overview and on the dedicated `/why-profix` page.

## Architecture

- **Contracts** — `src/contracts/index.ts` defines the canonical API types (contract-locked).
- **Services** — `src/services/api.ts` uses `fetchWithFallback<T>()` to call the real backend or return mock data in the same `APIResponse<T>` envelope.
- **Hooks** — `src/hooks/use*.ts` wrap service calls with loading/error/retry state.
- **Pages** — MVP pages only: Overview, Dashboard, P&L, Insights, Data Vault, Settings.
- **Design System** — Dark green palette (#0b2b27), lavender accent (#b8a9e8), DM Sans/DM Mono fonts.

## Onboarding Candidates for Production Web App

The following screens and components can be ported directly into `finops-platform-profix/web` onboarding:

| Component / Screen | Path | Notes |
|---------------------|------|-------|
| Login page | `src/pages/Login.tsx` | PROFiX branding, geometric BG, role-based redirect |
| Overview decision panels | `src/pages/Overview.tsx` | North Star KPI, What Changed, Next Best Action |
| Data Vault upload | `src/pages/DataVault.tsx` | Drag-and-drop with anomaly detection |
| Empty / Error / Loading states | `src/components/ui/states.tsx` | Reusable across all pages |
| Property selector / Context Bar | `src/components/ContextBar.tsx` | Global property + period + freshness |
| Geometric background | `src/components/GeoBg.tsx` | SVG pattern overlay |
| PlannedFeature gate | `src/components/PlannedFeature.tsx` | "Coming Soon" pattern for gated features |
| Ask Profix AI panel | `src/components/AskProfixPanel.tsx` | Slide-out AI chat |

## Non-MVP Features (Planned)

These features exist in code but are hidden from navigation and gated behind `PlannedFeature`:

- Inventory advanced workflows
- MultiProperty portfolio view
- ESG Barometer
- CAPEX Roadmap
- Materiality Matrix
- Quarterly Ledger
- CSRD Reporting
- Enterprise governance
- WhyProfix sales page

## Testing

```bash
bun run test        # unit tests
bun run build       # production build check
```
