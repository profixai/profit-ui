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

const signIn = async (page: import("@playwright/test").Page) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("inventory");
  await page.getByLabel("Password").fill("inv2026");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/inventory");
  await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();
};

test.describe("Inventory draft day-isolation", () => {
  test("Day 1 drafts persist on reload, vanish on Day 2, and can be submitted back on Day 1", async ({ page }) => {
    await page.addInitScript((keys: string[]) => {
      keys.forEach((k) => window.localStorage.removeItem(k));
      window.sessionStorage.clear();
    }, draftKeys);

    await page.clock.install({ time: day1Date });
    await signIn(page);

    // ---------- Day 1 — save F&B draft ----------
    await page.getByRole("tab", { name: "F&B" }).click();
    let fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    await fbPanel.locator("div.grid", { hasText: "Beverage Cost" }).locator('input[type="number"]').fill("1500");
    await fbPanel.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText(/F&B draft saved/i)).toBeVisible();
    await expect(fbPanel.getByText("Draft", { exact: true })).toBeVisible();

    // ---------- Day 1 — save Rooms draft ----------
    await page.getByRole("tab", { name: "Rooms" }).click();
    let roomsPanel = page.getByRole("tabpanel").filter({ hasText: "Linen & Towels" });
    await roomsPanel.locator("div.grid", { hasText: "Linen & Towels" }).locator('input[type="number"]').fill("400");
    await roomsPanel.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText(/Rooms draft saved/i)).toBeVisible();
    await expect(roomsPanel.getByText("Draft", { exact: true })).toBeVisible();

    // ---------- Reload on Day 1 — drafts must rehydrate ----------
    await page.reload();
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();

    await page.getByRole("tab", { name: "F&B" }).click();
    fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    await expect(fbPanel.getByText("Draft", { exact: true })).toBeVisible();
    const fbBeverageInput = fbPanel.locator("div.grid", { hasText: "Beverage Cost" }).locator('input[type="number"]');
    await expect(fbBeverageInput).toHaveValue("1500");
    await expect(fbBeverageInput).toBeEnabled();
    await expect(fbPanel.getByText("€1.500")).toBeVisible();

    await page.getByRole("tab", { name: "Rooms" }).click();
    roomsPanel = page.getByRole("tabpanel").filter({ hasText: "Linen & Towels" });
    await expect(roomsPanel.getByText("Draft", { exact: true })).toBeVisible();
    const roomsLinenInput = roomsPanel.locator("div.grid", { hasText: "Linen & Towels" }).locator('input[type="number"]');
    await expect(roomsLinenInput).toHaveValue("400");
    await expect(roomsLinenInput).toBeEnabled();
    await expect(roomsPanel.getByText("€400")).toBeVisible();

    // Drafts must not have been pushed to history.
    const historyTable = page.locator("table").last();
    await expect(historyTable.locator("tbody")).not.toContainText(day1ISO);

    // ---------- Advance to Day 2 and reload — drafts must be invisible ----------
    await page.clock.setSystemTime(day2Date);
    await page.reload();
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();

    for (const tab of ["F&B", "Rooms"]) {
      await page.getByRole("tab", { name: tab }).click();
      const panel = page.getByRole("tabpanel").first();
      await expect(panel.getByText("Draft", { exact: true })).toHaveCount(0);
      await expect(panel.getByText("Submitted", { exact: true })).toHaveCount(0);
      const inputs = panel.locator('input[type="number"]');
      const count = await inputs.count();
      for (let i = 0; i < count; i += 1) {
        await expect(inputs.nth(i)).toHaveValue("");
        await expect(inputs.nth(i)).toBeEnabled();
      }
      await expect(panel.getByText("€0", { exact: false })).toBeVisible();
      await expect(panel.getByRole("button", { name: "Save draft" })).toBeEnabled();
      await expect(panel.getByRole("button", { name: "Submit for review" })).toBeEnabled();
    }

    await expect(page.locator("table").last().locator("tbody")).not.toContainText(day1ISO);
    await expect(page.locator("table").last().locator("tbody")).not.toContainText(day2ISO);

    // ---------- Travel back to Day 1 and submit the preserved drafts ----------
    await page.clock.setSystemTime(day1Date);
    await page.reload();
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();

    await page.getByRole("tab", { name: "F&B" }).click();
    fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    await expect(fbPanel.getByText("Draft", { exact: true })).toBeVisible();
    await expect(fbPanel.locator("div.grid", { hasText: "Beverage Cost" }).locator('input[type="number"]')).toHaveValue("1500");
    await fbPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/F&B submission sent for review/i)).toBeVisible();
    await expect(fbPanel.getByText("Submitted", { exact: true })).toBeVisible();
    await expect(fbPanel.locator("div.grid", { hasText: "Beverage Cost" }).locator('input[type="number"]')).toBeDisabled();

    await page.getByRole("tab", { name: "Rooms" }).click();
    roomsPanel = page.getByRole("tabpanel").filter({ hasText: "Linen & Towels" });
    await expect(roomsPanel.getByText("Draft", { exact: true })).toBeVisible();
    await expect(roomsPanel.locator("div.grid", { hasText: "Linen & Towels" }).locator('input[type="number"]')).toHaveValue("400");
    await roomsPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/Rooms submission sent for review/i)).toBeVisible();
    await expect(roomsPanel.getByText("Submitted", { exact: true })).toBeVisible();

    // History reflects the Day 1 submissions in the right order.
    const day1History = page.locator("table").last().locator("tbody tr");
    await expect(day1History.nth(0)).toContainText(day1ISO);
    await expect(day1History.nth(0)).toContainText("Rooms");
    await expect(day1History.nth(0)).toContainText("€400");
    await expect(day1History.nth(1)).toContainText(day1ISO);
    await expect(day1History.nth(1)).toContainText("F&B");
    await expect(day1History.nth(1)).toContainText("€1.500");
    await expect(page.locator("table").last().locator("tbody")).not.toContainText(day2ISO);
  });
});
