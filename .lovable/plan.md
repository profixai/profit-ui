

## UI Finalization: Role-Based Workflow Product

This plan turns the current "SaaS catalogue" feel into a focused, role-based B2B workflow tool across 5 changes. No backend or data contract changes.

---

### Change 1: Role-Based UX

**Map existing roles to the new UX contexts:**
- `inventory` = Operator (sees: P&L, Insights, Data Upload, Settings)
- `manager` = Manager (sees: Overview, Dashboard, P&L, Insights, Data Upload, Portfolio, Settings)
- `direction` = Admin (sees: everything including `/why-profix`)

**Files:**
- `src/components/AppShell.tsx` — Rewrite `navSections` to remove the section-label structure and replace with a flat filtered list. Remove Enterprise nav item for non-direction roles. Add `/why-profix` only for `direction`.
- `src/App.tsx` — Add route for `/why-profix`. Update `allowedRoles` on `/enterprise` to `["direction"]` only. Update `RootRedirect`: inventory → `/inventory`, manager → `/dashboard`, direction → `/overview`.

**No changes to AuthContext or role types** — the three existing roles map directly.

---

### Change 2: Overview Page Refactor

**File: `src/pages/Overview.tsx` — Full rewrite**

Keep only:
1. **North Star KPI** — single prominent card (e.g. "GOP Margin: 42.8%") with delta badge
2. **Top 3 KPI cards** — keep existing `kpiOutcomes` but reduce to 3 operational ones (Time Saved, Anomaly Detection, Cost Variance)
3. **"What Changed" panel** — keep the existing `changeLog` card as-is
4. **"Next Best Action" panel** — new Card with a single recommended action (e.g. "Review F&B costs — 2 alerts pending") and a CTA button to navigate to the relevant page
5. **"Data Status" panel** — new Card showing last sync time, files uploaded this month, pending anomalies

Remove:
- Hero value statement / tagline
- "Upgrade to Team" prompt
- `CompetitiveComparison`
- `FeatureValueMatrix`
- `PackagingTiers`
- All imports for those removed components

---

### Change 3: Move Sales Content to `/why-profix`

**File: `src/pages/WhyProfix.tsx` — Create new**

A dedicated page containing:
- `CompetitiveComparison`
- `FeatureValueMatrix` with `featureValueMatrix` data
- `PackagingTiers` with `packageTiers` data
- The existing Enterprise trust/governance content from `Enterprise.tsx` (audit metrics, `EnterpriseTrustPanel`)

Wrapped in `AppShell`. Only accessible to `direction` role.

**File: `src/pages/Enterprise.tsx`** — Simplify to just governance controls (audit metrics, security score). Remove `CompetitiveComparison` and `PackagingTiers` from this page. Keep `EnterpriseTrustPanel`.

**File: `src/components/AppShell.tsx`** — Add "Why Profix" nav item for `direction` only.

**File: `src/App.tsx`** — Add `<Route path="/why-profix">` with `allowedRoles={["direction"]}`.

---

### Change 4: Error Handling UI Components

**File: `src/components/ui/states.tsx` — Create new**

Four reusable components:

```text
LoadingState  — Skeleton grid + "Loading..." text
EmptyState    — Icon + message + action button (e.g. "Upload data")
ErrorState    — AlertTriangle icon + human message + Retry button (onRetry callback)
DisconnectedState — WifiOff icon + "Connection lost" + Retry
```

All use existing Card, Button, Badge from the design system.

**Apply to pages:**
- `src/pages/ProfitLoss.tsx` — Wrap loading skeleton with `LoadingState`, add `ErrorState` when `usePL` fails, add `EmptyState` when data is null/empty after load
- `src/pages/Insights.tsx` — Same pattern with `useInsights`
- `src/pages/MultiProperty.tsx` — Same pattern with `useMultiProperty`
- `src/pages/DataVault.tsx` — Add `EmptyState` when no files exist ("Upload your first P&L file to get started")

**Update hooks** (`usePL`, `useInsights`, `useMultiProperty`) to expose an `error` field if not already present, by catching fetch errors.

---

### Change 5: Global Context Bar

**File: `src/components/ContextBar.tsx` — Create new**

A sticky bar (height ~36px) rendered below the header in `AppShell`, containing:
- **Property selector** (Select dropdown, default "Le Grand Hôtel") — visible for manager/direction
- **Reporting period** badge (e.g. "Dec 2024 · Monthly")
- **Data freshness** indicator (green dot + "Synced 2h ago" or amber + "Stale — 3 days")
- **Role badge** (already exists in header — move here for prominence)

For `inventory` role: show only property name (read-only) + role badge.

**File: `src/contexts/PropertyContext.tsx` — Create new**

```typescript
interface PropertyContextType {
  propertyId: string;
  propertyName: string;
  setProperty: (id: string, name: string) => void;
  period: { year: number; month: string; granularity: "daily" | "monthly" | "ytd" };
  setPeriod: (p: ...) => void;
}
```

Wrap in `App.tsx` inside `AuthProvider`. All pages that currently have local property/period selectors (ProfitLoss, Dashboard, MultiProperty) will read from this shared context instead of local state.

**File: `src/components/AppShell.tsx`** — Render `<ContextBar />` between `<header>` and `<main>`.

**File: `src/pages/ProfitLoss.tsx`** — Remove local property/year/month/period state. Read from `PropertyContext`. Keep the sticky filter bar but remove the property selector (it's now in the context bar). Keep period tabs since they're page-specific overrides.

**File: `src/pages/Dashboard.tsx`** — Remove inline hotel selector from `DirectionDashboard`. Read property from context.

---

### Summary of files

| Action | File |
|--------|------|
| Create | `src/components/ui/states.tsx` |
| Create | `src/components/ContextBar.tsx` |
| Create | `src/contexts/PropertyContext.tsx` |
| Create | `src/pages/WhyProfix.tsx` |
| Edit | `src/components/AppShell.tsx` |
| Edit | `src/App.tsx` |
| Edit | `src/pages/Overview.tsx` |
| Edit | `src/pages/Enterprise.tsx` |
| Edit | `src/pages/ProfitLoss.tsx` |
| Edit | `src/pages/Dashboard.tsx` |
| Edit | `src/pages/Insights.tsx` |
| Edit | `src/pages/MultiProperty.tsx` |
| Edit | `src/pages/DataVault.tsx` |
| Edit | `src/hooks/usePL.ts` |
| Edit | `src/hooks/useInsights.ts` |
| Edit | `src/hooks/useMultiProperty.ts` |

No backend, data contract, or styling system changes.

