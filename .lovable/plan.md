## Goal

Add a Playwright smoke test that exercises the Inventory Manager journey across **two different dates** (F&B and Rooms on each day) and asserts that each day's submissions show up correctly in the Recent submissions table.

## Context

- `src/pages/Inventory.tsx` derives the working date from `new Date().toISOString().split("T")[0]` at module load. There is no in-app date picker, so the only way to simulate "another day" in an end-to-end test is to override the browser clock before the page loads.
- Drafts/submissions are persisted under `pp_inventory_draft_${dept}_${date}` in `localStorage`, and the in-memory `history` state is seeded from `initialHistory` plus any submission performed in the current session.
- Because `history` is React state (not persisted), submissions made on "Day 1" won't survive a hard reload on "Day 2". The test therefore performs both days in a single page session, switching the simulated clock between them via `page.clock` (Playwright's clock API) so the module-level `todayISO` is recomputed when we navigate between dates.

## Test design

File: `tests/inventory-multi-date.spec.ts`

Flow inside one `test()`:

1. **Setup**
   - Clear `localStorage` keys for `pp_inventory_draft_{fb,rooms}_{day1,day2}` and `sessionStorage` via `addInitScript`.
   - Install `page.clock.install({ time: day1 })` before any navigation so `new Date()` returns Day 1 (e.g. `2026-05-13T09:00:00Z`).
   - Log in as `inventory` / `inv2026`, navigate to `/inventory`, assert the heading.

2. **Day 1 — F&B**
   - Activate F&B tab, fill Beverage Cost = `1500`, click **Submit for review**.
   - Assert toast `F&B submission sent for review`, badge `Submitted`, day total `€1.500`.
   - Verify the first row of Recent submissions shows Day 1 / F&B / €1.500 / Submitted.

3. **Day 1 — Rooms**
   - Switch to Rooms tab, fill Linen & Towels = `400`, submit.
   - Assert toast, badge, total `€400`.
   - Verify Recent submissions has both Day 1 rows (Rooms first, F&B second), no Day 2 entries yet.

4. **Advance to Day 2**
   - Call `page.clock.setSystemTime(day2)` (e.g. `2026-05-14T09:00:00Z`).
   - `page.reload()` so the Inventory module recomputes `todayISO`. The previous-session history will be gone (expected — that's a side effect of state-only history), so Day 2 starts from `initialHistory` + new Day 2 submissions.

5. **Day 2 — F&B and Rooms**
   - F&B: Food Cost = `2200`, submit. Assert Submitted, total `€2.200`.
   - Rooms: Minibar Restock = `650`, submit. Assert Submitted, total `€650`.
   - Verify Recent submissions top rows: Rooms Day 2 / €650 then F&B Day 2 / €2.200, both with today = Day 2 ISO.
   - Verify no Day 1 ISO string appears in the first two rows (sanity check that history is correctly scoped to the current session/day).

6. **Cross-day persistence sanity**
   - Re-activate F&B tab on Day 2 and confirm the inputs are empty (no Day 1 draft bleed) and there is no `Submitted` badge yet for Day 2 before the new submission, by checking before step 5's F&B submit.

## Notes / risks

- Uses Playwright's `page.clock.install` + `setSystemTime`, which is supported in modern Playwright. This is the only viable hook because the page reads the date at module load.
- Reloading between days drops in-memory history; the assertion plan reflects that intentionally rather than asserting a combined two-day history.
- Selectors mirror the existing specs (`getByRole("tabpanel").filter`, `div.grid` row scoping, `table` last) to stay consistent.

## Deliverable

- New file: `tests/inventory-multi-date.spec.ts`
- No production code changes.
