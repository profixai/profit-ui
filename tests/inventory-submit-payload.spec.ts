import { test, expect } from "../playwright-fixture";

interface SubmitPayload {
  date: string;
  department: string;
  total: number;
  entries: Array<{
    id: string;
    department: string;
    category: string;
    quantity: number;
    unit: string;
    value: number;
    date: string;
    submittedBy: string;
    status: "draft" | "submitted";
  }>;
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

test.describe("Inventory submit payload", () => {
  test("emits correct day ISO, department, and amounts to the backend", async ({ page }) => {
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

    // ---------- F&B submission: two lines ----------
    await page.getByRole("tab", { name: "F&B" }).click();
    const fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    await fbPanel
      .locator("div.grid", { hasText: "Beverage Cost" })
      .locator('input[type="number"]')
      .fill("1500");
    await fbPanel
      .locator("div.grid", { hasText: "Food Cost" })
      .locator('input[type="number"]')
      .fill("800");
    await fbPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/F&B submission sent for review/i)).toBeVisible();

    // ---------- Rooms submission: one line ----------
    await page.getByRole("tab", { name: "Rooms" }).click();
    const roomsPanel = page.getByRole("tabpanel").filter({ hasText: "Linen & Towels" });
    await roomsPanel
      .locator("div.grid", { hasText: "Linen & Towels" })
      .locator('input[type="number"]')
      .fill("400");
    await roomsPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/Rooms submission sent for review/i)).toBeVisible();

    // ---------- Inspect captured payloads ----------
    const calls = await page.evaluate(() => window.__ppSubmitCalls ?? []);
    expect(calls).toHaveLength(2);

    const [fbCall, roomsCall] = calls;

    expect(fbCall.date).toBe(day1ISO);
    expect(fbCall.department).toBe("fb");
    expect(fbCall.total).toBe(2300);
    expect(fbCall.entries).toHaveLength(2);
    expect(fbCall.entries.every((e) => e.date === day1ISO)).toBe(true);
    expect(fbCall.entries.every((e) => e.department === "fb")).toBe(true);
    expect(fbCall.entries.every((e) => e.status === "submitted")).toBe(true);

    const fbBeverage = fbCall.entries.find((e) => e.category === "Beverage Cost");
    const fbFood = fbCall.entries.find((e) => e.category === "Food Cost");
    expect(fbBeverage?.value).toBe(1500);
    expect(fbFood?.value).toBe(800);

    expect(roomsCall.date).toBe(day1ISO);
    expect(roomsCall.department).toBe("rooms");
    expect(roomsCall.total).toBe(400);
    expect(roomsCall.entries).toHaveLength(1);
    expect(roomsCall.entries[0].category).toBe("Linen & Towels");
    expect(roomsCall.entries[0].value).toBe(400);
    expect(roomsCall.entries[0].date).toBe(day1ISO);
    expect(roomsCall.entries[0].department).toBe("rooms");
  });
});
