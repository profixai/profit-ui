import { test, expect } from "../playwright-fixture";

const today = new Date().toISOString().split("T")[0];
const departments = ["rooms", "fb", "housekeeping", "maintenance"] as const;

test.describe("Inventory department isolation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((keys) => {
      keys.forEach((k) => window.localStorage.removeItem(k));
      window.sessionStorage.clear();
    }, departments.map((d) => `pp_inventory_draft_${d}_${today}`));

    await page.goto("/login");
    await page.getByLabel("Username").fill("inventory");
    await page.getByLabel("Password").fill("inv2026");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();
  });

  test("draft + submission in F&B does not bleed into other tabs and history is per-department", async ({ page }) => {
    // 1) F&B: save a draft for Beverage Cost.
    await page.getByRole("tab", { name: "F&B" }).click();
    const fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    const fbBeverage = fbPanel.locator("div.grid", { hasText: "Beverage Cost" });
    await fbBeverage.locator('input[type="number"]').fill("1500");
    await fbPanel.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText(/F&B draft saved/i)).toBeVisible();
    await expect(fbPanel.getByText("Draft", { exact: true })).toBeVisible();
    await expect(fbPanel.getByText("€1.500")).toBeVisible();

    // 2) Switch to Rooms — must be empty, no Draft badge, total €0.
    await page.getByRole("tab", { name: "Rooms" }).click();
    const roomsPanel = page.getByRole("tabpanel").filter({ hasText: "Linen & Towels" });
    const roomsLinen = roomsPanel.locator("div.grid", { hasText: "Linen & Towels" });
    await expect(roomsLinen.locator('input[type="number"]')).toHaveValue("");
    await expect(roomsPanel.getByText("Draft", { exact: true })).toHaveCount(0);
    await expect(roomsPanel.getByText("€0")).toBeVisible();

    // Enter a Rooms value and submit it.
    await roomsLinen.locator('input[type="number"]').fill("450");
    await roomsPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/Rooms submission sent for review/i)).toBeVisible();
    await expect(roomsPanel.getByText("Submitted", { exact: true })).toBeVisible();

    // 3) Housekeeping tab is still untouched.
    await page.getByRole("tab", { name: "Housekeeping" }).click();
    const hkPanel = page.getByRole("tabpanel").filter({ hasText: "Cleaning Chemicals" });
    const hkRow = hkPanel.locator("div.grid", { hasText: "Cleaning Chemicals" });
    await expect(hkRow.locator('input[type="number"]')).toHaveValue("");
    await expect(hkPanel.getByText("Draft", { exact: true })).toHaveCount(0);
    await expect(hkPanel.getByText("Submitted", { exact: true })).toHaveCount(0);

    // 4) Back to F&B — draft still intact, inputs still editable, then submit.
    await page.getByRole("tab", { name: "F&B" }).click();
    await expect(fbBeverage.locator('input[type="number"]')).toHaveValue("1500");
    await expect(fbPanel.getByText("Draft", { exact: true })).toBeVisible();
    await fbPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/F&B submission sent for review/i)).toBeVisible();
    await expect(fbPanel.getByText("Submitted", { exact: true })).toBeVisible();

    // 5) History shows one Rooms €450 row and one F&B €1.500 row for today, in order
    // (F&B submitted last, so it should be first).
    const historyTable = page.locator("table").last();
    const rows = historyTable.locator("tbody tr");

    const firstRow = rows.nth(0);
    await expect(firstRow).toContainText(today);
    await expect(firstRow).toContainText("F&B");
    await expect(firstRow).toContainText("€1.500");
    await expect(firstRow.getByText("Submitted", { exact: true })).toBeVisible();

    const secondRow = rows.nth(1);
    await expect(secondRow).toContainText(today);
    await expect(secondRow).toContainText("Rooms");
    await expect(secondRow).toContainText("€450");
    await expect(secondRow.getByText("Submitted", { exact: true })).toBeVisible();
  });
});
