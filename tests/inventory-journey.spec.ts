import { test, expect } from "../playwright-fixture";

const today = new Date().toISOString().split("T")[0];

test.describe("Inventory Manager journey", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any persisted draft for the F&B department on today's date
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key);
      window.sessionStorage.clear();
    }, `pp_inventory_draft_fb_${today}`);

    await page.goto("/login");
    await page.getByLabel("Username").fill("inventory");
    await page.getByLabel("Password").fill("inv2026");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Inventory role is routed to /data after login; navigate to the Inventory page directly.
    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();

    // F&B tab is the default active tab.
    await expect(page.getByRole("tab", { name: "F&B", selected: true })).toBeVisible();
  });

  test("save draft, surface validation errors, submit, and see history entry", async ({ page }) => {
    const fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    const beverageRow = fbPanel.locator("div.grid", { hasText: "Beverage Cost" });
    const foodRow = fbPanel.locator("div.grid", { hasText: "Food Cost" });

    // 1) Save draft with a single valid line.
    await beverageRow.locator('input[type="number"]').fill("1200");
    await fbPanel.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText(/F&B draft saved/i)).toBeVisible();
    await expect(fbPanel.getByText("Draft", { exact: true })).toBeVisible();
    await expect(fbPanel.getByText("€1.200")).toBeVisible();

    // 2) Validation error — invalid amount blocks submit.
    await foodRow.locator('input[type="number"]').fill("-50");
    await fbPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(fbPanel.getByText(/Amount must be a positive number/i)).toBeVisible();

    // 3) Fix the value and submit.
    await foodRow.locator('input[type="number"]').fill("800");
    await fbPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/F&B submission sent for review/i)).toBeVisible();
    await expect(fbPanel.getByText("Submitted", { exact: true })).toBeVisible();

    // Inputs should now be disabled.
    await expect(beverageRow.locator('input[type="number"]')).toBeDisabled();
    await expect(fbPanel.getByRole("button", { name: /Submitted/ })).toBeDisabled();

    // 4) The new entry appears at the top of the recent submissions table.
    const historyTable = page.locator("table").last();
    const firstRow = historyTable.locator("tbody tr").first();
    await expect(firstRow).toContainText(today);
    await expect(firstRow).toContainText("F&B");
    await expect(firstRow).toContainText("€2.000");
    await expect(firstRow.getByText("Submitted", { exact: true })).toBeVisible();
  });
});
