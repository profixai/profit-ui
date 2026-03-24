

## Plan: Rebuild Dashboard as the Primary View with Inline AI Pattern

### Summary

Replace the current Ledger-as-home with a single-page, vertically scrollable **Dashboard** that reads from one `InsightsResponse` data shape. Every visual block is clickable and expands an **InlineAIRow** directly below it — no drawers, no modals. The Ask Profix slide-in panel is removed from Dashboard.

### Navigation Change

- Default route `/` redirects to `/dashboard` instead of `/ledger`
- Add Dashboard route; keep Ledger, Materiality, CAPEX Roadmap, Data Vault, Reporting, Settings as secondary nav items
- Sidebar: "Dashboard" becomes the first nav item (LayoutDashboard icon)

### Mock Data Updates (`src/lib/mock-data.ts`)

- Add `mockInsightsResponse` object matching the `InsightsResponse` contract (job_id, filename, period_start, period_end, monthly_margins, cost_drivers, breakeven)
- Reuse existing `mockMonthlyMargin`, `mockCostDrivers`, `mockBreakeven` arrays, wrapping them in the contract shape
- Add mock inline AI responses as a lookup map keyed by context (e.g., `"kpi-gop-margin"` → explanation string)

### New Components (all in `src/components/dashboard/`)

1. **InlineAIRow** — A collapsible row that appears below any block when clicked. Shows a plain-text explanation with one bold highlight and an "Ask follow-up →" link (opens Ask Profix panel). Animated expand/collapse with framer-motion.

2. **KPICard** — Value, label, delta badge. `onClick` sets active AI context → triggers InlineAIRow below the KPI strip.

3. **DeltaBadge** — Extracted from current Dashboard (already exists inline, will become a shared component).

4. **MarginTrendChart** — Recharts LineChart with target reference line. Clickable data points via `onClick` on `<Line>` activeDot. Below-target months colored red. Click → InlineAIRow below chart.

5. **CostBreakdownSection** — Two-column layout:
   - Left: DonutChart (Recharts PieChart, clickable segments via `onClick` on `<Cell>`)
   - Right: CostDriverTable (5 rows, full-row amber highlight for delta >30%, clickable rows)
   - Click either → InlineAIRow below the section

6. **BreakevenCard** — Three numbers, border color-coded (green if above breakeven, red if below). Clickable → InlineAIRow.

7. **MonthlyDetailTable** — Collapsible table below the fold. One row per month. Sortable columns (Month, Revenue, Costs, GOP, Margin %, vs Prior). Uses Shadcn Table. No AI interaction.

### Dashboard Page (`src/pages/Dashboard.tsx`) — Complete Rebuild

Single page, six blocks in order:

```text
Block 1: Header bar (property name, period, filename, re-upload link)
Block 2: KPI strip (4 KPICards) + InlineAIRow slot
Block 3: Margin trend chart + InlineAIRow slot
Block 4: Cost breakdown (donut + table) + InlineAIRow slot
Block 5: Breakeven card + InlineAIRow slot
Block 6: Monthly detail table (collapsible)
```

State management: a single `activeAI` state (`{ block: string, context: string } | null`). Only one InlineAIRow visible at a time. Clicking a new element closes the previous one.

### Files to Create
- `src/components/dashboard/InlineAIRow.tsx`
- `src/components/dashboard/KPICard.tsx`
- `src/components/dashboard/DeltaBadge.tsx`
- `src/components/dashboard/MarginTrendChart.tsx`
- `src/components/dashboard/CostBreakdownSection.tsx`
- `src/components/dashboard/BreakevenCard.tsx`
- `src/components/dashboard/MonthlyDetailTable.tsx`

### Files to Edit
- `src/pages/Dashboard.tsx` — full rewrite
- `src/lib/mock-data.ts` — add `InsightsResponse` type and `mockInsightsResponse`, add `mockAIResponses` map
- `src/App.tsx` — add `/dashboard` route, change default redirect from `/ledger` to `/dashboard`
- `src/components/AppSidebar.tsx` — add Dashboard as first nav item

### Technical Details

- **No new libraries** — Recharts + Shadcn Table + framer-motion (all already installed)
- InlineAIRow uses `AnimatePresence` + `motion.div` with height animation
- Chart click handlers use Recharts' built-in `onClick` props on `Pie`, `Line` activeDot, and table row `onClick`
- MonthlyDetailTable sorting via local `useState` for sort column/direction
- All data derived from `mockInsightsResponse` — single source of truth

