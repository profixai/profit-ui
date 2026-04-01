

## Full Feature Build: USALI P&L, Role-Based Auth, and Role-Specific Pages

This is a large build spanning auth, three new pages, two page rewrites, and sidebar/routing overhaul. Below is the implementation order — each step builds on the previous.

---

### Phase 1: Auth Foundation

**Create `src/contexts/AuthContext.tsx`**
- Context with `user`, `role`, `login(username, password)`, `logout()`
- Role type: `"inventory" | "manager" | "direction"`
- Mock credentials: `inventory/inv2026`, `manager/mgr2026`, `direction/dir2026`
- Session in memory (useState), no localStorage

**Create `src/components/ProtectedRoute.tsx`**
- Wraps children, redirects to `/login` if no session
- Optional `allowedRoles` prop — renders 403 message if role not permitted

**Update `src/pages/Login.tsx`**
- Change email field to username (text input)
- On submit: validate against mock creds via `useAuth().login()`, redirect based on role
- Show error toast on invalid credentials via Sonner

**Update `src/App.tsx`**
- Wrap everything in `AuthProvider`
- Add `/login` route (public)
- `/` redirects to `/login` if not authed, otherwise role-based home
- All other routes wrapped in `ProtectedRoute`
- Add new routes: `/pl`, `/inventory`, `/multi-property`

---

### Phase 2: Sidebar & TopBar Role Awareness

**Update `src/components/AppSidebar.tsx`**
- Nav items filtered by role:
  - `inventory`: only "Stock Entry" (`/inventory`) + "Data Upload" (`/data`)
  - `manager`: "Dashboard", "P&L", "AI Insights", "Data Upload", "Portfolio View"
  - `direction`: "Dashboard", "P&L", "AI Insights", "Portfolio View"
- Icons: LayoutDashboard, BarChart2, Sparkles, Upload, Building2
- Footer: role label chip with color (green/blue/amber)

**Update `src/components/TopBar.tsx`**
- Show current user's role and name from `useAuth()`

---

### Phase 3: New P&L Page (`src/pages/ProfitLoss.tsx`)

**Sticky filter bar**: Property selector (Select), Year selector, Period toggle (Daily/Monthly/YTD tabs), Month selector

**KPI strip** — 8 cards in a grid: Total Revenue, GOP, NOI/EBITDA, RevPAR, OCC%, ADR, F&B Cost %, Flow-Through. Each shows value, direction arrow (TrendingUp/TrendingDown), vs-budget delta pill.

**Collapsible P&L table** — USALI structure:
- Rows: Rooms Revenue, F&B Revenue, Other Revenue, Total Revenue, then department expenses, Undistributed Expenses, GOP, Fixed Charges, NOI/EBITDA
- Columns: Actual | Budget | Variance euro | Variance % | 6-month sparkline (inline SVG polyline)
- Department rows toggle children with +/- button (local state)

**AI Insight banner** — conditional render when a threshold is breached (e.g. F&B Cost % > 32%). Shows AlertTriangle icon, message, "Review" and "Dismiss" buttons.

**Export CSV button** — top-right, generates CSV from table data and triggers download via Blob URL.

All data from a new `mockUSALI` object added to `src/lib/mock-data.ts`.

---

### Phase 4: Insights Page Rewrite (`src/pages/Insights.tsx`)

**Filter tabs**: All | Critical | Warning | Info — filter the card feed

**Card structure** (5-8 mock cards):
- Severity badge: Critical (red) / Warning (amber) / Info (blue)
- Department tag pill (Rooms / F&B / Payroll / Energy)
- Headline, detail paragraph, timestamp
- "Acknowledge" button — marks card read (greyed out + checkmark, local state)
- "Send via Telegram" button — fires Sonner toast "Sent to Telegram channel"

**Top-right**: "Notification Settings" link button navigating to `/settings#notifications`

---

### Phase 5: Settings Notifications Tab (`src/pages/Settings.tsx`)

Add Tabs component (General | Notifications). Existing content goes under "General".

**Notifications tab**:
- Telegram Bot section: Bot Token (password input), Chat ID (text input), Enable toggle, Critical-only vs All toggle, "Send test message" button (toast)
- Alert Thresholds section: F&B Cost % (default 32), Payroll % (default 28), OCC% drop (default -5), RevPAR drop (default -10)
- Notification Schedule: Daily digest toggle + time picker (default 08:00), Weekly summary toggle + day picker (default Monday), Real-time on breach toggle

All state persisted to `localStorage` key `"pp_notification_settings"` via useEffect.

---

### Phase 6: Inventory Page (`src/pages/Inventory.tsx`)

Visible only to `inventory` role (enforced by ProtectedRoute).

- Header: "Daily Stock & Cost Entry" with today's date
- Department tabs: Rooms | F&B | Housekeeping | Maintenance
- Per tab: form with line items (label, euro input, notes textarea), "Save Draft" and "Submit for Review" buttons, status badge (Draft/Submitted/Approved)
- Below form: last 7 days submission log with status pills
- All local state, mock submission history

---

### Phase 7: Dashboard Role Variants (`src/pages/Dashboard.tsx`)

Read role from `useAuth()`.

**Direction variant** (`role === "direction"`):
- KPI strip (8 metrics), GOP trend bar chart (12 months), top 3 critical AI insights summary, property selector
- Hide: data entry, edit controls, Export CSV
- "Multi-Property" toggle linking to `/multi-property`

**Manager variant** (`role === "manager"`):
- Current dashboard as-is
- Add "Send via Telegram" on insight cards

---

### Phase 8: Multi-Property Page (`src/pages/MultiProperty.tsx`)

Visible to `direction` and `manager` roles.

- Property group selector dropdown (All, Paris Portfolio, Lyon)
- KPI comparison grid: 3 property columns x 8 KPI rows, cells colored green (on/above budget) or red (below)
- Stacked bar chart: Revenue by Department across properties (using Recharts)
- AI anomaly summary: list of flagged properties with critical insight text

Mock data for 3 properties in `mock-data.ts`.

---

### Files Summary

| Action | File |
|--------|------|
| Create | `src/contexts/AuthContext.tsx` |
| Create | `src/components/ProtectedRoute.tsx` |
| Create | `src/pages/ProfitLoss.tsx` |
| Create | `src/pages/Inventory.tsx` |
| Create | `src/pages/MultiProperty.tsx` |
| Edit | `src/pages/Login.tsx` |
| Edit | `src/pages/Insights.tsx` |
| Edit | `src/pages/Settings.tsx` |
| Edit | `src/pages/Dashboard.tsx` |
| Edit | `src/components/AppSidebar.tsx` |
| Edit | `src/components/TopBar.tsx` |
| Edit | `src/App.tsx` |
| Edit | `src/lib/mock-data.ts` |

