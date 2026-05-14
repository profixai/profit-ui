# Plan: Day-scoped draft isolation Playwright test

Add `tests/inventory-draft-day-isolation.spec.ts` verifying that drafts saved on one simulated day stay tied to that day after a reload, are invisible on the next day, and can still be submitted on their original date.

## Flow

1. **Setup**
   - Clear `pp_inventory_draft_{fb,rooms}_{day1ISO,day2ISO}` and `sessionStorage` via `addInitScript`.
   - `page.clock.install({ time: day1Date })` (Day 1 = 2026-05-13, Day 2 = 2026-05-14).
   - Sign in as `inventory` / `inv2026`, navigate to `/inventory`.

2. **Day 1 — save drafts in F&B and Rooms** (no submit)
   - F&B: fill Beverage Cost = `1500`, click **Save draft** → toast `F&B draft saved`, `Draft` badge visible.
   - Rooms: fill Linen & Towels = `400`, click **Save draft** → toast `Rooms draft saved`, `Draft` badge visible.

3. **Reload on Day 1 — drafts rehydrate**
   - F&B panel: `Draft` badge visible, Beverage Cost input = `1500`, day total `€1.500`, inputs editable (not `disabled`).
   - Rooms panel: `Draft` badge visible, Linen & Towels input = `400`, day total `€400`.
   - Recent submissions table contains no row dated `day1ISO` (drafts aren't pushed to history).

4. **Advance clock to Day 2 and reload — drafts must be invisible**
   - `page.clock.setSystemTime(day2Date)` + `page.reload()`.
   - F&B and Rooms tabs: no `Draft` or `Submitted` badge, all inputs empty (`""`), day total `€0`, Save draft / Submit buttons enabled.
   - History table contains no `day1ISO` rows from drafts and no `day2ISO` rows yet.

5. **Travel back to Day 1 and submit the preserved drafts**
   - `page.clock.setSystemTime(day1Date)` + `page.reload()`.
   - F&B: confirm `Draft` badge + Beverage Cost = `1500` rehydrated, click **Submit for review** → toast `F&B submission sent for review`, badge flips to `Submitted`, inputs become disabled.
   - Rooms: same flow, submit Linen & Towels `400` → `Submitted`.
   - History top rows: Rooms / `day1ISO` / `€400` / Submitted, then F&B / `day1ISO` / `€1.500` / Submitted. No `day2ISO` rows.

## Technical notes

- Reuses the `playwright-fixture` import and selector style from `tests/inventory-multi-date.spec.ts` and `tests/inventory-badge-reset.spec.ts` (tabpanel filters, `div.grid` row scoping, `de-DE` number formatting).
- Relies on existing app behavior: `Inventory.tsx` keys drafts by `pp_inventory_draft_{dept}_{todayISO}` and the hydration `useEffect` reads only the current `todayISO`, so Day 2 naturally skips Day 1 drafts.
- No production code changes.

## Files

- New: `tests/inventory-draft-day-isolation.spec.ts`
