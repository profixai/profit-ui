import { test, expect } from "../playwright-fixture";

const day1Date = new Date("2026-05-13T09:00:00Z");
const day2Date = new Date("2026-05-14T09:00:00Z");
const day1ISO = day1Date.toISOString().split("T")[0];
const day2ISO = day2Date.toISOString().split("T")[0];

const draftKeys = [
  `pp_inventory_draft_fb_${day1ISO}`,
  `pp_inventory_draft_rooms_${day1ISO}`,
  `pp_inventory_draft_housekeeping_${day1ISO}`,
  `pp_inventory_draft_maintenance_${day1ISO}`,
  `pp_inventory_draft_fb_${day2ISO}`,
  `pp_inventory_draft_rooms_${day2ISO}`,
  `pp_inventory_draft_housekeeping_${day2ISO}`,
  `pp_inventory_draft_maintenance_${day2ISO}`,
];

const signIn = async (page: import("@playwright/test").Page) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("inventory");
  await page.getByLabel("Password").fill("inv2026");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/inventory");
  await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();
};

test.describe("Inventory badge reset across reloads", () => {
  test("Draft and Submitted badges persist on same-day reload and clear on next-day reload", async ({ page }) => {
    await page.addInitScript((keys: string[]) => {
      keys.forEach((k) => window.localStorage.removeItem(k));
      window.sessionStorage.clear();
    }, draftKeys);

    await page.clock.install({ time: day1Date });
    await signIn(page);

    // ---------- Day 1 — F&B saves a Draft ----------
    await page.getByRole("tab", { name: "F&B" }).click();
    let fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    const fbBeverage = fbPanel.locator("div.grid", { hasText: "Beverage Cost" });
    await fbBeverage.locator('input[type="number"]').fill("1200");
    await fbPanel.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText(/F&B draft saved/i)).toBeVisible();
    await expect(fbPanel.getByText("Draft", { exact: true })).toBeVisible();

    // ---------- Day 1 — Rooms submits ----------
    await page.getByRole("tab", { name: "Rooms" }).click();
    let roomsPanel = page.getByRole("tabpanel").filter({ hasText: "Linen & Towels" });
    const roomsLinen = roomsPanel.locator("div.grid", { hasText: "Linen & Towels" });
    await roomsLinen.locator('input[type="number"]').fill("400");
    await roomsPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/Rooms submission sent for review/i)).toBeVisible();
    await expect(roomsPanel.getByText("Submitted", { exact: true })).toBeVisible();

    // Housekeeping should not have any badge.
    await page.getByRole("tab", { name: "Housekeeping" }).click();
    let hkPanel = page.getByRole("tabpanel").filter({ hasText: "Cleaning Chemicals" });
    await expect(hkPanel.getByText("Draft", { exact: true })).toHaveCount(0);
    await expect(hkPanel.getByText("Submitted", { exact: true })).toHaveCount(0);

    // ---------- Reload on Day 1 — badges must be rehydrated ----------
    await page.reload();
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();

    await page.getByRole("tab", { name: "F&B" }).click();
    fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    await expect(fbPanel.getByText("Draft", { exact: true })).toBeVisible();
    await expect(fbPanel.locator("div.grid", { hasText: "Beverage Cost" }).locator('input[type="number"]')).toHaveValue("1200");

    await page.getByRole("tab", { name: "Rooms" }).click();
    roomsPanel = page.getByRole("tabpanel").filter({ hasText: "Linen & Towels" });
    await expect(roomsPanel.getByText("Submitted", { exact: true })).toBeVisible();

    await page.getByRole("tab", { name: "Housekeeping" }).click();
    hkPanel = page.getByRole("tabpanel").filter({ hasText: "Cleaning Chemicals" });
    await expect(hkPanel.getByText("Draft", { exact: true })).toHaveCount(0);
    await expect(hkPanel.getByText("Submitted", { exact: true })).toHaveCount(0);

    // ---------- Advance to Day 2 and reload — badges must reset ----------
    await page.clock.setSystemTime(day2Date);
    await page.reload();
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();

    for (const tab of ["F&B", "Rooms", "Housekeeping", "Maintenance"]) {
      await page.getByRole("tab", { name: tab }).click();
      const panel = page.getByRole("tabpanel").first();
      await expect(panel.getByText("Draft", { exact: true })).toHaveCount(0);
      await expect(panel.getByText("Submitted", { exact: true })).toHaveCount(0);
    }

    // F&B inputs are empty on Day 2 (no draft bleed from Day 1).
    await page.getByRole("tab", { name: "F&B" }).click();
    fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    await expect(fbPanel.locator("div.grid", { hasText: "Beverage Cost" }).locator('input[type="number"]')).toHaveValue("");

    // ---------- Day 2 — save a Draft, reload, badge persists for Day 2 only ----------
    const fbFood = fbPanel.locator("div.grid", { hasText: "Food Cost" });
    await fbFood.locator('input[type="number"]').fill("800");
    await fbPanel.getByRole("button", { name: "Save draft" }).click();
    await expect(fbPanel.getByText("Draft", { exact: true })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();
    await page.getByRole("tab", { name: "F&B" }).click();
    fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    await expect(fbPanel.getByText("Draft", { exact: true })).toBeVisible();
    await expect(fbPanel.getByText("Submitted", { exact: true })).toHaveCount(0);

    // ---------- Travel back to Day 1, reload — Day 1 badges must still be intact ----------
    await page.clock.setSystemTime(day1Date);
    await page.reload();
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();

    await page.getByRole("tab", { name: "F&B" }).click();
    fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    await expect(fbPanel.getByText("Draft", { exact: true })).toBeVisible();

    await page.getByRole("tab", { name: "Rooms" }).click();
    roomsPanel = page.getByRole("tabpanel").filter({ hasText: "Linen & Towels" });
    await expect(roomsPanel.getByText("Submitted", { exact: true })).toBeVisible();
  });
});
