import { test, expect } from "../playwright-fixture";

interface SubmitEntry {
  id: string;
  department: string;
  category: string;
  quantity: number;
  unit: string;
  value: number;
  date: string;
  submittedBy: string;
  status: "draft" | "submitted";
  notes?: string;
}

interface SubmitPayload {
  date: string;
  department: string;
  total: number;
  entries: SubmitEntry[];
}

declare global {
  interface Window {
    __ppSubmitCalls?: SubmitPayload[];
  }
}

const day1Date = new Date("2026-05-13T09:00:00Z");
const day1ISO = "2026-05-13";

const draftKeys = [
  `pp_inventory_draft_fb_${day1ISO}`,
  `pp_inventory_draft_rooms_${day1ISO}`,
];

const signIn = async (page: import("@playwright/test").Page) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("inventory");
  await page.getByLabel("Password").fill("inv2026");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/inventory");
  await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();
};

test.describe("Inventory submit notes and exclusions", () => {
  test("includes notes when provided and excludes blank/zero amounts", async ({ page }) => {
    await page.addInitScript((keys: string[]) => {
      keys.forEach((k) => window.localStorage.removeItem(k));
      window.sessionStorage.clear();
      window.__ppSubmitCalls = [];
      window.addEventListener("pp:inventory-submit", (e: Event) => {
        const detail = (e as CustomEvent<SubmitPayload>).detail;
        window.__ppSubmitCalls!.push(detail);
      });
    }, draftKeys);

    await page.clock.install({ time: day1Date });
    await signIn(page);

    await page.getByRole("tab", { name: "F&B" }).click();
    const fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });

    // Beverage Cost: amount + notes
    const beverageRow = fbPanel.locator("div.grid", { hasText: "Beverage Cost" });
    await beverageRow.locator('input[type="number"]').fill("1500");
    await beverageRow.locator("textarea").fill("Stocked weekend rush");

    // Food Cost: amount only, no notes
    await fbPanel
      .locator("div.grid", { hasText: "Food Cost" })
      .locator('input[type="number"]')
      .fill("800");

    // Wastage: zero amount with notes — should be excluded entirely
    const wastageRow = fbPanel.locator("div.grid", { hasText: "Wastage" });
    await wastageRow.locator('input[type="number"]').fill("0");
    await wastageRow.locator("textarea").fill("No wastage today");

    // Disposables: blank amount with notes — should be excluded
    await fbPanel
      .locator("div.grid", { hasText: "Disposables" })
      .locator("textarea")
      .fill("Re-order pending");

    await fbPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/F&B submission sent for review/i)).toBeVisible();

    const calls = await page.evaluate(() => window.__ppSubmitCalls ?? []);
    expect(calls).toHaveLength(1);
    const [fbCall] = calls;

    expect(fbCall.date).toBe(day1ISO);
    expect(fbCall.department).toBe("fb");
    expect(fbCall.total).toBe(2300);
    expect(fbCall.entries).toHaveLength(2);

    const categories = fbCall.entries.map((e) => e.category).sort();
    expect(categories).toEqual(["Beverage Cost", "Food Cost"]);

    const beverage = fbCall.entries.find((e) => e.category === "Beverage Cost");
    const food = fbCall.entries.find((e) => e.category === "Food Cost");

    expect(beverage?.value).toBe(1500);
    expect(beverage?.notes).toBe("Stocked weekend rush");

    expect(food?.value).toBe(800);
    expect(food?.notes).toBeUndefined();

    // Confirm zero/blank lines did not slip through
    expect(fbCall.entries.find((e) => e.category === "Wastage")).toBeUndefined();
    expect(fbCall.entries.find((e) => e.category === "Disposables")).toBeUndefined();
  });
});
