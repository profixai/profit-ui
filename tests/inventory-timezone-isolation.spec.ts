import { test, expect } from "../playwright-fixture";

// Day boundary chosen so wall-clock time crosses midnight in some zones but
// the production code derives the day key from UTC (toISOString().split("T")[0]).
// We assert the key never bleeds: a moment fixed at 22:00 UTC on day1 must always
// resolve to day1, regardless of the browser's local timezone.
const fixedInstant = new Date("2026-05-13T22:00:00Z");
const day1ISO = "2026-05-13";
const adjacentISOs = ["2026-05-12", "2026-05-14"];

const timezones = [
  { tz: "UTC", label: "UTC" },
  { tz: "America/Los_Angeles", label: "UTC-7 (LA)" },
  { tz: "Asia/Tokyo", label: "UTC+9 (Tokyo)" },
  { tz: "Pacific/Kiritimati", label: "UTC+14 (Kiritimati)" },
];

const draftKeysForDate = (date: string) => [
  `pp_inventory_draft_fb_${date}`,
  `pp_inventory_draft_rooms_${date}`,
  `pp_inventory_draft_housekeeping_${date}`,
  `pp_inventory_draft_maintenance_${date}`,
];

const allKeys = [day1ISO, ...adjacentISOs].flatMap(draftKeysForDate);

const signIn = async (page: import("@playwright/test").Page) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("inventory");
  await page.getByLabel("Password").fill("inv2026");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/inventory");
  await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();
};

test.describe("Inventory day isolation across timezones", () => {
  for (const { tz, label } of timezones) {
    test(`drafts stay on UTC day1 in ${label}`, async ({ browser }) => {
      const context = await browser.newContext({ timezoneId: tz });
      const page = await context.newPage();

      await page.addInitScript((keys: string[]) => {
        keys.forEach((k) => window.localStorage.removeItem(k));
        window.sessionStorage.clear();
      }, allKeys);

      await page.clock.install({ time: fixedInstant });
      await signIn(page);

      // Save an F&B draft.
      await page.getByRole("tab", { name: "F&B" }).click();
      const fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
      await fbPanel
        .locator("div.grid", { hasText: "Beverage Cost" })
        .locator('input[type="number"]')
        .fill("1500");
      await fbPanel.getByRole("button", { name: "Save draft" }).click();
      await expect(page.getByText(/F&B draft saved/i)).toBeVisible();

      // The draft must be persisted under the UTC day key, never under the
      // adjacent local-day key.
      const day1Stored = await page.evaluate(
        (k) => window.localStorage.getItem(k),
        `pp_inventory_draft_fb_${day1ISO}`,
      );
      expect(day1Stored).not.toBeNull();
      expect(day1Stored!).toContain("1500");

      for (const adjacent of adjacentISOs) {
        const adjacentStored = await page.evaluate(
          (k) => window.localStorage.getItem(k),
          `pp_inventory_draft_fb_${adjacent}`,
        );
        expect(adjacentStored, `draft must not bleed into ${adjacent}`).toBeNull();
      }

      await context.close();
    });
  }
});
