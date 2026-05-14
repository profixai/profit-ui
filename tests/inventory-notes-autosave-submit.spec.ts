import { test, expect, type Page } from "../playwright-fixture";

const today = new Date().toISOString().split("T")[0];
const fbDraftKey = `pp_inventory_draft_fb_${today}`;

const seedDraft = async (page: Page, key: string, draft: unknown) => {
  await page.addInitScript(
    ({ k, d }) => {
      window.localStorage.setItem(k, JSON.stringify(d));
      window.sessionStorage.clear();
    },
    { k: key, d: draft },
  );
};

const captureSubmits = async (page: Page) => {
  await page.addInitScript(() => {
    (window as unknown as { __ppSubmitCalls: unknown[] }).__ppSubmitCalls = [];
    window.addEventListener("pp:inventory-submit", (e) => {
      (window as unknown as { __ppSubmitCalls: unknown[] }).__ppSubmitCalls.push(
        (e as CustomEvent).detail,
      );
    });
  });
};

const login = async (page: Page) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("inventory");
  await page.getByLabel("Password").fill("inv2026");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/inventory");
  await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();
};

const readDraft = async (page: Page, key: string) => {
  return page.evaluate((k) => {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as { values?: Record<string, { amount: string; notes: string }>; status?: string }) : null;
  }, key);
};

test.describe("Inventory notes — autosave & submit normalization", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key);
    }, fbDraftKey);
  });

  test("autosave strips leading/trailing whitespace and collapses internal repeats", async ({ page }) => {
    // Seed a draft as if it came from an older format with raw whitespace in notes.
    await seedDraft(page, fbDraftKey, {
      values: {
        "Beverage Cost": { amount: "1200", notes: "   stocked   weekend   rush   " },
      },
      status: "Draft",
    });

    await login(page);

    const fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    const beverageRow = fbPanel.locator("div.grid", { hasText: "Beverage Cost" });

    // Trigger autosave by editing the amount (debounced at 600ms).
    await beverageRow.locator('input[type="number"]').fill("1300");
    await page.waitForTimeout(900);

    const draft = await readDraft(page, fbDraftKey);
    expect(draft?.values?.["Beverage Cost"]?.notes).toBe("stocked weekend rush");
    expect(draft?.values?.["Beverage Cost"]?.amount).toBe("1300");
  });

  test("autosave skips entries whose only content is whitespace-only notes (hasContent=false)", async ({ page }) => {
    await seedDraft(page, fbDraftKey, {
      values: {
        // Only whitespace in notes, no amount → should not produce a stored draft.
        "Beverage Cost": { amount: "", notes: "     " },
        "Food Cost": { amount: "", notes: "\t\n  " },
      },
      status: "Draft",
    });

    await login(page);

    // Simulate an idle period long enough for autosave's debounced effect to fire.
    await page.waitForTimeout(900);

    // Now overwrite to remove the seeded draft entirely if hasContent is correctly false.
    // But hydration ran first → autosave will re-evaluate. The entry has no amount and
    // notes normalize to "", so hasContent must be false → autosave must NOT rewrite.
    // We assert by clearing localStorage AFTER hydration and confirming autosave does not
    // write it back.
    await page.evaluate((k) => window.localStorage.removeItem(k), fbDraftKey);

    // Touch state via a transient amount edit then clear it to trigger the effect.
    const fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    const beverageRow = fbPanel.locator("div.grid", { hasText: "Beverage Cost" });
    await beverageRow.locator('input[type="number"]').fill("");
    await page.waitForTimeout(900);

    const draft = await readDraft(page, fbDraftKey);
    expect(draft).toBeNull();
  });

  test("autosave runs when amount is present even if notes normalize to empty", async ({ page }) => {
    await login(page);

    const fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    const beverageRow = fbPanel.locator("div.grid", { hasText: "Beverage Cost" });

    await beverageRow.locator('input[type="number"]').fill("500");
    // Typing only whitespace into the textarea is rejected at typing-time → notes stays "".
    await beverageRow.locator("textarea").click();
    await page.keyboard.press("Space");
    await page.keyboard.press("Space");

    await page.waitForTimeout(900);

    const draft = await readDraft(page, fbDraftKey);
    expect(draft?.values?.["Beverage Cost"]?.amount).toBe("500");
    expect(draft?.values?.["Beverage Cost"]?.notes).toBe("");
  });

  test("submit payload contains normalized notes (outer trimmed, internal collapsed)", async ({ page }) => {
    await captureSubmits(page);

    // Seed a draft with messy whitespace to prove submit normalizes regardless of source.
    await seedDraft(page, fbDraftKey, {
      values: {
        "Beverage Cost": { amount: "1500", notes: "   stocked\t\tweekend\n\nrush   " },
        "Food Cost": { amount: "800", notes: "  clean   " },
      },
      status: "Draft",
    });

    await login(page);

    const fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    await fbPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/F&B submission sent for review/i)).toBeVisible();

    const calls = await page.evaluate(
      () => (window as unknown as { __ppSubmitCalls: unknown[] }).__ppSubmitCalls,
    );
    expect(calls).toHaveLength(1);

    const payload = calls[0] as {
      department: string;
      total: number;
      entries: Array<{ category: string; value: number; notes?: string }>;
    };

    expect(payload.department).toBe("fb");
    expect(payload.total).toBe(2300);

    const beverage = payload.entries.find((e) => e.category === "Beverage Cost");
    const food = payload.entries.find((e) => e.category === "Food Cost");

    expect(beverage?.value).toBe(1500);
    expect(beverage?.notes).toBe("stocked weekend rush");

    expect(food?.value).toBe(800);
    expect(food?.notes).toBe("clean");
  });

  test("submit excludes notes key entirely when notes normalize to empty", async ({ page }) => {
    await captureSubmits(page);

    await seedDraft(page, fbDraftKey, {
      values: {
        "Beverage Cost": { amount: "600", notes: "   \t\n   " },
      },
      status: "Draft",
    });

    await login(page);

    const fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    await fbPanel.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText(/F&B submission sent for review/i)).toBeVisible();

    const calls = await page.evaluate(
      () => (window as unknown as { __ppSubmitCalls: unknown[] }).__ppSubmitCalls,
    );
    const payload = calls[0] as { entries: Array<{ category: string; notes?: string }> };
    const beverage = payload.entries.find((e) => e.category === "Beverage Cost");

    expect(beverage).toBeDefined();
    expect(beverage).not.toHaveProperty("notes");
  });
});
