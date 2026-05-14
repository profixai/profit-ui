import { test, expect } from "../playwright-fixture";

const today = new Date().toISOString().split("T")[0];

test.describe("Inventory notes textarea — typing-time normalization", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key);
      window.sessionStorage.clear();
    }, `pp_inventory_draft_fb_${today}`);

    await page.goto("/login");
    await page.getByLabel("Username").fill("inventory");
    await page.getByLabel("Password").fill("inv2026");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: /Daily stock & cost entry/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: "F&B", selected: true })).toBeVisible();
  });

  const getNotesTextarea = (page: import("@playwright/test").Page) => {
    const fbPanel = page.getByRole("tabpanel").filter({ hasText: "Beverage Cost" });
    const beverageRow = fbPanel.locator("div.grid", { hasText: "Beverage Cost" });
    return beverageRow.locator("textarea");
  };

  test("strips leading whitespace immediately on every keystroke", async ({ page }) => {
    const notes = getNotesTextarea(page);
    await notes.click();

    // Pressing space first should never leave a leading space in the value.
    await page.keyboard.press("Space");
    await expect(notes).toHaveValue("");

    await page.keyboard.press("Space");
    await page.keyboard.press("Space");
    await expect(notes).toHaveValue("");

    // Typing a real char now produces just that char (no swallowed leading spaces).
    await page.keyboard.type("h");
    await expect(notes).toHaveValue("h");

    await page.keyboard.type("ello");
    await expect(notes).toHaveValue("hello");
  });

  test("strips trailing whitespace immediately on every keystroke", async ({ page }) => {
    const notes = getNotesTextarea(page);
    await notes.click();

    await page.keyboard.type("hello");
    await expect(notes).toHaveValue("hello");

    // A trailing space is stripped on the next assertion.
    await page.keyboard.press("Space");
    await expect(notes).toHaveValue("hello");

    await page.keyboard.press("Space");
    await page.keyboard.press("Space");
    await expect(notes).toHaveValue("hello");
  });

  test("preserves internal spacing including repeated spaces between words", async ({ page }) => {
    const notes = getNotesTextarea(page);
    await notes.click();

    // fill() sets the value in one shot, exercising the onChange normalizer once.
    await notes.fill("   hello   world   ");
    await expect(notes).toHaveValue("hello   world");

    await notes.fill("  weekend\trush  ");
    await expect(notes).toHaveValue("weekend\trush");
  });

  test("whitespace-only input never appears in the textarea", async ({ page }) => {
    const notes = getNotesTextarea(page);
    await notes.fill("          ");
    await expect(notes).toHaveValue("");
  });

  test("editing in the middle of a word does not move the cursor unexpectedly", async ({ page }) => {
    const notes = getNotesTextarea(page);
    await notes.click();
    await page.keyboard.type("hello world");
    await expect(notes).toHaveValue("hello world");

    // Move caret to position 5 (right after "hello", before the space).
    await notes.evaluate((el) => {
      const t = el as HTMLTextAreaElement;
      t.setSelectionRange(5, 5);
    });

    // Type a single character — cursor should advance by exactly 1, value should
    // grow by exactly 1, and no surrounding characters should be re-flowed.
    await page.keyboard.type("X");
    await expect(notes).toHaveValue("helloX world");

    const caretAfter = await notes.evaluate((el) => (el as HTMLTextAreaElement).selectionStart);
    expect(caretAfter).toBe(6);
  });

  test("typing inside a run of internal spaces keeps cursor stable (no collapse)", async ({ page }) => {
    const notes = getNotesTextarea(page);

    // Seed a value with a deliberate triple-space gap between words.
    await notes.fill("hello   world");
    await expect(notes).toHaveValue("hello   world");

    // Place caret in the middle of the triple space (position 7 — between the
    // 2nd and 3rd internal spaces).
    await notes.evaluate((el) => {
      const t = el as HTMLTextAreaElement;
      t.setSelectionRange(7, 7);
    });

    await page.keyboard.type("a");

    // The internal spaces must NOT collapse — cursor advances by exactly 1 and
    // the surrounding spaces are preserved.
    await expect(notes).toHaveValue("hello  a world");

    const caret = await notes.evaluate((el) => (el as HTMLTextAreaElement).selectionStart);
    expect(caret).toBe(8);
  });

  test("backspacing through a leading-space-only buffer leaves cursor at 0", async ({ page }) => {
    const notes = getNotesTextarea(page);
    await notes.click();

    // Try to type only spaces — they must never appear, so backspace has nothing to do.
    await page.keyboard.press("Space");
    await page.keyboard.press("Space");
    await page.keyboard.press("Space");
    await expect(notes).toHaveValue("");

    const caret = await notes.evaluate((el) => (el as HTMLTextAreaElement).selectionStart);
    expect(caret).toBe(0);
  });
});
