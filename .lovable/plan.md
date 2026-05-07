## Sprint: "Make every page feel alive" — 5 Credits

Adds time/context awareness, hover insight depth, scenario imagery, micro-interactions, and a live clock. No new dependencies.

### Credit 1 — ContextualNudgeBar

**New files**
- `src/lib/nudges.ts` — pure `getNudge(hour, dayOfWeek): Nudge` with 12+ rules (7 hour bands + 4 day rules + compound merge when both match).
- `src/components/ContextualNudgeBar.tsx` — 40px bar, card `#0f3530` bg, left-border by severity (lavender/amber/teal), CSS fade+slide-in (300ms), session dismiss via `sessionStorage['nudge_dismissed_{hour}_{day}']`.

**Wiring**
- Render inside `AppShell` *only* when `location.pathname` ∈ `/overview /dashboard /pl /insights`. Excludes Data Vault, Settings, /why-profix.

### Credit 2 — HoverInsight on KPI cards

**New file**
- `src/components/HoverInsight.tsx` — wraps children in shadcn `Tooltip` (open 400ms / close 200ms). Popover (200px): Recharts `LineChart` 80×32 with 7 mock points (±5% around `currentValue`, line `#b8a9e8`, no axes/tooltip), delta badge (▲/▼/→), one-line context from `kpiKey` lookup map.

**Wiring**
- Wrap `KPICard` usages on `Overview.tsx` (top 3 KPIs + North Star) and `Dashboard.tsx`.
- Role guard via `useAuth().role` — render plain children for `inventory` (Operator); show tooltip for `manager` and `direction`. Click behaviour unchanged.

### Credit 3 — ScenarioImageCard (Unsplash)

**New file**
- `src/components/ScenarioImageCard.tsx` — text renders first, `<img loading="lazy" src="https://source.unsplash.com/400x200/?{kw}">` with CSS opacity fade-in on `onLoad`, `onError` swap to solid `#0f3530` + emoji fallback. Keyword + emoji map per spec, `size: 'sm'|'md'`.

**Wiring**
- `Overview.tsx`: one `md` card between KPI row and the change log; scenario derived from `useLiveClock().hour` (4 bands).
- `Insights.tsx`: one `sm` card per `InsightCard` (uses `insight.department` mapped to scenario; default `finance`).

### Credit 4 — ClickRipple & micro-interactions

**New file**
- `src/styles/interactions.css` — `.ripple-target` (radial gradient via `--ripple-x/y`, opacity transition), `.card-lift` (translateY -2px + shadow on hover), `.nav-active-glow` (lavender ring).

**Wiring**
- Import once in `src/main.tsx`.
- `KPICard` className gains `ripple-target card-lift`; on `onMouseDown` set `--ripple-x/y` from event coords.
- shadcn `Button` base class extended with `ripple-target` (single edit in `button.tsx`).
- `AppSidebar` / nav tab components: add `ripple-target`; active tab adds `nav-active-glow` (replace or augment current active style — keep existing semantic colour).
- Excluded: form inputs, table rows.

### Credit 5 — LiveClockContext & time-aware headers

**New file**
- `src/contexts/LiveClockContext.tsx` — `LiveClockProvider` + `useLiveClock()`. State: `{ hour, minute, dayOfWeek, timeLabel }`. Single `setInterval(60_000)` updating only when `minute` changes; `useMemo` for `timeLabel` to avoid re-render storm. `timeLabel` bands per spec.

**Wiring**
- Wrap providers in `App.tsx` (inside `AuthProvider`, outside `BackendStatusProvider`).
- `Overview.tsx` header → `"{timeLabel}, {firstName}"` where `firstName` comes from `useAuth().user?.display_name?.split(' ')[0] ?? 'Manager'`. Subtitle = `getNudge(...).headline`.
- `Dashboard.tsx` header → `"Dashboard · {dayName} {date}"` (formatted DD/MM via `Intl.DateTimeFormat('en-GB')`).
- `ContextBar.tsx` → append `HH:MM` (24h, DM Mono, `text-muted-foreground`) at far right; subscribes to `useLiveClock` so it ticks every 60s without prop drilling.

### Carry-forward guards (no regressions)
- Nav remains 4 tabs.
- All new fetch-shaped code (none here, but Insights/KPI sources unchanged) keeps `APIResponse<T>` envelope.
- TierGate on Insights/Telegram/Audit unchanged.
- Tokens: bg `#0b2b27`, card `#0f3530`, accent `#b8a9e8`, DM Sans/Mono — used via existing semantic tokens; no hardcoded hex inside Tailwind classes (only in the new CSS file where ripple gradient needs literal rgba).

### Definition of Done
- Nudge bar shows on the 4 listed routes, dismiss persists per session, no flash on reload (read sessionStorage during initial state).
- Hover tooltip with sparkline + delta + context on KPI cards for Manager/Admin only.
- Scenario card on Overview (time-driven) and one per Insights card; emoji fallback on image error.
- Ripple + lift on KPI cards and buttons; active nav tab glows.
- Live clock updates every 60s; Overview/Dashboard headers and Context Bar reflect it.
- `tsc --noEmit` clean, `vite build` clean, no new warnings.

### Out of scope
- No new npm packages, no Framer Motion, no backend/contract changes, no auth/RLS changes, no DataVault edits.
