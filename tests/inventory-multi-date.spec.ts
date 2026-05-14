import { test, expect } from "../playwright-fixture";

const day1Date = new Date("2026-05-13T09:00:00Z");
const day2Date = new Date("2026-05-14T09:00:00Z");
const day1ISO = day1Date.toISOString().split("T")[0];
const day2ISO = day2Date.toISOString().split("T")[0];

const draftKeys = [
  `pp_inventory_draft_fb_${day1ISO}`,
  `pp_inventory_draft_rooms_${day1ISO}`,
  `pp_inventory_draft_fb_${day2ISO}`,
  `pp_inventory_draft_rooms_${day2ISO}`,
];

test.describe("Inventory multi-date submissions", () => {
  test("F&B and Rooms submissions across two days populate per-day history rows", async ({ page }) => {
    await page.addInitScript((keys: string[]) => {
      keys.forEach((k) => window.localStorage.removeItem(k));
      window.sessionStorage.clear();
    }, draftKeys);

    // Freeze the browser clock to Day 1 before any app code runs.
    await page.clock.install({ time: day1Date });

    await page.goto("/login");
    await page.getByLabel("Username").fill("inventory");
    await page.getByLabel("Password").fill("inv2026");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();

    // ---------- Day 1 — F&B ----------
    await page.getByRole("tab", { name: "F&B" }).click();
    const fbPanelDay1 = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    const fbBeverageDay1 = fbPanelDay1.locator("div.grid", { hasText: "Beverage Cost" });
    await fbBeverageDay1.locator('input[type="number"]').fill("1500");
    await fbPanelDay1.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/F&B submission sent for review/i)).toBeVisible();
    await expect(fbPanelDay1.getByText("Submitted", { exact: true })).toBeVisible();
    await expect(fbPanelDay1.getByText("€1.500")).toBeVisible();

    let historyTable = page.locator("table").last();
    let firstRow = historyTable.locator("tbody tr").first();
    await expect(firstRow).toContainText(day1ISO);
    await expect(firstRow).toContainText("F&B");
    await expect(firstRow).toContainText("€1.500");

    // ---------- Day 1 — Rooms ----------
    await page.getByRole("tab", { name: "Rooms" }).click();
    const roomsPanelDay1 = page.getByRole("tabpanel").filter({ hasText: "Linen & Towels" });
    const roomsLinenDay1 = roomsPanelDay1.locator("div.grid", { hasText: "Linen & Towels" });
    await roomsLinenDay1.locator('input[type="number"]').fill("400");
    await roomsPanelDay1.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/Rooms submission sent for review/i)).toBeVisible();
    await expect(roomsPanelDay1.getByText("Submitted", { exact: true })).toBeVisible();
    await expect(roomsPanelDay1.getByText("€400")).toBeVisible();

    historyTable = page.locator("table").last();
    const day1Rows = historyTable.locator("tbody tr");
    // Rooms submitted last on Day 1, so it sits at the top.
    await expect(day1Rows.nth(0)).toContainText(day1ISO);
    await expect(day1Rows.nth(0)).toContainText("Rooms");
    await expect(day1Rows.nth(0)).toContainText("€400");
    await expect(day1Rows.nth(1)).toContainText(day1ISO);
    await expect(day1Rows.nth(1)).toContainText("F&B");
    await expect(day1Rows.nth(1)).toContainText("€1.500");
    // No Day 2 rows exist yet.
    await expect(historyTable.locator("tbody")).not.toContainText(day2ISO);

    // ---------- Advance the clock to Day 2 and reload ----------
    await page.clock.setSystemTime(day2Date);
    await page.reload();
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();

    // ---------- Day 2 — F&B ----------
    await page.getByRole("tab", { name: "F&B" }).click();
    const fbPanelDay2 = page.getByRole("tabpanel").filter({ hasText: "Food Cost" });
    // Cross-day cleanliness: no draft bleed, no Submitted badge yet.
    const fbBeverageDay2 = fbPanelDay2.locator("div.grid", { hasText: "Beverage Cost" });
    await expect(fbBeverageDay2.locator('input[type="number"]')).toHaveValue("");
    await expect(fbPanelDay2.getByText("Submitted", { exact: true })).toHaveCount(0);

    const fbFoodDay2 = fbPanelDay2.locator("div.grid", { hasText: "Food Cost" });
    await fbFoodDay2.locator('input[type="number"]').fill("2200");
    await fbPanelDay2.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/F&B submission sent for review/i)).toBeVisible();
    await expect(fbPanelDay2.getByText("Submitted", { exact: true })).toBeVisible();
    await expect(fbPanelDay2.getByText("€2.200")).toBeVisible();

    // ---------- Day 2 — Rooms ----------
    await page.getByRole("tab", { name: "Rooms" }).click();
    const roomsPanelDay2 = page.getByRole("tabpanel").filter({ hasText: "Minibar Restock" });
    const roomsMinibarDay2 = roomsPanelDay2.locator("div.grid", { hasText: "Minibar Restock" });
    await expect(roomsMinibarDay2.locator('input[type="number"]')).toHaveValue("");
    await expect(roomsPanelDay2.getByText("Submitted", { exact: true })).toHaveCount(0);

    await roomsMinibarDay2.locator('input[type="number"]').fill("650");
    await roomsPanelDay2.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/Rooms submission sent for review/i)).toBeVisible();
    await expect(roomsPanelDay2.getByText("Submitted", { exact: true })).toBeVisible();
    await expect(roomsPanelDay2.getByText("€650")).toBeVisible();

    // ---------- Day 2 history assertions ----------
    historyTable = page.locator("table").last();
    const day2Rows = historyTable.locator("tbody tr");
    // Rooms submitted last on Day 2 → top row.
    await expect(day2Rows.nth(0)).toContainText(day2ISO);
    await expect(day2Rows.nth(0)).toContainText("Rooms");
    await expect(day2Rows.nth(0)).toContainText("€650");
    await expect(day2Rows.nth(1)).toContainText(day2ISO);
    await expect(day2Rows.nth(1)).toContainText("F&B");
    await expect(day2Rows.nth(1)).toContainText("€2.200");

    // The first two history rows must not reference Day 1.
    await expect(day2Rows.nth(0)).not.toContainText(day1ISO);
    await expect(day2Rows.nth(1)).not.toContainText(day1ISO);
  });
});
